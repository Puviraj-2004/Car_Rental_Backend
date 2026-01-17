"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ocrService = exports.OCRService = void 0;
const generative_ai_1 = require("@google/generative-ai");
class OCRService {
    genAI;
    model;
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is missing. Set it in your environment variables.');
        }
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "models/gemini-2.5-flash-lite" });
    }
    async extractDocumentData(fileBuffer, documentType, side, mimeType) {
        console.log('--- STARTING OCR REQUEST ---');
        try {
            const base64Image = fileBuffer.toString('base64');
            const prompt = this.createGeminiPrompt(documentType, side);
            const safeMimeType = mimeType && mimeType.trim().length > 0 ? mimeType : 'image/jpeg';
            console.log(' SENDING TO GEMINI...');
            console.log(' Safe MIME Type:', safeMimeType);
            console.log(' Document Type:', documentType);
            console.log(' Side:', side);
            console.log(' Buffer Length:', fileBuffer.length);
            const result = await this.model.generateContent([
                prompt,
                { inlineData: { data: base64Image, mimeType: safeMimeType } }
            ]);
            const response = await result.response;
            const text = response.text().replace(/```json|```/g, "").trim();
            console.log('--- RAW AI ---', text, '--- RAW END ---');
            if (!text || text.trim().length < 10) {
                console.log(' Response too short/empty -> fallbackUsed');
                return { fallbackUsed: true };
            }
            let extractedData;
            try {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                const cleanedJson = jsonMatch ? jsonMatch[0] : text;
                extractedData = JSON.parse(cleanedJson);
            }
            catch (e) {
                console.error(' JSON PARSE ERROR:', e);
                console.log(' Failed JSON Text:', text);
                return { fallbackUsed: true };
            }
            console.log(' Parsed JSON:', extractedData);
            const rawLicenseCategories = extractedData?.licenseCategories;
            const mergedLicenseCategories = Array.isArray(rawLicenseCategories) ? rawLicenseCategories : [];
            const mapped = {
                firstName: (extractedData.firstName || extractedData.prenom || '').trim(),
                lastName: (extractedData.lastName || extractedData.nom || '').trim(),
                fullName: this.combineGeminiNameFields(extractedData),
                documentId: (extractedData.documentId || extractedData.idNumber || '').trim(),
                licenseNumber: (extractedData.licenseNumber || extractedData.documentId || '').trim(),
                expiryDate: extractedData.expiryDate || extractedData.documentDate || "",
                birthDate: extractedData.birthDate || "",
                address: extractedData.address || "",
                licenseCategories: mergedLicenseCategories,
                restrictsToAutomatic: typeof extractedData.restrictsToAutomatic === 'boolean' ? extractedData.restrictsToAutomatic : undefined,
                documentDate: extractedData.documentDate || "",
                issueDate: extractedData.issueDate || "",
                fallbackUsed: false,
            };
            const sanitized = this.sanitizeExtractedData(mapped);
            console.log(' Sanitized extracted data:', sanitized);
            return sanitized;
        }
        catch (error) {
            console.error(' OCR ERROR:', error.message);
            console.error(' ERROR STACK:', error.stack);
            console.log(' FALLING BACK TO SYSTEM');
            return this.handleFallbackSystem(fileBuffer, documentType);
        }
    }
    createGeminiPrompt(documentType, side) {
        const jsonInstruction = "Return ONLY a valid JSON object. No markdown, no prose, no explanations.";
        switch (documentType) {
            case 'license':
                if (side === 'front') {
                    return `Extract data from FRONT of this French Driving License (Permis de Conduire).
          Fields mapping:
          - Field 1 (NOM): lastName
          - Field 2 (Prénoms): firstName
          - Field 3 (Né le): birthDate (Format: YYYY-MM-DD)
          - Field 4a (Date de délivrance): issueDate (Format: YYYY-MM-DD)
          - Field 4b (Date d'expiration): expiryDate (Format: YYYY-MM-DD)
          - Field 5 (N° du permis): licenseNumber
          
          Required JSON Structure:
          {
            "lastName": "string",
            "firstName": "string",
            "birthDate": "YYYY-MM-DD",
            "issueDate": "YYYY-MM-DD",
            "expiryDate": "YYYY-MM-DD",
            "licenseNumber": "string"
          }
          ${jsonInstruction}`;
                }
                else {
                    return `Analyze BACK of this French Driving License.
          Look at 2x5 table (Categories A to E).
          Identify categories that have a date or stamp next to them (Columns 10, 11, or 12).
          
          Required JSON Structure:
          {
            "licenseCategories": ["string"]
          }
          Example: ["AM", "B", "BE"]
          ${jsonInstruction}`;
                }
            case 'id':
                if (side === 'front') {
                    return `Extract data from FRONT of this French National ID Card (CNI).
          Instructions:
          - "Nom": lastName
          - "Prénom": firstName  
          - "Né(e) le": birthDate (Format: YYYY-MM-DD)
          - "N° du document": documentId
          - "Expire le" or "Valable jusqu'au": expiryDate (Format: YYYY-MM-DD)
          
          Required JSON Structure:
          {
            "lastName": "string",
            "firstName": "string", 
            "birthDate": "YYYY-MM-DD",
            "documentId": "string",
            "expiryDate": "YYYY-MM-DD"
          }
          ${jsonInstruction}`;
                }
                else {
                    return `Extract data from BACK of this French National ID Card (CNI).
          Instructions:
          - "Adresse": address (street, city, postal code)
          - "Valable jusqu'au" or "Date d'expiration": expiryDate
          
          Required JSON Structure:
          {
            "address": "string",
            "expiryDate": "YYYY-MM-DD"
          }
          ${jsonInstruction}`;
                }
            case 'address':
                return `Extract data from this French Proof of Address (e.g., EDF bill, Water bill, or Tax notice).
        Identify:
        1. The Main Subscriber/Contract Holder name (usually under 'Titulaire' or in address block).
        2. The full residential address.
        3. The 'Date de facture' or 'Date d'émission' (Issue Date).
        
        Required JSON Structure:
        {
          "lastName": "string",
          "firstName": "string",
          "address": "string",
          "documentDate": "YYYY-MM-DD"
        }
        ${jsonInstruction}`;
            default:
                return `Analyze image and return a JSON object with any visible identity information. ${jsonInstruction}`;
        }
    }
    sanitizeExtractedData(data) {
        const categories = this.normalizeLicenseCategories(data.licenseCategories || []);
        const highest = this.pickHighestCategory(categories);
        const finalCategory = this.normalizeLicenseCategory(highest);
        return {
            ...data,
            fullName: data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
            birthDate: data.birthDate ? this.normalizeDateToIso(data.birthDate) : '',
            issueDate: data.issueDate ? this.normalizeDateToIso(data.issueDate) : '',
            expiryDate: data.expiryDate ? this.normalizeDateToIso(data.expiryDate) : '',
            licenseCategory: finalCategory || undefined,
            licenseCategories: data.licenseCategories || undefined,
            fallbackUsed: !!data.fallbackUsed
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
        // Handle DD/MM/YYYY, DD.MM.YYYY, DD-MM-YYYY formats
        const cleaned = input.replace(/[^0-9/.-]/g, '');
        const parts = cleaned.split(/[./-]/);
        if (parts.length === 3) {
            let day, month, year;
            // Check if it's DD/MM/YYYY or DD.MM.YYYY format (day first)
            if (parts[0].length <= 2 && parts[1].length <= 2) {
                day = parts[0].padStart(2, '0');
                month = parts[1].padStart(2, '0');
                year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            }
            else if (parts[2].length <= 2 && parts[1].length <= 2) {
                // Check if it's YYYY/MM/DD format (year first)
                year = parts[0];
                month = parts[1].padStart(2, '0');
                day = parts[2].padStart(2, '0');
            }
            else if (parts[0].length === 4) {
                // YYYY/MM/DD format
                year = this.fixOcrYear(parts[0]);
                month = parts[1].padStart(2, '0');
                day = parts[2].padStart(2, '0');
            }
            else if (parts[2].length === 4) {
                // DD/MM/YYYY format
                year = this.fixOcrYear(parts[2]);
                month = parts[1].padStart(2, '0');
                day = parts[0].padStart(2, '0');
            }
            else {
                return '';
            }
            // Validate date
            const parsedDate = new Date(`${year}-${month}-${day}`);
            if (isNaN(parsedDate.getTime()))
                return '';
            return `${year}-${month}-${day}`;
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
            expiryDate: this.extractDateFromText(""),
            issueDate: this.extractDateFromText("")
        };
    }
    async extractIdCardDataWithFallback(_buf) {
        return {
            fullName: this.extractNameFromText(""),
            documentId: this.extractDocumentNumberFromText(""),
            birthDate: this.extractBirthDateFromText(""),
            issueDate: this.extractDateFromText("")
        };
    }
    async extractAddressDataWithFallback(_buf) {
        return {
            fullName: this.extractNameFromText(""),
            address: this.extractAddressFromText(""),
            documentId: this.extractDocumentNumberFromText(""),
            documentDate: this.extractDateFromText("")
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