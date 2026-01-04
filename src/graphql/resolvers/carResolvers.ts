import prisma from '../../utils/database';
import { isAdmin } from '../../utils/authguard';
import { uploadToCloudinary } from '../../utils/cloudinary';
import { validateCarFilterInput } from '../../utils/validation';

// ----------------------------------------------------------------------
// 🛠️ HELPER FUNCTIONS
// ----------------------------------------------------------------------

// 🔍 Helper: Build Booking Availability Filter (Industrial Logic)
// This ensures cars are hidden if they have ANY active booking (Pending/Paid/Ongoing)
const buildBookingAvailabilityFilter = (startDateTime: Date, endDateTime: Date, includeBuffer: boolean = false) => {
  const bufferMs = includeBuffer ? 24 * 60 * 60 * 1000 : 0; // 24 Hours buffer if enabled

  // 🛑 BLOCKING STATUSES:
  // If a booking is in any of these states, the car is NOT available.
  const conflictStatuses = ['PENDING', 'VERIFIED', 'CONFIRMED', 'ONGOING'];

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
        { status: { in: conflictStatuses as any } }, // Cast to avoid TS strictness on enums
        {
          OR: dateOverlapConditions
        }
      ]
    }
  };
};

// 📊 Helper: Build Status Filter
const buildStatusFilter = (includeOutOfService: boolean = false) => {
  return includeOutOfService ? {} : { status: { not: 'OUT_OF_SERVICE' } };
};

// 🔧 Admin CRUD Helpers
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

// ----------------------------------------------------------------------
// 🚀 RESOLVERS
// ----------------------------------------------------------------------

