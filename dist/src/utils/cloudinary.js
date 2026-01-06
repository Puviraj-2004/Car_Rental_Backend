"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
exports.revalidateCloudinaryCredentials = revalidateCloudinaryCredentials;
exports.isCloudinaryReady = isCloudinaryReady;
exports.getCloudinaryDiagnostics = getCloudinaryDiagnostics;
const cloudinary_1 = require("cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// 1. Cloudinary Configuration
// Sanitize and validate environment values
const rawCloudNameFromEnv = process.env.CLOUDINARY_CLOUD_NAME || '';
let cloudName = rawCloudNameFromEnv.replace(/"/g, '').trim();
let apiKey = (process.env.CLOUDINARY_API_KEY || '').replace(/"/g, '').trim();
let apiSecret = (process.env.CLOUDINARY_API_SECRET || '').replace(/"/g, '').trim();
// Parse CLOUDINARY_URL if provided
const cloudinaryUrl = (process.env.CLOUDINARY_URL || '').trim();
if (cloudinaryUrl) {
    try {
        const m = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
        if (m) {
            apiKey = m[1];
            apiSecret = m[2];
            cloudName = m[3];
        }
        else {
        }
    }
    catch (err) {
        // Error parsing CLOUDINARY_URL - will use individual env vars instead
    }
}
if (!cloudName || !apiKey || !apiSecret) {
}
// Validate cloud name format
if (cloudName && !/^[a-z0-9\-]+$/.test(cloudName.toLowerCase())) {
    // Invalid cloud name format
}
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
cloudinary_1.v2.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    timeout: 120000,
});
// Cloudinary configuration completed
let cloudinaryReady = true;
let lastCloudinaryValidationError = null;
async function revalidateCloudinaryCredentials() {
    if (!cloudName || !apiKey || !apiSecret) {
        cloudinaryReady = false;
        lastCloudinaryValidationError = new Error('Missing Cloudinary credentials');
        return getCloudinaryDiagnostics();
    }
    try {
        await cloudinary_1.v2.api.resources({ max_results: 1 });
        // Credentials validated successfully
        cloudinaryReady = true;
        lastCloudinaryValidationError = null;
    }
    catch (error) {
        lastCloudinaryValidationError = error;
        cloudinaryReady = false;
        // Credential validation failed - errors handled through diagnostics
    }
    return getCloudinaryDiagnostics();
}
// Validate credentials on startup
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
        // Fallback: save to local uploads folder
        const uploadsDir = path_1.default.join(process.cwd(), 'uploads', 'car_rental_industrial', folder);
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        const ext = originalFilename ? path_1.default.extname(originalFilename) : '.jpg';
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
        const fullPath = path_1.default.join(uploadsDir, safeName);
        if (Buffer.isBuffer(fileInput)) {
            fs_1.default.writeFileSync(fullPath, fileInput);
        }
        else if (fileInput && typeof fileInput.pipe === 'function') {
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
        // Upload saved locally
        return { secure_url: secureUrl, public_id: `local:uploads/${publicPath}`, url: secureUrl };
    }
    const saveLocallyAndReturn = async () => {
        const uploadsDir = path_1.default.join(process.cwd(), 'uploads', 'car_rental_industrial', folder);
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        const ext = originalFilename ? path_1.default.extname(originalFilename) : '.jpg';
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
        const fullPath = path_1.default.join(uploadsDir, safeName);
        if (Buffer.isBuffer(fileInput)) {
            fs_1.default.writeFileSync(fullPath, fileInput);
        }
        else if (fileInput && typeof fileInput.pipe === 'function') {
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
        // Upload saved locally
        return { secure_url: secureUrl, public_id: `local:uploads/${publicPath}`, url: secureUrl };
    };
    const attemptUpload = async (attempt) => {
        return new Promise((resolve, reject) => {
            const stream = cloudinary_1.v2.uploader.upload_stream({
                folder: `car_rental_industrial/${folder}`,
                type: isPrivate ? 'authenticated' : 'upload',
                resource_type: 'auto',
            }, (error, result) => {
                if (error)
                    return reject(error);
                return resolve(result);
            });
            // Handle both Buffer and Stream inputs
            if (Buffer.isBuffer(fileInput)) {
                const { Readable } = require('stream');
                Readable.from(fileInput).pipe(stream);
            }
            else if (fileInput && typeof fileInput.pipe === 'function') {
                fileInput.pipe(stream);
            }
            else {
                reject(new Error('Unsupported file input type'));
            }
        }).catch(async (error) => {
            const httpCode = error?.http_code;
            const name = error?.name;
            const message = String(error?.message || '');
            const isTimeout = httpCode === 499 || name === 'TimeoutError' || /timeout/i.test(message);
            // Retry once on transient timeouts
            if (isTimeout && attempt < 2) {
                return attemptUpload(attempt + 1);
            }
            // Only disable Cloudinary on auth/config errors; timeouts are transient.
            if (httpCode === 401 || /invalid cloud_name/i.test(message)) {
                cloudinaryReady = false;
                lastCloudinaryValidationError = error;
                // Disabling Cloudinary, falling back to local storage (warning removed)
            }
            else {
                lastCloudinaryValidationError = error;
            }
            try {
                return await saveLocallyAndReturn();
            }
            catch (fallbackErr) {
                throw error;
            }
        });
    };
    return attemptUpload(1);
};
exports.uploadToCloudinary = uploadToCloudinary;
const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId)
            return;
        if (publicId.startsWith('local:')) {
            // Clean up local file
            const localPath = publicId.replace(/^local:/, '').replace(/\\/g, '/').replace(/^uploads\//, '');
            const fullPath = path_1.default.join(process.cwd(), 'uploads', localPath);
            try {
                fs_1.default.unlinkSync(fullPath);
            }
            catch (err) {
            }
            return;
        }
        await cloudinary_1.v2.uploader.destroy(publicId);
    }
    catch (error) {
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
exports.default = cloudinary_1.v2;
//# sourceMappingURL=cloudinary.js.map