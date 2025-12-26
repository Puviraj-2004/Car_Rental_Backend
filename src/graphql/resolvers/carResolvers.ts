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
      const { createReadStream } = await file;
      
      if (!createReadStream) {
        throw new Error("File upload failed: createReadStream is not available.");
      }
      const fileStream = createReadStream();
      const uploadResult = await uploadToCloudinary(fileStream, 'cars');
      if (isPrimary) {
        await prisma.carImage.updateMany({
          where: { carId },
          data: { isPrimary: false }
        });
      }
      return await prisma.carImage.create({
        data: {
          carId,
          imagePath: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          isPrimary: isPrimary || false
        }
      });
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