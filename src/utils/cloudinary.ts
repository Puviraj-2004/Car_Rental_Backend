import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

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
    } else {
    }
  } catch (err) {
    // Error parsing CLOUDINARY_URL - will use individual env vars instead
  }
}

if (!cloudName || !apiKey || !apiSecret) {
}

// Validate cloud name format
if (cloudName && !/^[a-z0-9\-]+$/.test(cloudName.toLowerCase())) {
  // Invalid cloud name format
}

import fs from 'fs';
import path from 'path';

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  timeout: 120000,
});

// Cloudinary configuration completed

let cloudinaryReady = true;
let lastCloudinaryValidationError: any = null;

export async function revalidateCloudinaryCredentials() {
  if (!cloudName || !apiKey || !apiSecret) {
    cloudinaryReady = false;
    lastCloudinaryValidationError = new Error('Missing Cloudinary credentials');
    return getCloudinaryDiagnostics();
  }

  try {
    await cloudinary.api.resources({ max_results: 1 });
    // Credentials validated successfully
    cloudinaryReady = true;
    lastCloudinaryValidationError = null;
  } catch (error: unknown) {
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

export function isCloudinaryReady() {
  return cloudinaryReady;
}

export function getCloudinaryDiagnostics() {
  return {
    cloudName: cloudName || null,
    ready: cloudinaryReady,
    lastError: lastCloudinaryValidationError ? (lastCloudinaryValidationError.message || String(lastCloudinaryValidationError)) : null
  };
}

/**
 * Upload with fallback to local disk when Cloudinary is unavailable
 */
export const uploadToCloudinary = async (
  fileInput: Buffer | any,
  folder: string,
  isPrivate: boolean = false,
  originalFilename?: string
): Promise<any> => {
  if (!cloudinaryReady) {
    // Fallback: save to local uploads folder
    const uploadsDir = path.join(process.cwd(), 'uploads', 'car_rental_industrial', folder);
    fs.mkdirSync(uploadsDir, { recursive: true });

    const ext = originalFilename ? path.extname(originalFilename) : '.jpg';
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const fullPath = path.join(uploadsDir, safeName);

    if (Buffer.isBuffer(fileInput)) {
      fs.writeFileSync(fullPath, fileInput);
    } else if (fileInput && typeof fileInput.pipe === 'function') {
      await new Promise((resolve, reject) => {
        const ws = fs.createWriteStream(fullPath);
        fileInput.pipe(ws);
        ws.on('finish', resolve);
        ws.on('error', reject);
      });
    } else {
      throw new Error('Unsupported file input type');
    }

    const publicPath = path.join('car_rental_industrial', folder, safeName).replace(/\\/g, '/');
    const secureUrl = `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`}/uploads/${publicPath}`;
    // Upload saved locally
    return { secure_url: secureUrl, public_id: `local:uploads/${publicPath}`, url: secureUrl };
  }

  const saveLocallyAndReturn = async () => {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'car_rental_industrial', folder);
    fs.mkdirSync(uploadsDir, { recursive: true });

    const ext = originalFilename ? path.extname(originalFilename) : '.jpg';
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const fullPath = path.join(uploadsDir, safeName);

    if (Buffer.isBuffer(fileInput)) {
      fs.writeFileSync(fullPath, fileInput);
    } else if (fileInput && typeof fileInput.pipe === 'function') {
      await new Promise((resolve, reject) => {
        const ws = fs.createWriteStream(fullPath);
        fileInput.pipe(ws);
        ws.on('finish', resolve);
        ws.on('error', reject);
      });
    } else {
      throw new Error('Unsupported file input type');
    }

    const publicPath = path.join('car_rental_industrial', folder, safeName).replace(/\\/g, '/');
    const secureUrl = `${process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 4000}`}/uploads/${publicPath}`;
    // Upload saved locally
    return { secure_url: secureUrl, public_id: `local:uploads/${publicPath}`, url: secureUrl };
  };

  const attemptUpload = async (attempt: number): Promise<any> => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `car_rental_industrial/${folder}`,
          type: isPrivate ? 'authenticated' : 'upload',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          return resolve(result);
        }
      );

      // Handle both Buffer and Stream inputs
      if (Buffer.isBuffer(fileInput)) {
        const { Readable } = require('stream');
        Readable.from(fileInput).pipe(stream);
      } else if (fileInput && typeof fileInput.pipe === 'function') {
        fileInput.pipe(stream);
      } else {
        reject(new Error('Unsupported file input type'));
      }
    }).catch(async (error) => {
      const httpCode = (error as any)?.http_code;
      const name = (error as any)?.name;
      const message = String((error as any)?.message || '');
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
      } else {
        lastCloudinaryValidationError = error;
      }

      try {
        return await saveLocallyAndReturn();
      } catch (fallbackErr) {
        throw error;
      }
    });
  };

  return attemptUpload(1);
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    if (!publicId) return;

    if (publicId.startsWith('local:')) {
      // Clean up local file
      const localPath = publicId.replace(/^local:/, '').replace(/\\/g, '/').replace(/^uploads\//, '');
      const fullPath = path.join(process.cwd(), 'uploads', localPath);
      try {
        fs.unlinkSync(fullPath);
      } catch (err) {
      }
      return;
    }

    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
  }
};

export default cloudinary;