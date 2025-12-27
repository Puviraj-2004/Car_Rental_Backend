import path from 'path';
import fs from 'fs';
import prisma from '../utils/database';
import cloudinary, { isCloudinaryReady, revalidateCloudinaryCredentials } from '../utils/cloudinary';

async function main() {
  console.log('Starting migration of local uploads to Cloudinary...');

  // Ensure Cloudinary is available
  await revalidateCloudinaryCredentials();
  if (!isCloudinaryReady()) {
    console.error('Cloudinary is not ready. Fix credentials in .env and re-run this script.');
    process.exit(1);
  }

  const images = await prisma.carImage.findMany({ where: { publicId: { startsWith: 'local:' } } });
  console.log(`Found ${images.length} local images to migrate.`);

  for (const img of images) {
    try {
      const publicIdRaw = img.publicId || '';
      const relativePath = publicIdRaw.replace(/^local:/, ''); // e.g. uploads/car_rental_industrial/cars/..png
      const filePath = path.join(process.cwd(), relativePath);

      if (!fs.existsSync(filePath)) {
        console.warn(`File does not exist on disk, skipping: ${filePath}`);
        continue;
      }

      console.log(`Uploading ${filePath} -> Cloudinary...`);
      const result: any = await cloudinary.uploader.upload(filePath, { folder: 'car_rental_industrial/cars', resource_type: 'auto' });

      if (!result || !result.public_id) {
        console.warn(`Upload did not return expected result for ${filePath}`, result);
        continue;
      }

      // Update DB record
      await prisma.carImage.update({ where: { id: img.id }, data: { imagePath: result.secure_url, publicId: result.public_id } });
      console.log(`Updated DB record ${img.id} -> ${result.public_id}`);

      // Remove local file
      try { fs.unlinkSync(filePath); console.log(`Deleted local file ${filePath}`); } catch (err) { console.warn('Failed to delete local file after upload', err); }
    } catch (err: any) {
      console.error(`Failed to migrate image ${img.id}`, err);
    }
  }

  console.log('Migration complete.');
  process.exit(0);
}

main().catch(err => { console.error('Migration failed:', err); process.exit(1); });