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
    extractDocumentData(fileBuffer: Buffer): Promise<ExtractedDocumentData>;
}
export declare const ocrService: OCRService;
export { ExtractedDocumentData };
//# sourceMappingURL=ocrService.d.ts.map