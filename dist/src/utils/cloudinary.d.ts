import { v2 as cloudinary } from 'cloudinary';
export declare function revalidateCloudinaryCredentials(): Promise<{
    cloudName: string | null;
    ready: boolean;
    lastError: any;
}>;
export declare function isCloudinaryReady(): boolean;
export declare function getCloudinaryDiagnostics(): {
    cloudName: string | null;
    ready: boolean;
    lastError: any;
};
/**
 * Upload with fallback to local disk when Cloudinary is unavailable
 */
export declare const uploadToCloudinary: (fileStream: any, folder: string, isPrivate?: boolean, originalFilename?: string) => Promise<any>;
export declare const deleteFromCloudinary: (publicId: string) => Promise<void>;
export default cloudinary;
//# sourceMappingURL=cloudinary.d.ts.map