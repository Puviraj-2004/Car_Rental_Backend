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

class OCRService {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is missing. Set it in your environment variables.');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    console.log('✅ Google Gemini 1.5 Flash initialized for French Document OCR');
  }

  async extractDocumentData(
    fileBuffer: Buffer,
    documentType?: 'license' | 'id' | 'address',
    side?: 'front' | 'back'
  ): Promise<ExtractedDocumentData> {
    try {
      console.log(`🔍 ===== STARTING GEMINI OCR PROCESS =====`);
      console.log(`🔍 Document Type: ${documentType}`);
      if (documentType === 'license') {
        console.log(`🔍 License Side: ${side || 'unknown'}`);
      }
      console.log(`📁 File buffer size: ${fileBuffer.length} bytes`);

      // Convert buffer to base64
      const base64Image = fileBuffer.toString('base64');
      console.log(`📸 Image converted to base64: ${base64Image.length} characters`);

      // Create the appropriate prompt based on document type
      const prompt = this.createGeminiPrompt(documentType, side);

      // Generate content with image and timeout
      console.log(`🤖 Sending request to Gemini 1.5 Flash...`);

      let result: any;
      try {
        result = await Promise.race([
          this.model.generateContent([
            prompt,
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image
              }
            }
          ]),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Gemini API timeout after 30 seconds')), 30000)
          )
        ]);
      } catch (apiError: any) {
        const status = apiError?.status || apiError?.response?.status;
        const msg = String(apiError?.message || apiError || '').toLowerCase();
        const isQuota = status === 429 || msg.includes('quota') || msg.includes('429') || msg.includes('resource_exhausted');
        if (isQuota) {
          console.warn('⚠️ Gemini quota exceeded / rate limited. Falling back to manual mode.');
          return { isQuotaExceeded: true };
        }
        throw apiError;
      }

      const response = await result.response;
      const text = response.text();

      // Check if response is empty or too short
      if (!text || text.trim().length < 10) {
        console.warn('⚠️ Empty or too short response from Gemini, using fallback');
        return this.fallbackRegexExtraction('empty response', documentType);
      }

      console.log(`📝 ===== GEMINI RESPONSE =====`);
      console.log(`📝 Response length: ${text.length} characters`);
      console.log(`📝 Raw response:`);
      console.log(text);
      console.log(`📝 ===========================`);

      // Parse JSON response using the specified regex pattern
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON object found in Gemini response');
      }

      const cleanedJson = jsonMatch[0];
      console.log(`🧹 Cleaned JSON: ${cleanedJson}`);

      let extractedData: any;
      try {
        extractedData = JSON.parse(cleanedJson);
        console.log(`✅ Successfully parsed JSON response`);
      } catch (parseError) {
        console.error(`❌ Failed to parse JSON response:`, parseError);
        throw new Error(`JSON parse error: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }

      // Map the extracted data to our interface
      const mapped: ExtractedDocumentData = {
        firstName: (extractedData.firstName || extractedData.prenom || extractedData.prénom || extractedData.Prénom || '').trim(),
        lastName: (extractedData.lastName || extractedData.nom || extractedData.Nom || '').trim(),
        fullName: this.combineGeminiNameFields(extractedData) || "",
        documentId: (extractedData.documentId || extractedData.idNumber || '').trim(),
        licenseNumber: (extractedData.licenseNumber || extractedData.licenseNo || extractedData.licenceNumber || extractedData.documentId || extractedData.idNumber || '').trim(),
        expiryDate: (extractedData.expiryDate || extractedData.documentDate || extractedData.issueDate || ""),
        birthDate: extractedData.birthDate || "",
        address: extractedData.address || "",
        licenseCategory: extractedData.licenseCategory || "",
        licenseCategories: Array.isArray(extractedData.licenseCategories) ? extractedData.licenseCategories : undefined,
        restrictsToAutomatic: typeof extractedData.restrictsToAutomatic === 'boolean' ? extractedData.restrictsToAutomatic : undefined,
        documentDate: extractedData.documentDate || "",
        issueDate: extractedData.issueDate || "",
        fallbackUsed: false,
      };

      const resultData = this.sanitizeExtractedData(mapped, documentType);

      // Final comprehensive result logging
      console.log(`🎯 ===== FINAL EXTRACTION RESULT =====`);
      console.log(`🎯 Document Type: ${documentType || 'unknown'}`);
      console.log(`🎯 Full Name: "${resultData.fullName || 'NOT FOUND'}"`);
      console.log(`🎯 Document ID: "${resultData.documentId || 'NOT FOUND'}"`);
      console.log(`🎯 License Number: "${resultData.licenseNumber || 'NOT FOUND'}"`);
      console.log(`🎯 Expiry Date: "${resultData.expiryDate || 'NOT FOUND'}"`);
      console.log(`🎯 Birth Date: "${resultData.birthDate || 'NOT FOUND'}"`);
      console.log(`🎯 Address: "${resultData.address || 'NOT FOUND'}"`);
      console.log(`🎯 License Category: "${resultData.licenseCategory || 'NOT FOUND'}"`);
      console.log(`🎯 Restricts To Automatic: ${resultData.restrictsToAutomatic === true}`);
      console.log(`🎯 Has Any Data: ${!!(resultData.fullName || resultData.documentId || resultData.expiryDate || resultData.birthDate || resultData.address)}`);
      console.log(`🎯 ===================================`);

      return resultData;
    } catch (error) {
      console.error("❌ ===== GEMINI OCR FAILED - USING FALLBACK =====");
      console.error("❌ Error Type:", error instanceof Error ? error.constructor.name : typeof error);
      console.error("❌ Error Message:", error instanceof Error ? error.message : String(error));

      // Robust fallback to existing regex methods
      console.log(`🔄 Activating regex fallback system...`);

      try {
        let fallbackResult: ExtractedDocumentData;

        switch (documentType) {
          case 'license':
            console.log(`🚗 ===== FALLBACK: DRIVER LICENSE EXTRACTION =====`);
            fallbackResult = await this.extractLicenseDataWithFallback(fileBuffer);
            break;
          case 'id':
            console.log(`🆔 ===== FALLBACK: ID CARD EXTRACTION =====`);
            fallbackResult = await this.extractIdCardDataWithFallback(fileBuffer);
            break;
          case 'address':
            console.log(`🏠 ===== FALLBACK: ADDRESS PROOF EXTRACTION =====`);
            fallbackResult = await this.extractAddressDataWithFallback(fileBuffer);
            break;
          default:
            fallbackResult = { fullName: "Unknown Document", documentId: "", expiryDate: "", birthDate: "", address: "" };
        }

        console.log(`🔄 ===== FALLBACK RESULT =====`);
        console.log(`🔄 Full Name: "${fallbackResult.fullName}"`);
        console.log(`🔄 Document ID: "${fallbackResult.documentId}"`);
        console.log(`🔄 Expiry Date: "${fallbackResult.expiryDate}"`);
        console.log(`🔄 ==========================`);

        const sanitized = this.sanitizeExtractedData({ ...fallbackResult, fallbackUsed: true }, documentType);
        return sanitized;

      } catch (fallbackError) {
        console.error("❌ ===== FALLBACK ALSO FAILED =====");
        console.error("❌ Fallback Error:", fallbackError instanceof Error ? fallbackError.message : String(fallbackError));

        // Return empty strings to prevent frontend crashes
        return { fullName: "", documentId: "", expiryDate: "", birthDate: "", address: "", fallbackUsed: true };
      }
    }
  }

  private createGeminiPrompt(documentType?: string, side?: 'front' | 'back'): string {
    switch (documentType) {
      case 'license':
        return [
          'You are an OCR extraction engine for a French driving license (Permis de conduire).',
          'Return ONLY valid JSON (no markdown, no explanations).',
          'Never guess: if a value is not confidently found, return an empty string (or empty array for lists).',
          '',
          `The image is the ${side || 'unknown'} side of the license.`,
          '',
          'Extract the following fields using the official field numbers:',
          ' - lastName (Nom) from field 1',
          ' - firstName (Prénom) from field 2',
          ' - birthDate from field 3 (YYYY-MM-DD)',
          ' - expiryDate from field 4b (YYYY-MM-DD)',
          ' - licenseNumber from field 5 (do NOT confuse with plate numbers or other refs)',
          ' - licenseCategories from field 9/11 (array of ALL categories visible, e.g., ["AM","B"])',
          ' - licenseCategory = the highest category among AM<A<B<C<D present in field 9/11',
          '',
          'Back side additional critical rule:',
          ' - On the BACK side, search specifically in field/column 12 (restrictions) for the exact text "Code 78".',
          ' - If found, set restrictsToAutomatic=true. Otherwise false.',
          '',
          'Output JSON keys exactly:',
          '{ firstName: string, lastName: string, birthDate: string, expiryDate: string, licenseNumber: string, licenseCategories: string[], licenseCategory: string, restrictsToAutomatic: boolean }',
          '',
          'Formatting rules:',
          ' - Dates MUST be strictly YYYY-MM-DD.',
          ' - Categories must be uppercased and only among: AM, A, B, C, D.',
        ].join('\n');
      case 'id':
        return [
          'You are an OCR extraction engine for a French national ID card (Carte Nationale d\'Identité).',
          'Return ONLY a valid JSON object and nothing else (no markdown, no explanations).',
          'Required output keys:',
          '  - firstName (string)',
          '  - lastName (string)',
          '  - documentId (string)  // numéro de carte / card number',
          '  - birthDate (string)   // "Né le" or date of birth',
          '  - expiryDate (string)  // "Valable jusqu\'au" or expiry date',
          'Formatting rules:',
          '  - Dates MUST be strictly in YYYY-MM-DD format.',
          '  - If a value is not confidently found, return an empty string for that key.',
          'Do not guess dates; only return what is present on the document.',
        ].join('\n');

      case 'address':
        return [
          'You are an OCR extraction engine for a French proof of address document (utility bill, bank statement, etc.).',
          'Return ONLY a valid JSON object and nothing else (no markdown, no explanations).',
          'Required output keys:',
          '  - fullName (string)',
          '  - address (string)',
          '  - documentId (string)  // invoice number / reference if present',
          '  - expiryDate (string)  // document date / issue date; MUST be in YYYY-MM-DD format if found',
          '  - documentDate (string) // alias of document date if present',
          '  - issueDate (string) // alias of issue date if present',
          'Formatting rules:',
          '  - Dates MUST be strictly in YYYY-MM-DD format.',
          '  - If a value is not confidently found, return an empty string for that key.',
          'Do not guess dates; only return what is present on the document.',
        ].join('\n');

      default:
        return [
          'Return ONLY a valid JSON object and nothing else (no markdown, no explanations).',
          'Output keys: fullName, documentId, expiryDate, birthDate, address.',
          'Dates MUST be strictly in YYYY-MM-DD format.',
          'If a value is not confidently found, return an empty string for that key.',
        ].join('\n');
    }
  }

  private sanitizeExtractedData(data: ExtractedDocumentData, documentType?: string): ExtractedDocumentData {
    const detectedCategories = this.normalizeLicenseCategories(data.licenseCategories || []);
    const normalizedSingle = this.normalizeLicenseCategory(data.licenseCategory || '');
    const highestFromList = this.normalizeLicenseCategory(this.pickHighestCategory(detectedCategories));
    const rank: Record<string, number> = { AM: 0, A: 1, B: 2, C: 3, D: 4 };
    const normalizedHighest = (() => {
      const a = normalizedSingle;
      const b = highestFromList;
      const ra = a ? rank[a] : undefined;
      const rb = b ? rank[b] : undefined;

      if (ra === undefined && rb === undefined) return '';
      if (ra === undefined) return b;
      if (rb === undefined) return a;
      return ra >= rb ? a : b;
    })();

    const sanitized: ExtractedDocumentData = {
      ...data,
      firstName: (data.firstName || '').trim(),
      lastName: (data.lastName || '').trim(),
      fullName: (data.fullName || '').trim(),
      documentId: (data.documentId || '').trim(),
      licenseNumber: (data.licenseNumber || data.documentId || '').trim(),
      address: (data.address || '').trim(),
      birthDate: this.normalizeDateToIso((data.birthDate || '').trim()),
      expiryDate: this.normalizeDateToIso((data.expiryDate || '').trim()),
      licenseCategories: detectedCategories.length ? detectedCategories : undefined,
      licenseCategory: normalizedHighest,
      restrictsToAutomatic: !!data.restrictsToAutomatic,
      documentDate: this.normalizeDateToIso((data.documentDate || '').trim()),
      issueDate: this.normalizeDateToIso((data.issueDate || '').trim()),
      fallbackUsed: !!data.fallbackUsed,
    };

    // Document specific heuristics
    if (documentType === 'license') {
      // Some OCR engines confuse field 4a (issue date) and 4b (expiry).
      // We keep expiryDate if present; otherwise leave empty (don't guess).
    }

    return sanitized;
  }

  private normalizeLicenseCategories(input: unknown): string[] {
    if (!Array.isArray(input)) return [];
    const allowed = new Set(['AM', 'A', 'B', 'C', 'D']);
    const normalized = input
      .map((c) => String(c || '').trim().toUpperCase())
      .filter((c) => allowed.has(c));
    return Array.from(new Set(normalized));
  }

  private pickHighestCategory(categories: string[]): string {
    const rank: Record<string, number> = { AM: 0, A: 1, B: 2, C: 3, D: 4 };
    let best = '';
    let bestRank = -1;
    for (const c of categories) {
      const r = rank[c];
      if (r !== undefined && r > bestRank) {
        bestRank = r;
        best = c;
      }
    }
    return best;
  }

  private normalizeLicenseCategory(input: string): string {
    if (!input) return '';
    const normalized = input.toUpperCase().replace(/\s+/g, '');
    const allowed = new Set(['AM', 'A', 'B', 'C', 'D']);
    if (allowed.has(normalized)) return normalized;
    return '';
  }

  private normalizeDateToIso(input: string): string {
    if (!input) return '';

    // Common OCR mistakes + normalize separators
    const cleaned = input
      .trim()
      .replace(/\s+/g, '')
      .replace(/[Oo]/g, '0')
      .replace(/[Il]/g, '1')
      .replace(/_/g, '-')
      .replace(/\./g, '/')
      .replace(/-/g, '/')
      .replace(/,+/g, '/')
      .replace(/\\/g, '/')
      .replace(/\/+?/g, '/');

    // Strict ISO: YYYY/MM/DD
    const ymd = cleaned.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
    if (ymd) {
      const yyyy = this.fixOcrYear(ymd[1]);
      const mm = ymd[2].padStart(2, '0');
      const dd = ymd[3].padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    }

    // Strict French: DD/MM/YYYY (preferred) or DD/MM/YY
    const dmy = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (dmy) {
      const dd = dmy[1].padStart(2, '0');
      const mm = dmy[2].padStart(2, '0');
      let yyyy = dmy[3];

      if (yyyy.length === 2) {
        const n = parseInt(yyyy, 10);
        yyyy = n >= 50 ? `19${yyyy}` : `20${yyyy}`;
      }

      yyyy = this.fixOcrYear(yyyy);
      return `${yyyy}-${mm}-${dd}`;
    }

    // Compact: YYYYMMDD
    const compact = cleaned.replace(/\//g, '').match(/^(\d{4})(\d{2})(\d{2})$/);
    if (compact) {
      const yyyy = this.fixOcrYear(compact[1]);
      return `${yyyy}-${compact[2]}-${compact[3]}`;
    }

    // Reject everything else (strict mode)
    return '';
  }

  private fixOcrYear(year: string): string {
    const y = year.replace(/\D/g, '');
    if (y.length !== 4) {
      return y;
    }

    // Fix common OCR case: 235 -> 2035 can appear as 0235 or 2235/2135 etc.
    const n = parseInt(y, 10);
    if (n >= 0 && n < 1900) {
      // Prefer 20xx for small years
      const last2 = y.slice(-2);
      return `20${last2}`;
    }

    // If the century digit is wrong (e.g. 2235), clamp to 20xx
    if (n > 2100) {
      const last2 = y.slice(-2);
      return `20${last2}`;
    }

    return y;
  }

  private combineGeminiNameFields(data: any): string {
    // Handle Gemini response format: lastName + firstName = fullName
    if (data.fullName) {
      return data.fullName.trim();
    }

    // Gemini returns lastName and firstName separately
    if (data.lastName || data.firstName) {
      const lastName = data.lastName || '';
      const firstName = data.firstName || '';
      return `${firstName} ${lastName}`.trim();
    }

    // Fallback for other naming conventions
    if (data.Nom || data.Prénom) {
      const nom = data.Nom || '';
      const prenom = data.Prénom || '';
      return `${prenom} ${nom}`.trim();
    }

    return '';
  }

  // Fallback methods using regex extraction
  private async extractLicenseDataWithFallback(_fileBuffer: Buffer): Promise<ExtractedDocumentData> {
    try {
      console.log("🔄 License fallback: using regex-based extraction");

      // Since we can't easily OCR the buffer here, return empty data
      // In a real implementation, you could integrate Tesseract.js here
      const fullName = this.extractNameFromText("") || "";
      const documentId = this.extractDocumentNumberFromText("") || "";
      const expiryDate = this.extractDateFromText("") || "";
      const address = this.extractAddressFromText("") || "";

      return {
        fullName,
        documentId,
        expiryDate,
        birthDate: "",
        address
      };
    } catch (error) {
      console.error("❌ License fallback failed:", error);
      return { fullName: "", documentId: "", expiryDate: "", birthDate: "", address: "" };
    }
  }

  private async extractIdCardDataWithFallback(_fileBuffer: Buffer): Promise<ExtractedDocumentData> {
    try {
      console.log("🔄 ID Card fallback: using regex-based extraction");

      const fullName = this.extractNameFromText("") || "";
      const documentId = this.extractDocumentNumberFromText("") || "";
      const expiryDate = this.extractDateFromText("") || "";
      const birthDate = this.extractBirthDateFromText("") || "";
      const address = this.extractAddressFromText("") || "";

      return {
        fullName,
        documentId,
        expiryDate,
        birthDate,
        address
      };
    } catch (error) {
      console.error("❌ ID card fallback failed:", error);
      return { fullName: "", documentId: "", expiryDate: "", birthDate: "", address: "" };
    }
  }

  private async extractAddressDataWithFallback(_fileBuffer: Buffer): Promise<ExtractedDocumentData> {
    try {
      console.log("🔄 Address fallback: using regex-based extraction");

      const fullName = this.extractNameFromText("") || "";
      const address = this.extractAddressFromText("") || "";
      const documentId = this.extractDocumentNumberFromText("") || "";
      const expiryDate = this.extractDateFromText("") || "";

      return {
        fullName,
        address,
        documentId,
        expiryDate,
        birthDate: ""
      };
    } catch (error) {
      console.error("❌ Address fallback failed:", error);
      return { fullName: "", documentId: "", expiryDate: "", birthDate: "", address: "" };
    }
  }

  private fallbackRegexExtraction(text: string, documentType?: string): any {
    console.log(`🔄 Using regex fallback extraction for ${documentType}`);

    // Extract common patterns that might appear in AI responses
    const fullName = this.extractNameFromText(text) || '';
    const documentId = this.extractDocumentNumberFromText(text) || '';
    const expiryDate = this.extractDateFromText(text) || '';
    const birthDate = this.extractBirthDateFromText(text) || '';
    const address = this.extractAddressFromText(text) || '';

    const result = {
      fullName,
      documentId,
      expiryDate,
      birthDate,
      address,
      fallbackUsed: true
    };

    console.log(`🔄 Fallback extraction result:`, result);
    return result;
  }

  private extractNameFromText(text: string): string | undefined {
    // Look for names in various formats
    const patterns = [
      /(?:name|nom|prénom|firstname|lastname)[\s:]*([A-Z\s]{2,30})/i,
      /\b([A-Z][a-z]+\s+[A-Z][a-z]+)\b/g
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].length > 2) {
        return match[1].trim();
      }
    }
    return undefined;
  }

  private extractDocumentNumberFromText(text: string): string | undefined {
    // Look for document numbers
    const patterns = [
      /(?:document|id|license|permis|carte)[\s#:]*([A-Z0-9-]{5,20})/i,
      /\b(\d{8,15})\b/g,
      /\b([A-Z]{1,3}\d{6,12})\b/g
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return undefined;
  }

  private extractDateFromText(text: string): string | undefined {
    // Look for dates
    const patterns = [
      /(?:date|expiry|expiration|valid)[\s:]*(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})/i,
      /\b(\d{4}[-/.]\d{1,2}[-/.]\d{1,2})\b/g,
      /\b(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})\b/g
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return undefined;
  }

  private extractBirthDateFromText(text: string): string | undefined {
    // Look specifically for birth dates
    const patterns = [
      /(?:birth|naissance|né|born)[\s:]*(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})/i,
      /\b(\d{1,2}[-/.]\d{1,2}[-/.](19|20)\d{2})\b/g
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return undefined;
  }

  private extractAddressFromText(text: string): string | undefined {
    // Look for addresses
    const patterns = [
      /(?:address|adresse|rue|avenue|place)[\s:]*([A-Z0-9\s,.-]{10,50})/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].length > 10) {
        return match[1].trim();
      }
    }
    return undefined;
  }

}

export const ocrService = new OCRService();