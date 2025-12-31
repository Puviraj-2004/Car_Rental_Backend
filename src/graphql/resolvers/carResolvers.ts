import prisma from '../../utils/database';
import { isAdmin } from '../../utils/authguard';
import { uploadToCloudinary, deleteFromCloudinary } from '../../utils/cloudinary';
import { BookingStatus } from '@prisma/client';

// 🔍 Helper function to build booking availability filter for car listings
const buildBookingAvailabilityFilter = (startDateTime: Date, endDateTime: Date, includeBuffer: boolean = false) => {
  const bufferMs = includeBuffer ? 24 * 60 * 60 * 1000 : 0; // 24 Hours buffer if enabled

  // For car listings, only consider CONFIRMED, ONGOING, and AWAITING_PAYMENT as conflicts
  // DRAFT and AWAITING_VERIFICATION bookings don't prevent cars from being shown as available
  const conflictStatuses: BookingStatus[] = ['CONFIRMED', 'ONGOING', 'AWAITING_PAYMENT'];

  const dateOverlapConditions = includeBuffer ? [
    // 1. Direct Overlap
    {
      AND: [
        { startDate: { lt: endDateTime } },
        { endDate: { gt: startDateTime } }
      ]
    },
    // 2. Post-Booking Buffer Violation (Existing Return + 24h > New Pickup)
    {
      AND: [
        { endDate: { gte: new Date(startDateTime.getTime() - bufferMs) } },
        { endDate: { lt: startDateTime } }
      ]
    },
    // 3. Pre-Booking Buffer Violation (Existing Pickup - 24h < New Return)
    {
      AND: [
        { startDate: { lte: new Date(endDateTime.getTime() + bufferMs) } },
        { startDate: { gt: endDateTime } }
      ]
    }
  ] : [
    // Simple overlap check without buffer
    {
      AND: [
        { startDate: { lt: endDateTime } },
        { endDate: { gt: startDateTime } }
      ]
    }
  ];

  return {
    none: {
      AND: [
        { status: { in: conflictStatuses } }, // Only these statuses create conflicts
        {
          OR: dateOverlapConditions
        }
      ]
    }
  };
};

// 📊 Helper function to build status filter
const buildStatusFilter = (includeOutOfService: boolean = false) => {
  return includeOutOfService ? {} : { status: { not: 'OUT_OF_SERVICE' } };
};

// 🔧 Admin CRUD helper functions
const createEntity = async (model: any, data: any, context: any) => {
  isAdmin(context);
  return await model.create({ data });
};

const updateEntity = async (model: any, id: string, data: any, context: any) => {
  isAdmin(context);
  return await model.update({ where: { id }, data });
};

const deleteEntity = async (model: any, id: string, context: any) => {
  isAdmin(context);
  await model.delete({ where: { id } });
  return true;
};

export const carResolvers = {
  Query: {
    cars: async (_: any, { filter }: any) => {
      const where: any = {};

      if (filter) {
        if (filter.brandId) where.brandId = filter.brandId;
        if (filter.modelId) where.modelId = filter.modelId;
        if (filter.fuelType) where.fuelType = filter.fuelType;
        if (filter.transmission) where.transmission = filter.transmission;
        if (filter.critAirRating) where.critAirRating = filter.critAirRating;

        if (filter.startDate && filter.endDate) {
          const startDateTime = new Date(filter.startDate);
          const endDateTime = new Date(filter.endDate);

          where.status = 'AVAILABLE';
          where.bookings = buildBookingAvailabilityFilter(startDateTime, endDateTime, true); // Include buffer
        } else {
          // Date not selected - show everything except OUT_OF_SERVICE (unless admin override)
          Object.assign(where, buildStatusFilter(filter.includeOutOfService));
        }
      } else {
        // No filter provided - default behavior
        Object.assign(where, buildStatusFilter(filter?.includeOutOfService));
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
          bookings: buildBookingAvailabilityFilter(startDateTime, endDateTime, false) // No buffer
        },
        include: { brand: true, model: true, images: true }
      });
    },
  },

  Mutation: {
    // 🛠️ --- ADMIN ONLY OPERATIONS ---
    
    createBrand: async (_: any, args: any, context: any) =>
      createEntity(prisma.brand, args, context),

    updateBrand: async (_: any, { id, ...args }: any, context: any) =>
      updateEntity(prisma.brand, id, args, context),

    deleteBrand: async (_: any, { id }: any, context: any) =>
      deleteEntity(prisma.brand, id, context),

    createModel: async (_: any, args: any, context: any) =>
      createEntity(prisma.model, args, context),

    createCar: async (_: any, { input }: any, context: any) => {
      isAdmin(context);
      return await prisma.car.create({
        data: { ...input, requiredLicenseCategory: input.requiredLicenseCategory || 'B', status: input.status || 'AVAILABLE' },
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