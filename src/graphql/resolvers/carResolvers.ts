import prisma from '../../utils/database';
import { isAdmin } from '../../utils/authguard';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary';

export const carResolvers = {
  Query: {
    cars: async (_: any, { filter }: any) => {
      const where: any = {};
      
      if (filter) {
        if (filter.brandId) where.brandId = filter.brandId;
        if (filter.modelId) where.modelId = filter.modelId;
        if (filter.fuelType) where.fuelType = filter.fuelType;
        if (filter.transmission) where.transmission = filter.transmission;
        if (filter.status) where.status = filter.status;
        if (filter.critAirRating) where.critAirRating = filter.critAirRating;
        if (filter.minPrice || filter.maxPrice) {
          where.pricePerDay = {};
          if (filter.minPrice) where.pricePerDay.gte = filter.minPrice;
          if (filter.maxPrice) where.pricePerDay.lte = filter.maxPrice;
        }
      }

      return await prisma.car.findMany({
        where,
        include: { brand: true, model: true, images: true },
        orderBy: { createdAt: 'desc' }
      });
    },

    // 🔍 ஒரு காரின் முழு விவரங்களை எடுக்க
    car: async (_: any, { id }: any) => {
      return await prisma.car.findUnique({ 
        where: { id }, 
        include: { 
          brand: true, 
          model: true, 
          images: { orderBy: { isPrimary: 'desc' } },
          bookings: true 
        } 
      });
    },
    
    // 🏢 பிராண்டுகள் மற்றும் மாடல்களை எடுக்க
    brands: async () => await prisma.brand.findMany({ orderBy: { name: 'asc' } }),
    
    models: async (_: any, { brandId }: any) => 
      await prisma.model.findMany({ where: { brandId }, orderBy: { name: 'asc' } }),

    // 🗓️ குறிப்பிட்ட தேதிகளில் கிடைக்கும் கார்களை மட்டும் எடுக்க
    availableCars: async (_: any, { startDate, endDate }: any) => {
      const startDateTime = new Date(startDate);
      const endDateTime = new Date(endDate);
      
      return await prisma.car.findMany({
        where: {
          status: 'AVAILABLE',
          bookings: {
            none: {
              OR: [
                {
                   AND: [
                     { startDate: { lt: endDateTime } },
                     { endDate: { gt: startDateTime } }
                   ]
                }
              ]
            }
          }
        },
        include: { brand: true, model: true, images: true }
      });
    },
  },

  Mutation: {
    // 🛠️ --- ADMIN ONLY OPERATIONS ---
    
    createBrand: async (_: any, args: any, context: any) => {
      isAdmin(context);
      return await prisma.brand.create({ data: args });
    },
    
    updateBrand: async (_: any, { id, ...args }: any, context: any) => {
      isAdmin(context);
      return await prisma.brand.update({ where: { id }, data: args });
    },
    
    deleteBrand: async (_: any, { id }: any, context: any) => {
      isAdmin(context);
      await prisma.brand.delete({ where: { id } });
      return true;
    },

    createModel: async (_: any, args: any, context: any) => {
      isAdmin(context);
      return await prisma.model.create({ data: args });
    },

    createCar: async (_: any, { input }: any, context: any) => {
      isAdmin(context);
      return await prisma.car.create({ 
        data: { ...input, status: input.status || 'AVAILABLE' },
        include: { brand: true, model: true } 
      });
    },
    
    updateCar: async (_: any, { id, input }: any, context: any) => {
      isAdmin(context);
      return await prisma.car.update({ 
        where: { id }, 
        data: input,
        include: { brand: true, model: true }
      });
    },

    // 🗑️ காரை நீக்கும்போது Cloudinary படங்களையும் நீக்குகிறது
    deleteCar: async (_: any, { id }: any, context: any) => {
      isAdmin(context);
      
      // 1. காரின் படங்களை எடுத்து Cloudinary-ல் இருந்து நீக்குதல்
      const images = await prisma.carImage.findMany({ where: { carId: id } });
      for (const img of images) {
        if (img.publicId) await deleteFromCloudinary(img.publicId);
      }

      // 2. காரை டேட்டாபேஸில் இருந்து நீக்குதல்
      await prisma.car.delete({ where: { id } });
      return true;
    },

    addCarImage: async (_: any, { carId, file, isPrimary }: any, context: any) => {
      isAdmin(context);

      // Get upload details and validate
      const uploadObj = await file;
      const { filename, mimetype, createReadStream } = uploadObj as any;
      console.log(`addCarImage called for carId=${carId}, filename=${filename}, mimetype=${mimetype}, isPrimary=${isPrimary}`);

      if (!createReadStream || typeof createReadStream !== 'function') {
        console.error('File upload failed: createReadStream is not available or invalid.');
        throw new Error("File upload failed: createReadStream is not available.");
      }

      let fileStream = createReadStream();
      let uploadResult: any;

      // Try upload with one retry: if Cloudinary upload fails and fallback requires a fresh stream,
      // recreate the stream and attempt fallback again (local save) before giving up.
      try {
        uploadResult = await uploadToCloudinary(fileStream, 'cars', false, filename);
      } catch (err: any) {
        console.error('Cloudinary upload failed for file (first attempt)', filename, err);
        // If the stream was consumed and fallback can't reuse it, recreate the stream and retry once
        const msg = (err && err.message) || '';
        if (/fallback is not available|retry the upload/i.test(msg)) {
          console.log('Retrying upload with a fresh stream for local fallback...');
          fileStream = createReadStream();
          try {
            uploadResult = await uploadToCloudinary(fileStream, 'cars', false, filename);
          } catch (err2) {
            console.error('Second upload attempt also failed for file', filename, err2);
            throw new Error('Image upload failed; please retry. If the problem persists, check Cloudinary credentials.');
          }
        } else {
          throw new Error('Image upload failed; please retry. If the problem persists, check Cloudinary credentials.');
        }
      }

      try {
        // Ensure the car exists
        const car = await prisma.car.findUnique({ where: { id: carId } });
        if (!car) throw new Error('Car not found for image upload.');

        if (isPrimary) {
          await prisma.carImage.updateMany({
            where: { carId },
            data: { isPrimary: false }
          });
        }

        const created = await prisma.carImage.create({
          data: {
            carId,
            imagePath: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            isPrimary: isPrimary || false
          }
        });

        console.log('addCarImage success', created.id);
        return created;
      } catch (error) {
        // If DB save fails, delete the uploaded image from Cloudinary
        console.error('Saving image record failed, deleting uploaded image from Cloudinary', error);
        if (uploadResult?.public_id) {
          await deleteFromCloudinary(uploadResult.public_id);
        }
        throw error;
      }
    },

    deleteCarImage: async (_: any, { imageId }: any, context: any) => {
      isAdmin(context);
      const image = await prisma.carImage.findUnique({ where: { id: imageId } });
      if (!image) throw new Error('Image not found');
      
      // Cloudinary-ல் இருந்து நீக்குதல்
      if (image.publicId) {
        await deleteFromCloudinary(image.publicId);
      }

      await prisma.carImage.delete({ where: { id: imageId } });
      return true;
    },

    setPrimaryCarImage: async (_: any, { carId, imageId }: any, context: any) => {
      isAdmin(context);
      await prisma.$transaction([
        prisma.carImage.updateMany({ where: { carId }, data: { isPrimary: false } }),
        prisma.carImage.update({ where: { id: imageId }, data: { isPrimary: true } })
      ]);
      return true;
    }
  }
};