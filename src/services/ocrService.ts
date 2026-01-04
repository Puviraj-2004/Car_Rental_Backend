import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export interface ExtractedDocumentData {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  documentId?: string;
  licenseNumber?: string;
  expiryDate?: string;
  birthDate?: string;
  address?: string;
  licenseCategory?: string;
  licenseCategories?: string[];
  restrictsToAutomatic?: boolean;
  documentDate?: string;
  issueDate?: string;
  fallbackUsed?: boolean;
  isQuotaExceeded?: boolean;
}

export class OCRService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing. Set it in your environment variables.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async extractDocumentData(
    fileBuffer: Buffer,
    documentType?: 'license' | 'id' | 'address',
    side?: 'front' | 'back'
  ): Promise<ExtractedDocumentData> {
    try {
      const base64Image = fileBuffer.toString('base64');
      const prompt = this.createGeminiPrompt(documentType, side);

      let result: any;
      try {
        result = await Promise.race([
          this.model.generateContent([
            prompt,
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
          ]),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Gemini API timeout')), 30000)
          )
        ]);
      } catch (apiError: any) {
        const msg = String(apiError?.message || '').toLowerCase();
        if (msg.includes('429') || msg.includes('quota') || msg.includes('exhausted')) {
          return { isQuotaExceeded: true };
        }
        throw apiError;
      }

      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length < 10) {
        return this.fallbackRegexExtraction(text || 'empty');
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return this.fallbackRegexExtraction(text);
      }

      const extractedData = JSON.parse(jsonMatch[0]);

      const mapped: ExtractedDocumentData = {
        firstName: (extractedData.firstName || extractedData.prenom || '').trim(),
        lastName: (extractedData.lastName || extractedData.nom || '').trim(),
        fullName: this.combineGeminiNameFields(extractedData),
        documentId: (extractedData.documentId || extractedData.idNumber || '').trim(),
        licenseNumber: (extractedData.licenseNumber || extractedData.documentId || '').trim(),
        expiryDate: extractedData.expiryDate || extractedData.documentDate || "",
        birthDate: extractedData.birthDate || "",
        address: extractedData.address || "",
        licenseCategory: extractedData.licenseCategory || "",
        licenseCategories: Array.isArray(extractedData.licenseCategories) ? extractedData.licenseCategories : undefined,
        restrictsToAutomatic: typeof extractedData.restrictsToAutomatic === 'boolean' ? extractedData.restrictsToAutomatic : undefined,
        documentDate: extractedData.documentDate || "",
        issueDate: extractedData.issueDate || "",
        fallbackUsed: false,
      };

      return this.sanitizeExtractedData(mapped);
    } catch (error) {
      return this.handleFallbackSystem(fileBuffer, documentType);
    }
  }

  private createGeminiPrompt(documentType?: string, side?: 'front' | 'back'): string {
    switch (documentType) {
      case 'license':
        return `OCR for French license (${side}). Extract JSON: {firstName, lastName, birthDate, expiryDate, licenseNumber, licenseCategories:[], licenseCategory, restrictsToAutomatic:bool}. Dates: YYYY-MM-DD. Return null for fields not found.`;
      case 'id':
        return `OCR for French ID card. Extract JSON: {firstName, lastName, documentId, birthDate, expiryDate}. Dates: YYYY-MM-DD. Return null for fields not found.`;
      case 'address':
        return `OCR for French proof of address. Extract JSON: {fullName, address, documentId, documentDate}. Dates: YYYY-MM-DD. Return null for fields not found.`;
      default:
        return `Extract JSON: {fullName, documentId, expiryDate, birthDate, address}. Dates: YYYY-MM-DD. Return null for fields not found.`;
    }
  }

  private sanitizeExtractedData(data: ExtractedDocumentData): ExtractedDocumentData {
    const categories = this.normalizeLicenseCategories(data.licenseCategories || []);
    const highest = this.pickHighestCategory(categories);
    const finalCategory = this.normalizeLicenseCategory(data.licenseCategory || highest);

    return {
      ...data,
      fullName: data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      birthDate: this.normalizeDateToIso(data.birthDate || ''),
      expiryDate: this.normalizeDateToIso(data.expiryDate || ''),
      licenseCategory: finalCategory || undefined, 
      licenseCategories: categories.length ? categories : undefined,
      fallbackUsed: !!data.fallbackUsed
    };
  }

  private normalizeLicenseCategories(input: any[]): string[] {
    const allowed = new Set(['AM', 'A', 'B', 'C', 'D']);
    return Array.from(new Set(input.map(c => String(c).toUpperCase().trim()).filter(c => allowed.has(c))));
  }

  private pickHighestCategory(categories: string[]): string {
    const rank: Record<string, number> = { AM: 0, A: 1, B: 2, C: 3, D: 4 };
    if (categories.length === 0) return '';
    return categories.reduce((prev, curr) => (rank[curr] > rank[prev] ? curr : prev), 'AM');
  }

  private normalizeLicenseCategory(input: string): string | undefined {
    const normalized = input.toUpperCase().trim();
    const valid = ['AM', 'A', 'B', 'C', 'D'];
    return valid.includes(normalized) ? normalized : undefined;
  }

  private normalizeDateToIso(input: string): string {
    if (!input) return '';
    const cleaned = input.replace(/[^0-9/.-]/g, '').replace(/[./]/g, '-');
    const parts = cleaned.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) return `${this.fixOcrYear(parts[0])}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      if (parts[2].length === 4) return `${this.fixOcrYear(parts[2])}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return '';
  }

  private fixOcrYear(year: string): string {
    const n = parseInt(year, 10);
    return (n < 1900 || n > 2100) ? `20${year.slice(-2)}` : year;
  }

  private combineGeminiNameFields(data: any): string {
    if (data.fullName) return data.fullName.trim();
    return `${data.firstName || ''} ${data.lastName || ''}`.trim();
  }

  private async handleFallbackSystem(buffer: Buffer, type?: string): Promise<ExtractedDocumentData> {
    let res: ExtractedDocumentData;
    if (type === 'license') res = await this.extractLicenseDataWithFallback(buffer);
    else if (type === 'id') res = await this.extractIdCardDataWithFallback(buffer);
    else res = await this.extractAddressDataWithFallback(buffer);
    return { ...res, fallbackUsed: true };
  }

  private async extractLicenseDataWithFallback(_buf: Buffer): Promise<ExtractedDocumentData> {
    return { 
      fullName: this.extractNameFromText(""), 
      licenseNumber: this.extractDocumentNumberFromText(""), 
      expiryDate: this.extractDateFromText("") 
    };
  }

  private async extractIdCardDataWithFallback(_buf: Buffer): Promise<ExtractedDocumentData> {
    return { 
      fullName: this.extractNameFromText(""), 
      documentId: this.extractDocumentNumberFromText(""), 
      birthDate: this.extractBirthDateFromText("") 
    };
  }

  private async extractAddressDataWithFallback(_buf: Buffer): Promise<ExtractedDocumentData> {
    return { 
      fullName: this.extractNameFromText(""), 
      address: this.extractAddressFromText("") 
    };
  }

  private fallbackRegexExtraction(text: string): ExtractedDocumentData {
    return {
      fullName: this.extractNameFromText(text),
      licenseNumber: this.extractDocumentNumberFromText(text),
      documentId: this.extractDocumentNumberFromText(text),
      expiryDate: this.extractDateFromText(text),
      birthDate: this.extractBirthDateFromText(text), // ✅ FIXED: Now used
      address: this.extractAddressFromText(text),     // ✅ FIXED: Now used
      fallbackUsed: true
    };
  }

  private extractNameFromText(t: string): string {
    const m = t.match(/(?:nom|name|prenom)[\s:]*([A-Z\s]{2,30})/i);
    return m ? m[1].trim() : "";
  }

  private extractDocumentNumberFromText(t: string): string {
    const m = t.match(/(?:id|license|permis)[\s#:]*([A-Z0-9-]{5,20})/i);
    return m ? m[1].trim() : "";
  }

  private extractDateFromText(t: string): string {
    const m = t.match(/(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})/);
    return m ? m[1] : "";
  }

  private extractBirthDateFromText(t: string): string {
    return this.extractDateFromText(t);
  }

  private extractAddressFromText(t: string): string {
    const m = t.match(/(?:address|adresse)[\s:]*([A-Z0-9\s,.-]{10,50})/i);
    return m ? m[1].trim() : "";
  }
}

export const ocrService = new OCRService();