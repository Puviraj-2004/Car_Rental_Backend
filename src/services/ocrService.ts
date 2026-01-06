import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { OCRResult } from '../types/graphql';

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
  private debugEnabled: boolean;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing. Set it in your environment variables.');
    }
    this.debugEnabled = String(process.env.DEBUG_OCR || '').toLowerCase() === 'true';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });
  }

  private debugLog(_message: string, _data?: unknown) {
    if (!this.debugEnabled) return;
  }

  async extractDocumentData(
    fileBuffer: Buffer,
    documentType?: 'license' | 'id' | 'address',
    side?: 'front' | 'back',
    mimeType?: string
  ): Promise<ExtractedDocumentData> {
    try {
      const base64Image = fileBuffer.toString('base64');
      const prompt = this.createGeminiPrompt(documentType, side);
      const safeMimeType = mimeType && mimeType.trim().length > 0 ? mimeType : 'image/jpeg';

      this.debugLog('Request prepared', {
        documentType,
        side,
        mimeType: safeMimeType,
        bufferBytes: fileBuffer.length,
        base64Chars: base64Image.length,
      });
      this.debugLog('Prompt', prompt);

      let result: any; // Keep as any for OCR API response flexibility
      try {
        result = await Promise.race([
          this.model.generateContent([
            prompt,
            { inlineData: { mimeType: safeMimeType, data: base64Image } }
          ]),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Gemini API timeout')), 30000)
          )
        ]);
      } catch (apiError: any) {
        const msg = String(apiError?.message || '').toLowerCase();
        this.debugLog('Gemini API error', {
          message: apiError?.message,
          name: apiError?.name,
          status: apiError?.status,
          code: apiError?.code,
        });
        if (msg.includes('429') || msg.includes('quota') || msg.includes('exhausted')) {
          return { isQuotaExceeded: true };
        }
        throw apiError;
      }

      const response = await result.response;
      const text = response.text();

      this.debugLog('Gemini response received', {
        textLength: text?.length || 0,
        textPreview: text ? text.slice(0, 500) : '',
      });

      if (!text || text.trim().length < 10) {
        this.debugLog('Response too short/empty -> fallbackRegexExtraction');
        return this.fallbackRegexExtraction(text || 'empty');
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        this.debugLog('No JSON object found in response -> fallbackRegexExtraction');
        return this.fallbackRegexExtraction(text);
      }

      let extractedData: Partial<OCRResult>;
      try {
        extractedData = JSON.parse(jsonMatch[0]);
      } catch (e: any) {
        this.debugLog('JSON.parse failed -> fallbackRegexExtraction', {
          error: e?.message,
          jsonPreview: jsonMatch[0]?.slice(0, 500),
        });
        return this.fallbackRegexExtraction(text);
      }

      this.debugLog('Parsed JSON', extractedData);

      const rawLicenseCategory = (extractedData as any)?.licenseCategory;
      const rawLicenseCategories = (extractedData as any)?.licenseCategories;
      const mergedLicenseCategories = Array.from(
        new Set([
          ...(Array.isArray(rawLicenseCategories) ? rawLicenseCategories : []),
          ...(Array.isArray(rawLicenseCategory) ? rawLicenseCategory : []),
        ])
      );

      const mapped: ExtractedDocumentData = {
        firstName: (extractedData.firstName || extractedData.prenom || '').trim(),
        lastName: (extractedData.lastName || extractedData.nom || '').trim(),
        fullName: this.combineGeminiNameFields(extractedData),
        documentId: (extractedData.documentId || extractedData.idNumber || '').trim(),
        licenseNumber: (extractedData.licenseNumber || extractedData.documentId || '').trim(),
        expiryDate: extractedData.expiryDate || extractedData.documentDate || "",
        birthDate: extractedData.birthDate || "",
        address: extractedData.address || "",
        licenseCategory: typeof rawLicenseCategory === 'string' ? rawLicenseCategory : "",
        licenseCategories: mergedLicenseCategories.length ? mergedLicenseCategories : undefined,
        restrictsToAutomatic: typeof extractedData.restrictsToAutomatic === 'boolean' ? extractedData.restrictsToAutomatic : undefined,
        documentDate: extractedData.documentDate || "",
        issueDate: extractedData.issueDate || "",
        fallbackUsed: false,
      };

      const sanitized = this.sanitizeExtractedData(mapped);
      this.debugLog('Sanitized extracted data', sanitized);
      return sanitized;
    } catch (error) {
      this.debugLog('Unhandled OCRService error -> handleFallbackSystem', {
        message: (error as any)?.message,
        name: (error as any)?.name,
      });
      return this.handleFallbackSystem(fileBuffer, documentType);
    }
  }

  private createGeminiPrompt(documentType?: string, side?: 'front' | 'back'): string {
    switch (documentType) {
      case 'license':
        return `OCR for French driving license (${side}). Extract JSON ONLY: {firstName, lastName, birthDate, expiryDate, licenseNumber, licenseCategories:[], licenseCategory, restrictsToAutomatic:bool}.

Rules:
- Return ONLY categories that are explicitly visible/printed on the document (e.g. AM, A1, A2, A, B1, B, BE, C1, C, C1E, CE, D1, D, D1E, DE). Do NOT guess.
- If you cannot clearly read categories, return licenseCategories: [] and licenseCategory: null.
- Dates must be YYYY-MM-DD.
- Return null for fields not found.
`;
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

    // Heuristic: if model returns an implausibly large set of categories,
    // treat categories as unreliable and avoid auto-prefill.
    const maxReasonableCategories = 6;
    const categoriesAreSuspicious = categories.length > maxReasonableCategories;

    return {
      ...data,
      fullName: data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      birthDate: this.normalizeDateToIso(data.birthDate || ''),
      expiryDate: this.normalizeDateToIso(data.expiryDate || ''),
      licenseCategory: categoriesAreSuspicious ? undefined : (finalCategory || undefined),
      licenseCategories: categoriesAreSuspicious ? undefined : (categories.length ? categories : undefined),
      fallbackUsed: !!data.fallbackUsed || categoriesAreSuspicious
    };
  }

  private normalizeLicenseCategories(input: (string | undefined)[]): string[] {
    const allowed = new Set([
      'AM',
      'A1', 'A2', 'A',
      'B1', 'B', 'BE',
      'C1', 'C', 'C1E', 'CE',
      'D1', 'D', 'D1E', 'DE',
    ]);

    return Array.from(
      new Set(
        input
          .map((c) => String(c).toUpperCase().trim())
          .map((c) => c.replace(/\s+/g, ''))
          .filter((c) => allowed.has(c))
      )
    );
  }

  private pickHighestCategory(categories: string[]): string {
    const rank: Record<string, number> = {
      AM: 0,

      A1: 10,
      A2: 11,
      A: 12,

      B1: 20,
      B: 21,
      BE: 22,

      C1: 30,
      C: 31,
      C1E: 32,
      CE: 33,

      D1: 40,
      D: 41,
      D1E: 42,
      DE: 43,
    };
    if (categories.length === 0) return '';
    return categories.reduce((prev, curr) => (rank[curr] > rank[prev] ? curr : prev), 'AM');
  }

  private normalizeLicenseCategory(input: string): string | undefined {
    if (!input || typeof input !== 'string') return undefined;
    const normalized = input.toUpperCase().trim();
    const valid = ['AM', 'A1', 'A2', 'A', 'B1', 'B', 'BE', 'C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'];
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

  private combineGeminiNameFields(data: Partial<OCRResult>): string {
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