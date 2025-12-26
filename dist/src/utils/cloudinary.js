"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
// backend/src/utils/cloudinaryConfig.ts
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// 1. Cloudinary Configuration
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
/**
 * @param createReadStream
 * @param folder
 * @param isPrivate
 */
const uploadToCloudinary = async (fileStream, folder, isPrivate = false) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({
            folder: `car_rental_industrial/${folder}`,
            type: isPrivate ? 'authenticated' : 'upload',
            resource_type: 'auto',
        }, (error, result) => {
            if (error) {
                console.error('Cloudinary Upload Error:', error);
                return reject(error);
            }
            resolve(result);
        });
        fileStream.pipe(stream);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
const deleteFromCloudinary = async (publicId) => {
    try {
        if (publicId) {
            const result = await cloudinary_1.v2.uploader.destroy(publicId);
            console.log(`Deleted from Cloudinary: ${publicId}`, result);
        }
    }
    catch (error) {
        console.error('Cloudinary Delete Error:', error);
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
exports.default = cloudinary_1.v2;
//# sourceMappingURL=cloudinary.js.map