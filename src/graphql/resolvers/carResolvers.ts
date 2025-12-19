import { getRelativePath, deleteUploadedFile } from '../../utils/upload';
import prisma from '../../utils/database';

export const carResolvers = {
  Query: {
    cars: async (_: any, { filter }: { filter: any }) => {
      const where: any = {};

      if (filter) {
        if (filter.brand) where.brand = { contains: filter.brand, mode: 'insensitive' };
        if (filter.model) where.model = { contains: filter.model, mode: 'insensitive' };
        if (filter.fuelType) where.fuelType = filter.fuelType;
        if (filter.transmission) where.transmission = filter.transmission;

        // Handle price filtering for different rental types
        if (filter.minPricePerDay !== undefined || filter.maxPricePerDay !== undefined) {
          where.pricePerDay = {};
          if (filter.minPricePerDay !== undefined) where.pricePerDay.gte = filter.minPricePerDay;
          if (filter.maxPricePerDay !== undefined) where.pricePerDay.lte = filter.maxPricePerDay;
        }

        if (filter.minPricePerHour !== undefined || filter.maxPricePerHour !== undefined) {
          where.pricePerHour = {};
          if (filter.minPricePerHour !== undefined) where.pricePerHour.gte = filter.minPricePerHour;
          if (filter.maxPricePerHour !== undefined) where.pricePerHour.lte = filter.maxPricePerHour;
        }

        if (filter.critAirRating !== undefined) where.critAirRating = filter.critAirRating;
        if (filter.availability !== undefined) where.availability = filter.availability;
      }

      return await prisma.car.findMany({
        where,
        include: {
          bookings: true,
          images: true
        }
      });
    },

    car: async (_: any, { id }: { id: string }) => {
      return await prisma.car.findUnique({
        where: { id },
        include: {
          bookings: true,
          images: true
        }
      });
    },

    availableCars: async (_: any, { startDate, endDate }: { startDate: string; endDate: string }) => {
      // Convert string dates to Date objects
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Find cars that don't have overlapping bookings
      const bookedCarIds = await prisma.booking.findMany({
        where: {
          AND: [
            { status: { not: 'cancelled' } },
            {
              OR: [
                {
                  AND: [
                    { startDate: { lte: end } },
                    { endDate: { gte: start } }
                  ]
                }
              ]
            }
          ]
        },
        select: {
          carId: true
        }
      });

      const bookedIds = bookedCarIds.map((booking: any) => booking.carId);

      return await prisma.car.findMany({
        where: {
          AND: [
            { availability: true },
            { id: { notIn: bookedIds } }
          ]
        },
        include: {
          bookings: true,
          images: true
        }
      });
    }
  },

  Mutation: {
    createCar: async (_: any, { input }: { input: any }) => {
      return await prisma.car.create({
        data: {
          ...input,
          availability: input.availability !== undefined ? input.availability : true
        },
        include: {
          bookings: true,
          images: true
        }
      });
    },

    updateCar: async (_: any, { id, input }: { id: string; input: any }) => {
      return await prisma.car.update({
        where: { id },
        data: input,
        include: {
          bookings: true,
          images: true
        }
      });
    },

    deleteCar: async (_: any, { id }: { id: string }) => {
      // Delete associated images from filesystem
      const images = await prisma.carImage.findMany({
        where: { carId: id }
      });

      for (const image of images) {
        await deleteUploadedFile(image.imagePath);
      }

      await prisma.car.delete({
        where: { id }
      });

      return true;
    },

    uploadCarImages: async (_: any, { input }: { input: any }) => {
      const { carId, images, altTexts, primaryIndex } = input;

      // Verify car exists
      const car = await prisma.car.findUnique({
        where: { id: carId }
      });

      if (!car) {
        throw new Error('Car not found');
      }

      const uploadedImages: any[] = [];

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        const altText = altTexts?.[i] || null;
        const isPrimary = i === (primaryIndex || 0);

        // Create database record
        const carImage = await prisma.carImage.create({
          data: {
            carId,
            imagePath: getRelativePath(image.path),
            altText,
            isPrimary
          }
        });

        uploadedImages.push(carImage);
      }

      return uploadedImages;
    },

    deleteCarImage: async (_: any, { imageId }: { imageId: string }) => {
      const image = await prisma.carImage.findUnique({
        where: { id: imageId }
      });

      if (!image) {
        throw new Error('Image not found');
      }

      // Delete from filesystem
      await deleteUploadedFile(image.imagePath);

      // Delete from database
      await prisma.carImage.delete({
        where: { id: imageId }
      });

      return true;
    },

    setPrimaryCarImage: async (_: any, { carId, imageId }: { carId: string; imageId: string }) => {
      // Verify image belongs to car
      const image = await prisma.carImage.findFirst({
        where: {
          id: imageId,
          carId
        }
      });

      if (!image) {
        throw new Error('Image not found or does not belong to this car');
      }

      // Reset all images for this car to non-primary
      await prisma.carImage.updateMany({
        where: { carId },
        data: { isPrimary: false }
      });

      // Set the specified image as primary
      await prisma.carImage.update({
        where: { id: imageId },
        data: { isPrimary: true }
      });

      return true;
    }
  },

  Car: {
    bookings: async (parent: any) => {
      return await prisma.booking.findMany({
        where: { carId: parent.id }
      });
    },
    images: async (parent: any) => {
      return await prisma.carImage.findMany({
        where: { carId: parent.id },
        orderBy: { createdAt: 'asc' }
      });
    }
  },

  CarImage: {
    car: async (parent: any) => {
      return await prisma.car.findUnique({
        where: { id: parent.carId }
      });
    }
  }
};