"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
exports.revalidateCloudinaryCredentials = revalidateCloudinaryCredentials;
exports.isCloudinaryReady = isCloudinaryReady;
exports.getCloudinaryDiagnostics = getCloudinaryDiagnostics;
// backend/src/utils/cloudinaryConfig.ts
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// 1. Cloudinary Configuration
// Sanitize and validate env values (strip quotes, trim). Support CLOUDINARY_URL if provided
const rawCloudNameFromEnv = process.env.CLOUDINARY_CLOUD_NAME || '';
let cloudName = rawCloudNameFromEnv.replace(/"/g, '').trim();
let apiKey = (process.env.CLOUDINARY_API_KEY || '').replace(/"/g, '').trim();
let apiSecret = (process.env.CLOUDINARY_API_SECRET || '').replace(/"/g, '').trim();
// If CLOUDINARY_URL is provided, parse it and override values. Format: cloudinary://<api_key>:<api_secret>@<cloud_name>
const cloudinaryUrl = (process.env.CLOUDINARY_URL || '').trim();
if (cloudinaryUrl) {
    try {
        const m = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
        if (m) {
            apiKey = m[1];
            apiSecret = m[2];
            cloudName = m[3];
            console.log('CLOUDINARY_URL parsed. Using cloud_name=' + cloudName);
        }
        else {
            console.warn('CLOUDINARY_URL found but could not parse it. Expected: cloudinary://<api_key>:<api_secret>@<cloud_name>');
        }
    }
    catch (err) {
        console.warn('Error parsing CLOUDINARY_URL:', err);
    }
}
if (!cloudName || !apiKey || !apiSecret) {
    console.warn('Cloudinary env vars missing or invalid. Verify CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET or CLOUDINARY_URL in .env');
}
// For validation we check a lowercase char class, but keep the original cloudName for exact matching in the SDK
if (cloudName && !/^[a-z0-9\-]+$/.test(cloudName.toLowerCase())) {
    console.warn(`Cloudinary cloud_name "${cloudName}" looks unusual. Confirm the cloud name from your Cloudinary dashboard (case-sensitive).`);
}
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
cloudinary_1.v2.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
});
// Helpful diagnostic (non-secret) for debugging invalid cloud name issues
console.log(`Cloudinary configured with cloud_name=${cloudName}`);
let cloudinaryReady = true;
let lastCloudinaryValidationError = null;
async function revalidateCloudinaryCredentials() {
    if (!cloudName || !apiKey || !apiSecret) {
        cloudinaryReady = false;
        lastCloudinaryValidationError = new Error('Missing Cloudinary credentials');
        console.warn('Cloudinary disabled: missing credentials');
        return getCloudinaryDiagnostics();
    }
    try {
        await cloudinary_1.v2.api.resources({ max_results: 1 });
        console.log('Cloudinary credentials validated (able to list resources).');
        cloudinaryReady = true;
        lastCloudinaryValidationError = null;
    }
    catch (err) {
        lastCloudinaryValidationError = err;
        cloudinaryReady = false;
        console.error('Cloudinary credential validation failed:', err);
        if (err && err.http_code === 401) {
            console.error('Cloudinary authentication failed (401). Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in your .env');
        }
        else if (err && /Invalid cloud_name/i.test(err.message || '')) {
            console.error('Cloudinary reports invalid cloud_name. Verify the exact cloud name from your Cloudinary dashboard (case-sensitive).');
        }
        console.warn('Falling back to local file storage for uploads until Cloudinary credentials are fixed.');
    }
    return getCloudinaryDiagnostics();
}
// Initial validation on startup
(async () => {
    await revalidateCloudinaryCredentials();
})();
function isCloudinaryReady() {
    return cloudinaryReady;
}
function getCloudinaryDiagnostics() {
    return {
        cloudName: cloudName || null,
        ready: cloudinaryReady,
        lastError: lastCloudinaryValidationError ? (lastCloudinaryValidationError.message || String(lastCloudinaryValidationError)) : null
    };
}
/**
 * Upload with fallback to local disk when Cloudinary is unavailable
 */
const uploadToCloudinary = async (fileInput, folder, isPrivate = false, originalFilename) => {
    if (!cloudinaryReady) {
        // Save to local uploads folder
        const uploadsDir = path_1.default.join(process.cwd(), 'uploads', 'car_rental_industrial', folder);
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        const ext = originalFilename ? path_1.default.extname(originalFilename) : '.jpg';
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
        const fullPath = path_1.default.join(uploadsDir, safeName);
        if (Buffer.isBuffer(fileInput)) {
            // If input is a Buffer, write it directly
            fs_1.default.writeFileSync(fullPath, fileInput);
        }
        else if (fileInput && typeof fileInput.pipe === 'function') {
            // If input is a Stream, pipe it
            await new Promise((resolve, reject) => {
                const ws = fs_1.default.createWriteStream(fullPath);
                fileInput.pipe(ws);
                ws.on('finish', resolve);
                ws.on('error', reject);
            });
        }
        else {
            throw new Error('Unsupported file input type');
        }
        const publicPath = path_1.default.join('car_rental_industrial', folder, safeName).replace(/\\/g, '/');
        const secureUrl = `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`}/uploads/${publicPath}`;
        console.log(`Saved upload locally at ${fullPath}`);
        return { secure_url: secureUrl, public_id: `local:uploads/${publicPath}`, url: secureUrl };
    }
    return new Promise(async (resolve, reject) => {
        const stream = cloudinary_1.v2.uploader.upload_stream({
            folder: `car_rental_industrial/${folder}`,
            type: isPrivate ? 'authenticated' : 'upload',
            resource_type: 'auto',
        }, async (error, result) => {
            if (error) {
                console.error('Cloudinary Upload Error:', error);
                // Mark Cloudinary as unavailable and store last error
                cloudinaryReady = false;
                lastCloudinaryValidationError = error;
                console.warn('Disabling Cloudinary and falling back to local storage due to upload error.');
                // Fallback: save locally and return a compatible object
                try {
                    const uploadsDir = path_1.default.join(process.cwd(), 'uploads', 'car_rental_industrial', folder);
                    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
                    const ext = originalFilename ? path_1.default.extname(originalFilename) : '.jpg';
                    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
                    const fullPath = path_1.default.join(uploadsDir, safeName);
                    // Handle both Buffer and Stream for fallback
                    if (Buffer.isBuffer(fileInput)) {
                        // If input was a Buffer, write it directly
                        fs_1.default.writeFileSync(fullPath, fileInput);
                    }
                    else if (fileInput && typeof fileInput.pipe === 'function') {
                        // If input was a Stream, check if it's still readable
                        if (!fileInput.readable) {
                            console.error('Original file stream is not readable for local fallback. Please retry the upload.');
                            return reject(new Error('Upload failed and fallback is not available; retry the upload.'));
                        }
                        if (Buffer.isBuffer(fileInput)) {
                            // If input was a Buffer, write it directly
                            fs_1.default.writeFileSync(fullPath, fileInput);
                        }
                        else if (fileInput && typeof fileInput.pipe === 'function') {
                            // If input was a Stream, pipe it
                            await new Promise((res, rej) => {
                                const ws = fs_1.default.createWriteStream(fullPath);
                                fileInput.pipe(ws);
                                ws.on('finish', res);
                                ws.on('error', rej);
                            });
                        }
                        else {
                            console.error('Unsupported file input type for fallback');
                            return reject(new Error('Unsupported file input type'));
                        }
                    }
                    else {
                        console.error('Unsupported file input type for fallback');
                        return reject(new Error('Unsupported file input type'));
                    }
                    const publicPath = path_1.default.join('car_rental_industrial', folder, safeName).replace(/\\/g, '/');
                    const secureUrl = `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`}/uploads/${publicPath}`;
                    console.log(`Saved upload locally at ${fullPath} as fallback`);
                    return resolve({ secure_url: secureUrl, public_id: `local:uploads/${publicPath}`, url: secureUrl });
                }
                catch (fallbackErr) {
                    console.error('Local fallback save failed:', fallbackErr);
                    return reject(error);
                }
            }
            resolve(result);
        });
        // Handle both Buffer and Stream inputs
        if (Buffer.isBuffer(fileInput)) {
            // If input is a Buffer, create a readable stream from it
            const { Readable } = require('stream');
            const readableStream = Readable.from(fileInput);
            readableStream.pipe(stream);
        }
        else if (fileInput && typeof fileInput.pipe === 'function') {
            // If input is a Stream, pipe it directly
            fileInput.pipe(stream);
        }
        else {
            reject(new Error('Unsupported file input type'));
        }
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId)
            return;
        if (publicId.startsWith('local:')) {
            // Remove local file
            const localPath = publicId.replace(/^local:/, '').replace(/\\/g, '/').replace(/^uploads\//, '');
            const fullPath = path_1.default.join(process.cwd(), 'uploads', localPath);
            try {
                fs_1.default.unlinkSync(fullPath);
                console.log(`Deleted local upload: ${fullPath}`);
            }
            catch (err) {
                console.warn(`Failed to delete local upload ${fullPath}:`, err);
            }
            return;
        }
        const result = await cloudinary_1.v2.uploader.destroy(publicId);
        console.log(`Deleted from Cloudinary: ${publicId}`, result);
    }
    catch (error) {
        console.error('Cloudinary Delete Error:', error);
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
exports.default = cloudinary_1.v2;
//# sourceMappingURL=cloudinary.js.map