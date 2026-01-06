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
export declare class OCRService {
    private genAI;
    private model;
    private debugEnabled;
    constructor();
    private debugLog;
    extractDocumentData(fileBuffer: Buffer, documentType?: 'license' | 'id' | 'address', side?: 'front' | 'back', mimeType?: string): Promise<ExtractedDocumentData>;
    private createGeminiPrompt;
    private sanitizeExtractedData;
    private normalizeLicenseCategories;
    private pickHighestCategory;
    private normalizeLicenseCategory;
    private normalizeDateToIso;
    private fixOcrYear;
    private combineGeminiNameFields;
    private handleFallbackSystem;
    private extractLicenseDataWithFallback;
    private extractIdCardDataWithFallback;
    private extractAddressDataWithFallback;
    private fallbackRegexExtraction;
    private extractNameFromText;
    private extractDocumentNumberFromText;
    private extractDateFromText;
    private extractBirthDateFromText;
    private extractAddressFromText;
}
export declare const ocrService: OCRService;
//# sourceMappingURL=ocrService.d.ts.map