import { v2 as cloudinary } from 'cloudinary';
/**
 * @param createReadStream
 * @param folder
 * @param isPrivate
 */
export declare const uploadToCloudinary: (fileStream: any, folder: string, isPrivate?: boolean) => Promise<any>;
export declare const deleteFromCloudinary: (publicId: string) => Promise<void>;
export default cloudinary;
//# sourceMappingURL=cloudinary.d.ts.map