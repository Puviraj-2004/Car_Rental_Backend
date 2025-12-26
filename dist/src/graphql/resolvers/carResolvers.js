"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.carResolvers = void 0;
const database_1 = __importDefault(require("../../utils/database"));
const authguard_1 = require("../../utils/authguard");
const cloudinary_1 = require("../../utils/cloudinary");
exports.carResolvers = {
    Query: {
        cars: async (_, { filter }) => {
            const where = {};
            if (filter) {
                if (filter.brandId)
                    where.brandId = filter.brandId;
                if (filter.modelId)
                    where.modelId = filter.modelId;
                if (filter.fuelType)
                    where.fuelType = filter.fuelType;
                if (filter.transmission)
                    where.transmission = filter.transmission;
                if (filter.status)
                    where.status = filter.status;
                if (filter.critAirRating)
                    where.critAirRating = filter.critAirRating;
                if (filter.minPrice || filter.maxPrice) {
                    where.pricePerDay = {};
                    if (filter.minPrice)
                        where.pricePerDay.gte = filter.minPrice;
                    if (filter.maxPrice)
                        where.pricePerDay.lte = filter.maxPrice;
                }
            }
            return await database_1.default.car.findMany({
                where,
                include: { brand: true, model: true, images: true },
                orderBy: { createdAt: 'desc' }
            });
        },
        // 🔍 ஒரு காரின் முழு விவரங்களை எடுக்க
        car: async (_, { id }) => {
            return await database_1.default.car.findUnique({
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
        brands: async () => await database_1.default.brand.findMany({ orderBy: { name: 'asc' } }),
        models: async (_, { brandId }) => await database_1.default.model.findMany({ where: { brandId }, orderBy: { name: 'asc' } }),
        // 🗓️ குறிப்பிட்ட தேதிகளில் கிடைக்கும் கார்களை மட்டும் எடுக்க
        availableCars: async (_, { startDate, endDate }) => {
            const startDateTime = new Date(startDate);
            const endDateTime = new Date(endDate);
            return await database_1.default.car.findMany({
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
        createBrand: async (_, args, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.brand.create({ data: args });
        },
        updateBrand: async (_, { id, ...args }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.brand.update({ where: { id }, data: args });
        },
        deleteBrand: async (_, { id }, context) => {
            (0, authguard_1.isAdmin)(context);
            await database_1.default.brand.delete({ where: { id } });
            return true;
        },
        createModel: async (_, args, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.model.create({ data: args });
        },
        createCar: async (_, { input }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.car.create({
                data: { ...input, status: input.status || 'AVAILABLE' },
                include: { brand: true, model: true }
            });
        },
        updateCar: async (_, { id, input }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.car.update({
                where: { id },
                data: input,
                include: { brand: true, model: true }
            });
        },
        // 🗑️ காரை நீக்கும்போது Cloudinary படங்களையும் நீக்குகிறது
        deleteCar: async (_, { id }, context) => {
            (0, authguard_1.isAdmin)(context);
            // 1. காரின் படங்களை எடுத்து Cloudinary-ல் இருந்து நீக்குதல்
            const images = await database_1.default.carImage.findMany({ where: { carId: id } });
            for (const img of images) {
                if (img.publicId)
                    await (0, cloudinary_1.deleteFromCloudinary)(img.publicId);
            }
            // 2. காரை டேட்டாபேஸில் இருந்து நீக்குதல்
            await database_1.default.car.delete({ where: { id } });
            return true;
        },
        addCarImage: async (_, { carId, file, isPrimary }, context) => {
            (0, authguard_1.isAdmin)(context);
            const { createReadStream } = file;
            if (!createReadStream) {
                throw new Error("File upload failed: createReadStream is not available.");
            }
            const fileStream = createReadStream();
            const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(fileStream, 'cars');
            if (isPrimary) {
                await database_1.default.carImage.updateMany({
                    where: { carId },
                    data: { isPrimary: false }
                });
            }
            return await database_1.default.carImage.create({
                data: {
                    carId,
                    imagePath: uploadResult.secure_url,
                    publicId: uploadResult.public_id,
                    isPrimary: isPrimary || false
                }
            });
        },
        deleteCarImage: async (_, { imageId }, context) => {
            (0, authguard_1.isAdmin)(context);
            const image = await database_1.default.carImage.findUnique({ where: { id: imageId } });
            if (!image)
                throw new Error('Image not found');
            // Cloudinary-ல் இருந்து நீக்குதல்
            if (image.publicId) {
                await (0, cloudinary_1.deleteFromCloudinary)(image.publicId);
            }
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
    }
};
//# sourceMappingURL=carResolvers.js.map