export const carResolvers = {
  Query: {
    // 🚙 Search & Filter Cars
    cars: async (_: any, { filter }: any) => {
      // Validate filter input if dates are provided
      if (filter && (filter.startDate || filter.endDate)) {
        const validation = validateCarFilterInput(filter);
        if (!validation.isValid) {
          throw new Error(`Filter validation failed: ${validation.errors.join(', ')}`);
        }
      }

      const where: any = {};

      if (filter) {
        if (filter.brandIds && filter.brandIds.length > 0) where.model = { brandId: { in: filter.brandIds } };
        if (filter.modelIds && filter.modelIds.length > 0) where.modelId = { in: filter.modelIds };
        if (filter.fuelTypes && filter.fuelTypes.length > 0) where.fuelType = { in: filter.fuelTypes };
        if (filter.transmissions && filter.transmissions.length > 0) where.transmission = { in: filter.transmissions };
        if (filter.statuses && filter.statuses.length > 0) where.status = { in: filter.statuses };
        if (filter.critAirRatings && filter.critAirRatings.length > 0) where.critAirRating = { in: filter.critAirRatings };

        if (filter.startDate && filter.endDate) {
          // Convert date-only strings to date-time with default times
          let startDateTime: Date, endDateTime: Date;

          if (filter.startDate.includes('T') || filter.startDate.includes(' ')) {
            startDateTime = new Date(filter.startDate);
          } else {
            startDateTime = new Date(`${filter.startDate}T10:00:00`);
          }

          if (filter.endDate.includes('T') || filter.endDate.includes(' ')) {
            endDateTime = new Date(filter.endDate);
          } else {
            endDateTime = new Date(`${filter.endDate}T10:00:00`);
          }

          // ✅ INDUSTRIAL LOGIC CHANGE:
          // Allow cars that are 'AVAILABLE' OR 'RENTED'.
          // Even if a car is currently RENTED, it might be free during the requested future dates.
          // We exclude 'MAINTENANCE' and 'OUT_OF_SERVICE' because we don't know when they will be ready.
          where.status = { in: ['AVAILABLE', 'RENTED'] };
          
          // Apply Booking Calendar Conflict Logic
          where.bookings = buildBookingAvailabilityFilter(startDateTime, endDateTime, true); // True = Include Buffer
        } else {
          // Date not selected - show cars based on status filter (default hides OUT_OF_SERVICE)
          Object.assign(where, buildStatusFilter(filter.includeOutOfService));
        }
      } else {
        // No filter provided - default behavior
        Object.assign(where, buildStatusFilter(filter?.includeOutOfService));
      }

      return await prisma.car.findMany({
        where,
        include: { model: { include: { brand: true } }, images: true },
        orderBy: { createdAt: 'desc' }
      });
    },

    // 🔍 Single Car Details
    car: async (_: any, { id }: any) => {
      return await prisma.car.findUnique({
        where: { id },
        include: {
          model: { include: { brand: true } },
          images: { orderBy: { isPrimary: 'desc' } },
          bookings: true
        }
      });
    },

    // 🏢 Brands List
    brands: async () => await prisma.brand.findMany({ orderBy: { name: 'asc' } }),

    // 🚗 Models List
    models: async (_: any, { brandId }: any) =>
      await prisma.vehicleModel.findMany({ where: { brandId }, orderBy: { name: 'asc' } }),

    // 🗓️ Simple Availability Check
    availableCars: async (_: any, { startDate, endDate }: any) => {
      let startDateTime: Date, endDateTime: Date;

      if (startDate.includes('T') || startDate.includes(' ')) {
        startDateTime = new Date(startDate);
      } else {
        startDateTime = new Date(`${startDate}T10:00:00`);
      }

      if (endDate.includes('T') || endDate.includes(' ')) {
        endDateTime = new Date(endDate);
      } else {
        endDateTime = new Date(`${endDate}T10:00:00`);
      }

      return await prisma.car.findMany({
        where: {
          // ✅ SAME LOGIC HERE: Check calendar availability for both Available and Rented cars
          status: { in: ['AVAILABLE', 'RENTED'] },
          bookings: buildBookingAvailabilityFilter(startDateTime, endDateTime, false) // No buffer for quick check
        },
        include: { model: { include: { brand: true } }, images: true }
      });
    },
  },

  Mutation: {
    // 🛠️ --- ADMIN ONLY OPERATIONS ---

    // Brands
    createBrand: async (_: any, args: any, context: any) => createEntity(prisma.brand, args, context),
    updateBrand: async (_: any, { id, ...args }: any, context: any) => updateEntity(prisma.brand, id, args, context),
    deleteBrand: async (_: any, { id }: any, context: any) => deleteEntity(prisma.brand, id, context),

    // Models
    createModel: async (_: any, args: any, context: any) => createEntity(prisma.vehicleModel, args, context),
    updateModel: async (_: any, { id, ...args }: any, context: any) => updateEntity(prisma.vehicleModel, id, args, context),
    deleteModel: async (_: any, { id }: any, context: any) => deleteEntity(prisma.vehicleModel, id, context),

    // Cars
    createCar: async (_: any, { input }: any, context: any) => {
      isAdmin(context);
      return await prisma.car.create({
        data: { 
          ...input, 
          requiredLicense: input.requiredLicense || 'B', 
          status: input.status || 'AVAILABLE' 
        },
        include: { model: { include: { brand: true } } }
      });
    },

    updateCar: async (_: any, { id, input }: any, context: any) => {
      isAdmin(context);
      return await prisma.car.update({
        where: { id },
        data: input,
        include: { model: { include: { brand: true } } }
      });
    },

    deleteCar: async (_: any, { id }: any, context: any) => {
      isAdmin(context);
      // Optional: Delete images from Cloudinary before deleting car
      // const images = await prisma.carImage.findMany({ where: { carId: id } });
      // for (const img of images) { ...deleteFromCloudinary... }
      
      await prisma.car.delete({ where: { id } });
      return true;
    },

    // 📸 Image Management
    addCarImage: async (_: any, { carId, file, isPrimary }: any, context: any) => {
      isAdmin(context);

      const uploadObj = await file;
      const { filename, createReadStream } = uploadObj;

      if (!createReadStream) {
        throw new Error("File upload failed: createReadStream is not available.");
      }

      const stream = createReadStream();
      let uploadResult: any;

      try {
        uploadResult = await uploadToCloudinary(stream, 'cars', false, filename);
      } catch (err: any) {
        console.error('Cloudinary upload failed', err);
        throw new Error('Image upload failed.');
      }

      // Handle Primary Image Logic
      if (isPrimary) {
        await prisma.carImage.updateMany({
          where: { carId },
          data: { isPrimary: false }
        });
      }

      const created = await prisma.carImage.create({
        data: {
          carId,
          url: uploadResult.secure_url,
          isPrimary: isPrimary || false
        }
      });

      return created;
    },

    deleteCarImage: async (_: any, { imageId }: any, context: any) => {
      isAdmin(context);
      const image = await prisma.carImage.findUnique({ where: { id: imageId } });
      if (!image) throw new Error('Image not found');

      // Note: We don't have publicId in Schema currently, so we skip Cloudinary delete
      // if (image.publicId) await deleteFromCloudinary(image.publicId);

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
  },

  // Field Resolvers
  Car: {
    brand: async (parent: any) => {
      const model = await prisma.vehicleModel.findUnique({
        where: { id: parent.modelId },
        include: { brand: true }
      });
      return model?.brand;
    }
  }
};