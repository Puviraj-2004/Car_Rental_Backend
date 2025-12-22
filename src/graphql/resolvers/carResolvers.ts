import {  deleteUploadedFile } from '../../utils/upload';
import prisma from '../../utils/database';
import { GraphQLUpload } from 'graphql-upload-ts';
import path from 'path';
import fs from 'fs';

export const carResolvers = {
  Upload: GraphQLUpload,

  Query: {
    cars: async (_: any, { filter }: { filter: any }) => {
      const where: any = {};
      if (filter) {
        if (filter.brand) where.brand = { contains: filter.brand, mode: 'insensitive' };
        if (filter.model) where.model = { contains: filter.model, mode: 'insensitive' };
        if (filter.fuelType) where.fuelType = filter.fuelType;
        if (filter.transmission) where.transmission = filter.transmission;
        if (filter.availability !== undefined) where.availability = filter.availability;
      }

      return await prisma.car.findMany({
        where,
        include: { images: true, bookings: true }
      });
    },

    car: async (_: any, { id }: { id: string }) => {
      return await prisma.car.findUnique({
        where: { id },
        include: { images: true, bookings: true }
      });
    },
  },

  Mutation: {
    createCar: async (_: any, { input }: { input: any }) => {
      return await prisma.car.create({
        data: { ...input, availability: input.availability ?? true },
        include: { images: true }
      });
    },

    uploadCarImages: async (_: any, { input }: { input: any }) => {
      const { carId, images, altTexts, primaryIndex } = input;
      
      const car = await prisma.car.findUnique({ where: { id: carId } });
      if (!car) throw new Error('Car not found');

      const uploadedImages = [];

      // Ensure upload directory exists
      const uploadDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      for (let i = 0; i < images.length; i++) {
        const file = await images[i];
        const { createReadStream, filename } = file;
        
        const fileExt = path.extname(filename);
        const newFilename = `${carId}-${Date.now()}-${i}${fileExt}`;
        const filePath = path.join(uploadDir, newFilename);

        // Save file to filesystem
        const stream = createReadStream();
        await new Promise((resolve, reject) => {
          const writeStream = fs.createWriteStream(filePath);
          stream.pipe(writeStream);
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
        });

        const isPrimary = i === (primaryIndex || 0);

        // Save to Database
        const carImage = await prisma.carImage.create({
          data: {
            carId,
            imagePath: `/uploads/${newFilename}`,
            altText: altTexts?.[i] || `${car.brand} ${car.model}`,
            isPrimary
          }
        });

        uploadedImages.push(carImage);
      }

      return uploadedImages;
    },

    deleteCar: async (_: any, { id }: { id: string }) => {
      const images = await prisma.carImage.findMany({ where: { carId: id } });
      for (const image of images) {
        await deleteUploadedFile(image.imagePath);
      }
      await prisma.car.delete({ where: { id } });
      return true;
    },

    deleteCarImage: async (_: any, { imageId }: { imageId: string }) => {
      const image = await prisma.carImage.findUnique({ where: { id: imageId } });
      if (!image) throw new Error('Image not found');
      await deleteUploadedFile(image.imagePath);
      await prisma.carImage.delete({ where: { id: imageId } });
      return true;
    },
  },

  Car: {
    images: async (parent: any) => {
      return await prisma.carImage.findMany({
        where: { carId: parent.id },
        orderBy: { isPrimary: 'desc' }
      });
    }
  }
};