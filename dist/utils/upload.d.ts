import multer from 'multer';
export declare const upload: multer.Multer;
export declare const getRelativePath: (absolutePath: string) => string;
export declare const deleteUploadedFile: (relativePath: string) => Promise<void>;
export declare const validateImageFile: (file: Express.Multer.File) => boolean;
//# sourceMappingURL=upload.d.ts.map