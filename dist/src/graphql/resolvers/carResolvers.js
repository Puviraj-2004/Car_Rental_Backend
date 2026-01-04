"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.carResolvers = void 0;
const database_1 = __importDefault(require("../../utils/database"));
const authguard_1 = require("../../utils/authguard");
const cloudinary_1 = require("../../utils/cloudinary");
const validation_1 = require("../../utils/validation");
// ----------------------------------------------------------------------
// 🛠️ HELPER FUNCTIONS
// ----------------------------------------------------------------------
// 🔍 Helper: Build Booking Availability Filter (Industrial Logic)
// This ensures cars are hidden if they have ANY active booking (Pending/Paid/Ongoing)
const buildBookingAvailabilityFilter = (startDateTime, endDateTime, includeBuffer = false) => {
    const bufferMs = includeBuffer ? 24 * 60 * 60 * 1000 : 0; // 24 Hours buffer if enabled
    // 🛑 BLOCKING STATUSES:
    // If a booking is in any of these states, the car is NOT available.
    const conflictStatuses = ['PENDING', 'VERIFIED', 'CONFIRMED', 'ONGOING', 'RESERVED'];
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
                { status: { in: conflictStatuses } }, // Cast to avoid TS strictness on enums
                {
                    OR: dateOverlapConditions
                }
            ]
        }
    };
};
// 📊 Helper: Build Status Filter
const buildStatusFilter = (includeOutOfService = false) => {
    return includeOutOfService ? {} : { status: { not: 'OUT_OF_SERVICE' } };
};
// 🔧 Admin CRUD Helpers
const createEntity = async (model, data, context) => {
    (0, authguard_1.isAdmin)(context);
    return await model.create({ data });
};
const updateEntity = async (model, id, data, context) => {
    (0, authguard_1.isAdmin)(context);
    return await model.update({ where: { id }, data });
};
const deleteEntity = async (model, id, context) => {
    (0, authguard_1.isAdmin)(context);
    await model.delete({ where: { id } });
    return true;
};
// ----------------------------------------------------------------------
// 🚀 RESOLVERS
// ----------------------------------------------------------------------
exports.carResolvers = {
    Query: {
        // 🚙 Search & Filter Cars
        cars: async (_, { filter }) => {
            // Validate filter input if dates are provided
            if (filter && (filter.startDate || filter.endDate)) {
                const validation = (0, validation_1.validateCarFilterInput)(filter);
                if (!validation.isValid) {
                    throw new Error(`Filter validation failed: ${validation.errors.join(', ')}`);
                }
            }
            const where = {};
            if (filter) {
                if (filter.brandIds && filter.brandIds.length > 0)
                    where.model = { brandId: { in: filter.brandIds } };
                if (filter.modelIds && filter.modelIds.length > 0)
                    where.modelId = { in: filter.modelIds };
                if (filter.fuelTypes && filter.fuelTypes.length > 0)
                    where.fuelType = { in: filter.fuelTypes };
                if (filter.transmissions && filter.transmissions.length > 0)
                    where.transmission = { in: filter.transmissions };
                if (filter.statuses && filter.statuses.length > 0)
                    where.status = { in: filter.statuses };
                if (filter.critAirRatings && filter.critAirRatings.length > 0)
                    where.critAirRating = { in: filter.critAirRatings };
                if (filter.startDate && filter.endDate) {
                    // Convert date-only strings to date-time with default times
                    let startDateTime, endDateTime;
                    if (filter.startDate.includes('T') || filter.startDate.includes(' ')) {
                        startDateTime = new Date(filter.startDate);
                    }
                    else {
                        startDateTime = new Date(`${filter.startDate}T10:00:00`);
                    }
                    if (filter.endDate.includes('T') || filter.endDate.includes(' ')) {
                        endDateTime = new Date(filter.endDate);
                    }
                    else {
                        endDateTime = new Date(`${filter.endDate}T10:00:00`);
                    }
                    // Force status AVAILABLE when searching by date
                    where.status = 'AVAILABLE';
                    // Apply Booking Conflict Logic
                    where.bookings = buildBookingAvailabilityFilter(startDateTime, endDateTime, true); // True = Include Buffer
                }
                else {
                    // Date not selected - show everything except OUT_OF_SERVICE (unless admin override)
                    Object.assign(where, buildStatusFilter(filter.includeOutOfService));
                }
            }
            else {
                // No filter provided - default behavior
                Object.assign(where, buildStatusFilter(filter?.includeOutOfService));
            }
            return await database_1.default.car.findMany({
                where,
                include: { model: { include: { brand: true } }, images: true },
                orderBy: { createdAt: 'desc' }
            });
        },
        // 🔍 Single Car Details
        car: async (_, { id }) => {
            return await database_1.default.car.findUnique({
                where: { id },
                include: {
                    model: { include: { brand: true } },
                    images: { orderBy: { isPrimary: 'desc' } },
                    bookings: true
                }
            });
        },
        // 🏢 Brands List
        brands: async () => await database_1.default.brand.findMany({ orderBy: { name: 'asc' } }),
        // 🚗 Models List
        models: async (_, { brandId }) => await database_1.default.vehicleModel.findMany({ where: { brandId }, orderBy: { name: 'asc' } }),
        // 🗓️ Simple Availability Check
        availableCars: async (_, { startDate, endDate }) => {
            let startDateTime, endDateTime;
            if (startDate.includes('T') || startDate.includes(' ')) {
                startDateTime = new Date(startDate);
            }
            else {
                startDateTime = new Date(`${startDate}T10:00:00`);
            }
            if (endDate.includes('T') || endDate.includes(' ')) {
                endDateTime = new Date(endDate);
            }
            else {
                endDateTime = new Date(`${endDate}T10:00:00`);
            }
            return await database_1.default.car.findMany({
                where: {
                    status: 'AVAILABLE',
                    bookings: buildBookingAvailabilityFilter(startDateTime, endDateTime, false) // No buffer for quick check
                },
                include: { model: { include: { brand: true } }, images: true }
            });
        },
    },
    Mutation: {
        // 🛠️ --- ADMIN ONLY OPERATIONS ---
        // Brands
        createBrand: async (_, args, context) => createEntity(database_1.default.brand, args, context),
        updateBrand: async (_, { id, ...args }, context) => updateEntity(database_1.default.brand, id, args, context),
        deleteBrand: async (_, { id }, context) => deleteEntity(database_1.default.brand, id, context),
        // Models
        createModel: async (_, args, context) => createEntity(database_1.default.vehicleModel, args, context),
        updateModel: async (_, { id, ...args }, context) => updateEntity(database_1.default.vehicleModel, id, args, context),
        deleteModel: async (_, { id }, context) => deleteEntity(database_1.default.vehicleModel, id, context),
        // Cars
        createCar: async (_, { input }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.car.create({
                data: {
                    ...input,
                    requiredLicense: input.requiredLicense || 'B',
                    status: input.status || 'AVAILABLE'
                },
                include: { model: { include: { brand: true } } }
            });
        },
        updateCar: async (_, { id, input }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.car.update({
                where: { id },
                data: input,
                include: { model: { include: { brand: true } } }
            });
        },
        deleteCar: async (_, { id }, context) => {
            (0, authguard_1.isAdmin)(context);
            // Optional: Delete images from Cloudinary before deleting car
            // const images = await prisma.carImage.findMany({ where: { carId: id } });
            // for (const img of images) { ...deleteFromCloudinary... }
            await database_1.default.car.delete({ where: { id } });
            return true;
        },
        // 📸 Image Management
        addCarImage: async (_, { carId, file, isPrimary }, context) => {
            (0, authguard_1.isAdmin)(context);
            const uploadObj = await file;
            const { filename, createReadStream } = uploadObj;
            if (!createReadStream) {
                throw new Error("File upload failed: createReadStream is not available.");
            }
            const stream = createReadStream();
            let uploadResult;
            try {
                uploadResult = await (0, cloudinary_1.uploadToCloudinary)(stream, 'cars', false, filename);
            }
            catch (err) {
                console.error('Cloudinary upload failed', err);
                throw new Error('Image upload failed.');
            }
            // Handle Primary Image Logic
            if (isPrimary) {
                await database_1.default.carImage.updateMany({
                    where: { carId },
                    data: { isPrimary: false }
                });
            }
            const created = await database_1.default.carImage.create({
                data: {
                    carId,
                    url: uploadResult.secure_url,
                    isPrimary: isPrimary || false
                }
            });
            return created;
        },
        deleteCarImage: async (_, { imageId }, context) => {
            (0, authguard_1.isAdmin)(context);
            const image = await database_1.default.carImage.findUnique({ where: { id: imageId } });
            if (!image)
                throw new Error('Image not found');
            // Note: We don't have publicId in Schema currently, so we skip Cloudinary delete
            // if (image.publicId) await deleteFromCloudinary(image.publicId);
            await database_1.default.carImage.delete({ where: { id: imageId } });
            return true;
        },
        setPrimaryCarImage: async (_, { carId, imageId }, context) => {
            (0, authguard_1.isAdmin)(context);
            await database_1.default.$transaction([
                database_1.default.carImage.updateMany({ where: { carId }, data: { isPrimary: false } }),
                database_1.default.carImage.update({ where: { id: imageId }, data: { isPrimary: true } })
            ]);
            return true;
        }
    },
    // Field Resolvers
    Car: {
        brand: async (parent) => {
            const model = await database_1.default.vehicleModel.findUnique({
                where: { id: parent.modelId },
                include: { brand: true }
            });
            return model?.brand;
        }
    }
};
//# sourceMappingURL=carResolvers.js.map