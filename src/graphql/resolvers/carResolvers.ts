import { deleteUploadedFile } from '../../utils/upload';
import prisma from '../../utils/database';
import { GraphQLUpload } from 'graphql-upload-ts';
import path from 'path';
import fs from 'fs';

export const carResolvers = {
  Upload: GraphQLUpload,

  Query: {
    cars: async (_: any, { filter }: any) => {
      const where: any = {};
      if (filter) {
        if (filter.brandId && filter.brandId !== "") where.brandId = filter.brandId;
        if (filter.modelId && filter.modelId !== "") where.modelId = filter.modelId;
        if (filter.fuelType && filter.fuelType !== "") where.fuelType = filter.fuelType;
        if (filter.transmission && filter.transmission !== "") where.transmission = filter.transmission;
        if (filter.availability !== undefined) where.availability = filter.availability;
      }
      return await (prisma.car as any).findMany({
        where,
        include: { brand: true, model: true, images: true },
        orderBy: { createdAt: 'desc' }
      });
    },

    car: async (_: any, { id }: any) => {
      const car = await (prisma.car as any).findUnique({ 
        where: { id }, 
        include: { 
          brand: true, 
          model: true, 
          images: { orderBy: { isPrimary: 'desc' } },
          bookings: true // 🚀 Bookings சேர்க்கப்பட்டுள்ளது
        } 
      });
      
      // Ensure bookings is always an array, not null
      if (car) {
        car.bookings = car.bookings || [];
      }
      
      return car;
    },
    
    brands: async () => await (prisma as any).brand.findMany({ orderBy: { name: 'asc' } }),
    models: async (_: any, { brandId }: any) => await (prisma as any).model.findMany({ 
      where: { brandId }, 
      orderBy: { name: 'asc' } 
    }),
  },

  Mutation: {
    createBrand: async (_: any, { name }: any) => {
      return await (prisma as any).brand.create({ data: { name: name.trim() } });
    },
    updateBrand: async (_: any, { id, name }: any) => {
      return await (prisma as any).brand.update({ where: { id }, data: { name: name.trim() } });
    },
    deleteBrand: async (_: any, { id }: any) => {
      await (prisma as any).brand.delete({ where: { id } });
      return true;
    },
    createModel: async (_: any, { name, brandId }: any) => {
      return await (prisma as any).model.create({ data: { name: name.trim(), brandId } });
    },
    updateModel: async (_: any, { id, name }: any) => {
      return await (prisma as any).model.update({ where: { id }, data: { name: name.trim() } });
    },
    deleteModel: async (_: any, { id }: any) => {
      await (prisma as any).model.delete({ where: { id } });
      return true;
    },
    createCar: async (_: any, { input }: any) => {
      return await (prisma.car as any).create({ 
        data: { ...input }, 
        include: { brand: true, model: true } 
      });
    },
    uploadCarImages: async (_: any, { input }: any) => {
      const { carId, images, primaryIndex } = input;
      const uploadedImages = [];
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      for (let i = 0; i < images.length; i++) {
        const file = await images[i];
        const { createReadStream, filename } = file;
        const newFilename = `${carId}-${Date.now()}-${i}${path.extname(filename)}`;
        const filePath = path.join(uploadDir, newFilename);
        const stream = createReadStream();
        await new Promise((res, rej) => stream.pipe(fs.createWriteStream(filePath)).on('finish', res).on('error', rej));

        const img = await (prisma as any).carImage.create({ 
          data: { carId, imagePath: `/uploads/${newFilename}`, isPrimary: i === (primaryIndex || 0) } 
        });
        uploadedImages.push(img);
      }
      return uploadedImages;
    },
    deleteCar: async (_: any, { id }: any) => {
      const images = await (prisma as any).carImage.findMany({ where: { carId: id } });
      for (const img of images) await deleteUploadedFile(img.imagePath);
      await (prisma.car as any).delete({ where: { id } });
      return true;
    }
  },

  Car: {
    brand: async (parent: any) => await (prisma as any).brand.findUnique({ where: { id: parent.brandId } }),
    model: async (parent: any) => await (prisma as any).model.findUnique({ where: { id: parent.modelId } }),
    bookings: (parent: any) => parent.bookings || [], // 🚀 இதுதான் அந்த Non-nullable எரரைச் சரி செய்யும்
  }
};