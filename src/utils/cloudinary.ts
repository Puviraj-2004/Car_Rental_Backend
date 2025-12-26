// backend/src/utils/cloudinaryConfig.ts
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// 1. Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * @param createReadStream 
 * @param folder 
 * @param isPrivate 
 */
export const uploadToCloudinary = async (
  fileStream: any, 
  folder: string,
  isPrivate: boolean = false
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `car_rental_industrial/${folder}`,
        type: isPrivate ? 'authenticated' : 'upload', 
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Error:', error);
          return reject(error);
        }
        resolve(result);
      }
    );

    fileStream.pipe(stream); 
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    if (publicId) {
      const result = await cloudinary.uploader.destroy(publicId);
      console.log(`Deleted from Cloudinary: ${publicId}`, result);
    }
  } catch (error) {
    console.error('Cloudinary Delete Error:', error);
  }
};

export default cloudinary;