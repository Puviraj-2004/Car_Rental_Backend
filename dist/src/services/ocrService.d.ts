interface ExtractedDocumentData {
    fullName?: string;
    documentId?: string;
    expiryDate?: string;
    birthDate?: string;
    address?: string;
}
declare class OCRService {
    private client;
    constructor();
    extractDocumentData(fileBuffer: Buffer, documentType?: 'license' | 'id' | 'address'): Promise<ExtractedDocumentData>;
    private extractDriverLicenseData;
    private extractIdCardData;
    private extractAddressData;
    private extractGenericData;
    private extractNameFromText;
    private extractDocumentIdFromText;
    private extractDateFromText;
    private extractAddressFromText;
    private isValidDate;
    private formatDate;
}
export declare const ocrService: OCRService;
export { ExtractedDocumentData };
//# sourceMappingURL=ocrService.d.ts.map