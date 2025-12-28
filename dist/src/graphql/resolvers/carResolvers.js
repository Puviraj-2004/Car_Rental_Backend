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
                if (filter.critAirRating)
                    where.critAirRating = filter.critAirRating;
                if (filter.startDate && filter.endDate) {
                    const startDateTime = new Date(filter.startDate);
                    const endDateTime = new Date(filter.endDate);
                    const bufferMs = 24 * 60 * 60 * 1000; // 24 Hours
                    where.status = 'AVAILABLE';
                    // 🚀 The Logic: Exclude cars that meet ANY of these conflict conditions
                    where.bookings = {
                        none: {
                            OR: [
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
                            ]
                        }
                    };
                }
                else {
                    // Date not selected - show everything except OUT_OF_SERVICE (unless admin override)
                    if (!filter.includeOutOfService) {
                        where.status = { not: 'OUT_OF_SERVICE' };
                    }
                    // If includeOutOfService is true, show all cars regardless of status
                }
            }
            else {
                // No filter provided - default behavior
                if (!filter.includeOutOfService) {
                    where.status = { not: 'OUT_OF_SERVICE' };
                }
                // If includeOutOfService is true, show all cars regardless of status
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
            // Get upload details and validate
            const uploadObj = await file;
            const { filename, mimetype, createReadStream } = uploadObj;
            console.log(`addCarImage called for carId=${carId}, filename=${filename}, mimetype=${mimetype}, isPrimary=${isPrimary}`);
            if (!createReadStream || typeof createReadStream !== 'function') {
                console.error('File upload failed: createReadStream is not available or invalid.');
                throw new Error("File upload failed: createReadStream is not available.");
            }
            let fileStream = createReadStream();
            let uploadResult;
            // Try upload with one retry: if Cloudinary upload fails and fallback requires a fresh stream,
            // recreate the stream and attempt fallback again (local save) before giving up.
            try {
                uploadResult = await (0, cloudinary_1.uploadToCloudinary)(fileStream, 'cars', false, filename);
            }
            catch (err) {
                console.error('Cloudinary upload failed for file (first attempt)', filename, err);
                // If the stream was consumed and fallback can't reuse it, recreate the stream and retry once
                const msg = (err && err.message) || '';
                if (/fallback is not available|retry the upload/i.test(msg)) {
                    console.log('Retrying upload with a fresh stream for local fallback...');
                    fileStream = createReadStream();
                    try {
                        uploadResult = await (0, cloudinary_1.uploadToCloudinary)(fileStream, 'cars', false, filename);
                    }
                    catch (err2) {
                        console.error('Second upload attempt also failed for file', filename, err2);
                        throw new Error('Image upload failed; please retry. If the problem persists, check Cloudinary credentials.');
                    }
                }
                else {
                    throw new Error('Image upload failed; please retry. If the problem persists, check Cloudinary credentials.');
                }
            }
            try {
                // Ensure the car exists
                const car = await database_1.default.car.findUnique({ where: { id: carId } });
                if (!car)
                    throw new Error('Car not found for image upload.');
                if (isPrimary) {
                    await database_1.default.carImage.updateMany({
                        where: { carId },
                        data: { isPrimary: false }
                    });
                }
                const created = await database_1.default.carImage.create({
                    data: {
                        carId,
                        imagePath: uploadResult.secure_url,
                        publicId: uploadResult.public_id,
                        isPrimary: isPrimary || false
                    }
                });
                console.log('addCarImage success', created.id);
                return created;
            }
            catch (error) {
                // If DB save fails, delete the uploaded image from Cloudinary
                console.error('Saving image record failed, deleting uploaded image from Cloudinary', error);
                if (uploadResult?.public_id) {
                    await (0, cloudinary_1.deleteFromCloudinary)(uploadResult.public_id);
                }
                throw error;
            }
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