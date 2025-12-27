"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const database_1 = __importDefault(require("../utils/database"));
const cloudinary_1 = __importStar(require("../utils/cloudinary"));
async function main() {
    console.log('Starting migration of local uploads to Cloudinary...');
    // Ensure Cloudinary is available
    await (0, cloudinary_1.revalidateCloudinaryCredentials)();
    if (!(0, cloudinary_1.isCloudinaryReady)()) {
        console.error('Cloudinary is not ready. Fix credentials in .env and re-run this script.');
        process.exit(1);
    }
    const images = await database_1.default.carImage.findMany({ where: { publicId: { startsWith: 'local:' } } });
    console.log(`Found ${images.length} local images to migrate.`);
    for (const img of images) {
        try {
            const publicIdRaw = img.publicId || '';
            const relativePath = publicIdRaw.replace(/^local:/, ''); // e.g. uploads/car_rental_industrial/cars/..png
            const filePath = path_1.default.join(process.cwd(), relativePath);
            if (!fs_1.default.existsSync(filePath)) {
                console.warn(`File does not exist on disk, skipping: ${filePath}`);
                continue;
            }
            console.log(`Uploading ${filePath} -> Cloudinary...`);
            const result = await cloudinary_1.default.uploader.upload(filePath, { folder: 'car_rental_industrial/cars', resource_type: 'auto' });
            if (!result || !result.public_id) {
                console.warn(`Upload did not return expected result for ${filePath}`, result);
                continue;
            }
            // Update DB record
            await database_1.default.carImage.update({ where: { id: img.id }, data: { imagePath: result.secure_url, publicId: result.public_id } });
            console.log(`Updated DB record ${img.id} -> ${result.public_id}`);
            // Remove local file
            try {
                fs_1.default.unlinkSync(filePath);
                console.log(`Deleted local file ${filePath}`);
            }
            catch (err) {
                console.warn('Failed to delete local file after upload', err);
            }
        }
        catch (err) {
            console.error(`Failed to migrate image ${img.id}`, err);
        }
    }
    console.log('Migration complete.');
    process.exit(0);
}
main().catch(err => { console.error('Migration failed:', err); process.exit(1); });
//# sourceMappingURL=migrateLocalUploads.js.map