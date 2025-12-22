import multer from 'multer';
import path from 'path';
import { promises as fs } from 'fs';

// Create uploads directory if it doesn't exist
const createUploadDir = async (dirPath: string) => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    await createUploadDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `car-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// File filter to allow only image files
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'));
  }
};

// Configure multer upload
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 10 
  }
});

// Utility function to get relative path for database storage
export const getRelativePath = (absolutePath: string): string => {
  if (!absolutePath) {
    console.error("getRelativePath received undefined path");
    return ""; // அல்லது ஒரு டிபால்ட் பாத்
  }
  const uploadsDir = path.join(__dirname, '../../uploads');
  return path.relative(uploadsDir, absolutePath);
};

// Utility function to delete uploaded files
export const deleteUploadedFile = async (relativePath: string): Promise<void> => {
  try {
    const fullPath = path.join(process.cwd(), relativePath);
    const fileExists = await fs.access(fullPath).then(() => true).catch(() => false);
    
    if (fileExists) {
      await fs.unlink(fullPath);
      console.log('Successfully deleted:', fullPath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

// Utility function to validate image files
export const validateImageFile = (file: Express.Multer.File): boolean => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  return allowedMimes.includes(file.mimetype) && file.size <= maxSize;
};
