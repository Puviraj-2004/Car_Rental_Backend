// backend/src/utils/cloudinaryConfig.ts
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

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
    } else {
      console.warn('CLOUDINARY_URL found but could not parse it. Expected: cloudinary://<api_key>:<api_secret>@<cloud_name>');
    }
  } catch (err) {
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

import fs from 'fs';
import path from 'path';

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  timeout: 120000,
});

// Helpful diagnostic (non-secret) for debugging invalid cloud name issues
console.log(`Cloudinary configured with cloud_name=${cloudName}`);

let cloudinaryReady = true;
let lastCloudinaryValidationError: any = null;

export async function revalidateCloudinaryCredentials() {
  if (!cloudName || !apiKey || !apiSecret) {
    cloudinaryReady = false;
    lastCloudinaryValidationError = new Error('Missing Cloudinary credentials');
    console.warn('Cloudinary disabled: missing credentials');
    return getCloudinaryDiagnostics();
  }

  try {
    await cloudinary.api.resources({ max_results: 1 });
    console.log('Cloudinary credentials validated (able to list resources).');
    cloudinaryReady = true;
    lastCloudinaryValidationError = null;
  } catch (err: any) {
    lastCloudinaryValidationError = err;
    cloudinaryReady = false;
    console.error('Cloudinary credential validation failed:', err);
    if (err && err.http_code === 401) {
      console.error('Cloudinary authentication failed (401). Check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in your .env');
    } else if (err && /Invalid cloud_name/i.test(err.message || '')) {
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
    // Save to local uploads folder
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
    console.log(`Saved upload locally at ${fullPath}`);
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
    console.log(`Saved upload locally at ${fullPath}`);
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

      // Retry once on transient timeouts (do not permanently disable Cloudinary)
      if (isTimeout && attempt < 2) {
        console.warn(`Cloudinary upload timed out (attempt ${attempt}). Retrying...`);
        return attemptUpload(attempt + 1);
      }

      console.error('Cloudinary Upload Error:', error);

      // Only disable Cloudinary on auth/config errors; timeouts are transient.
      if (httpCode === 401 || /invalid cloud_name/i.test(message)) {
        cloudinaryReady = false;
        lastCloudinaryValidationError = error;
        console.warn('Disabling Cloudinary due to authentication/config error. Falling back to local storage.');
      } else {
        lastCloudinaryValidationError = error;
        console.warn('Falling back to local storage due to Cloudinary upload error.');
      }

      try {
        return await saveLocallyAndReturn();
      } catch (fallbackErr) {
        console.error('Local fallback save failed:', fallbackErr);
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
      // Remove local file
      const localPath = publicId.replace(/^local:/, '').replace(/\\/g, '/').replace(/^uploads\//, '');
      const fullPath = path.join(process.cwd(), 'uploads', localPath);
      try {
        fs.unlinkSync(fullPath);
        console.log(`Deleted local upload: ${fullPath}`);
      } catch (err) {
        console.warn(`Failed to delete local upload ${fullPath}:`, err);
      }
      return;
    }

    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Deleted from Cloudinary: ${publicId}`, result);
  } catch (error) {
    console.error('Cloudinary Delete Error:', error);
  }
};

export default cloudinary;