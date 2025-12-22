"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateImageFile = exports.deleteUploadedFile = exports.getRelativePath = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = require("fs");
// Create uploads directory if it doesn't exist
const createUploadDir = async (dirPath) => {
    try {
        await fs_1.promises.access(dirPath);
    }
    catch {
        await fs_1.promises.mkdir(dirPath, { recursive: true });
    }
};
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: async (_req, _file, cb) => {
        const uploadPath = path_1.default.join(__dirname, '../../uploads');
        await createUploadDir(uploadPath);
        cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path_1.default.extname(file.originalname);
        const filename = `car-${uniqueSuffix}${extension}`;
        cb(null, filename);
    }
});
// File filter to allow only image files
const fileFilter = (_req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
    }
};
// Configure multer upload
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 10
    }
});
// Utility function to get relative path for database storage
const getRelativePath = (absolutePath) => {
    if (!absolutePath) {
        console.error("getRelativePath received undefined path");
        return ""; // அல்லது ஒரு டிபால்ட் பாத்
    }
    const uploadsDir = path_1.default.join(__dirname, '../../uploads');
    return path_1.default.relative(uploadsDir, absolutePath);
};
exports.getRelativePath = getRelativePath;
// Utility function to delete uploaded files
const deleteUploadedFile = async (relativePath) => {
    try {
        const fullPath = path_1.default.join(process.cwd(), relativePath);
        const fileExists = await fs_1.promises.access(fullPath).then(() => true).catch(() => false);
        if (fileExists) {
            await fs_1.promises.unlink(fullPath);
            console.log('Successfully deleted:', fullPath);
        }
    }
    catch (error) {
        console.error('Error deleting file:', error);
    }
};
exports.deleteUploadedFile = deleteUploadedFile;
// Utility function to validate image files
const validateImageFile = (file) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    return allowedMimes.includes(file.mimetype) && file.size <= maxSize;
};
exports.validateImageFile = validateImageFile;
//# sourceMappingURL=upload.js.map