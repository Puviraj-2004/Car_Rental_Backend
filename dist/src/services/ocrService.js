"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocrService = exports.OCRService = void 0;
const generative_ai_1 = require("@google/generative-ai");
class OCRService {
    genAI;
    model;
    debugEnabled;
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is missing. Set it in your environment variables.');
        }
        this.debugEnabled = String(process.env.DEBUG_OCR || '').toLowerCase() === 'true';
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-flash-lite-latest' });
    }
    debugLog(_message, _data) {
        if (!this.debugEnabled)
            return;
    }
    async extractDocumentData(fileBuffer, documentType, side, mimeType) {
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
            let result; // Keep as any for OCR API response flexibility
            try {
                result = await Promise.race([
                    this.model.generateContent([
                        prompt,
                        { inlineData: { mimeType: safeMimeType, data: base64Image } }
                    ]),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Gemini API timeout')), 30000))
                ]);
            }
            catch (apiError) {
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
            let extractedData;
            try {
                extractedData = JSON.parse(jsonMatch[0]);
            }
            catch (e) {
                this.debugLog('JSON.parse failed -> fallbackRegexExtraction', {
                    error: e?.message,
                    jsonPreview: jsonMatch[0]?.slice(0, 500),
                });
                return this.fallbackRegexExtraction(text);
            }
            this.debugLog('Parsed JSON', extractedData);
            const rawLicenseCategory = extractedData?.licenseCategory;
            const rawLicenseCategories = extractedData?.licenseCategories;
            const mergedLicenseCategories = Array.from(new Set([
                ...(Array.isArray(rawLicenseCategories) ? rawLicenseCategories : []),
                ...(Array.isArray(rawLicenseCategory) ? rawLicenseCategory : []),
            ]));
            const mapped = {
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
        }
        catch (error) {
            this.debugLog('Unhandled OCRService error -> handleFallbackSystem', {
                message: error?.message,
                name: error?.name,
            });
            return this.handleFallbackSystem(fileBuffer, documentType);
        }
    }
    createGeminiPrompt(documentType, side) {
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
    sanitizeExtractedData(data) {
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
    normalizeLicenseCategories(input) {
        const allowed = new Set([
            'AM',
            'A1', 'A2', 'A',
            'B1', 'B', 'BE',
            'C1', 'C', 'C1E', 'CE',
            'D1', 'D', 'D1E', 'DE',
        ]);
        return Array.from(new Set(input
            .map((c) => String(c).toUpperCase().trim())
            .map((c) => c.replace(/\s+/g, ''))
            .filter((c) => allowed.has(c))));
    }
    pickHighestCategory(categories) {
        const rank = {
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
        if (categories.length === 0)
            return '';
        return categories.reduce((prev, curr) => (rank[curr] > rank[prev] ? curr : prev), 'AM');
    }
    normalizeLicenseCategory(input) {
        if (!input || typeof input !== 'string')
            return undefined;
        const normalized = input.toUpperCase().trim();
        const valid = ['AM', 'A1', 'A2', 'A', 'B1', 'B', 'BE', 'C1', 'C', 'C1E', 'CE', 'D1', 'D', 'D1E', 'DE'];
        return valid.includes(normalized) ? normalized : undefined;
    }
    normalizeDateToIso(input) {
        if (!input)
            return '';
        const cleaned = input.replace(/[^0-9/.-]/g, '').replace(/[./]/g, '-');
        const parts = cleaned.split('-');
        if (parts.length === 3) {
            if (parts[0].length === 4)
                return `${this.fixOcrYear(parts[0])}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
            if (parts[2].length === 4)
                return `${this.fixOcrYear(parts[2])}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        return '';
    }
    fixOcrYear(year) {
        const n = parseInt(year, 10);
        return (n < 1900 || n > 2100) ? `20${year.slice(-2)}` : year;
    }
    combineGeminiNameFields(data) {
        if (data.fullName)
            return data.fullName.trim();
        return `${data.firstName || ''} ${data.lastName || ''}`.trim();
    }
    async handleFallbackSystem(buffer, type) {
        let res;
        if (type === 'license')
            res = await this.extractLicenseDataWithFallback(buffer);
        else if (type === 'id')
            res = await this.extractIdCardDataWithFallback(buffer);
        else
            res = await this.extractAddressDataWithFallback(buffer);
        return { ...res, fallbackUsed: true };
    }
    async extractLicenseDataWithFallback(_buf) {
        return {
            fullName: this.extractNameFromText(""),
            licenseNumber: this.extractDocumentNumberFromText(""),
            expiryDate: this.extractDateFromText("")
        };
    }
    async extractIdCardDataWithFallback(_buf) {
        return {
            fullName: this.extractNameFromText(""),
            documentId: this.extractDocumentNumberFromText(""),
            birthDate: this.extractBirthDateFromText("")
        };
    }
    async extractAddressDataWithFallback(_buf) {
        return {
            fullName: this.extractNameFromText(""),
            address: this.extractAddressFromText("")
        };
    }
    fallbackRegexExtraction(text) {
        return {
            fullName: this.extractNameFromText(text),
            licenseNumber: this.extractDocumentNumberFromText(text),
            documentId: this.extractDocumentNumberFromText(text),
            expiryDate: this.extractDateFromText(text),
            birthDate: this.extractBirthDateFromText(text), // ✅ FIXED: Now used
            address: this.extractAddressFromText(text), // ✅ FIXED: Now used
            fallbackUsed: true
        };
    }
    extractNameFromText(t) {
        const m = t.match(/(?:nom|name|prenom)[\s:]*([A-Z\s]{2,30})/i);
        return m ? m[1].trim() : "";
    }
    extractDocumentNumberFromText(t) {
        const m = t.match(/(?:id|license|permis)[\s#:]*([A-Z0-9-]{5,20})/i);
        return m ? m[1].trim() : "";
    }
    extractDateFromText(t) {
        const m = t.match(/(\d{1,2}[-/.]\d{1,2}[-/.]\d{4})/);
        return m ? m[1] : "";
    }
    extractBirthDateFromText(t) {
        return this.extractDateFromText(t);
    }
    extractAddressFromText(t) {
        const m = t.match(/(?:address|adresse)[\s:]*([A-Z0-9\s,.-]{10,50})/i);
        return m ? m[1].trim() : "";
    }
}
exports.OCRService = OCRService;
exports.ocrService = new OCRService();
//# sourceMappingURL=ocrService.js.map