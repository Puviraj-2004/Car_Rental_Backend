"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.carResolvers = void 0;
const upload_1 = require("../../utils/upload");
const database_1 = __importDefault(require("../../utils/database"));
exports.carResolvers = {
    Query: {
        cars: async (_, { filter }) => {
            const where = {};
            if (filter) {
                if (filter.brand)
                    where.brand = { contains: filter.brand, mode: 'insensitive' };
                if (filter.model)
                    where.model = { contains: filter.model, mode: 'insensitive' };
                if (filter.fuelType)
                    where.fuelType = filter.fuelType;
                if (filter.transmission)
                    where.transmission = filter.transmission;
                // Handle price filtering for different rental types
                if (filter.minPricePerDay !== undefined || filter.maxPricePerDay !== undefined) {
                    where.pricePerDay = {};
                    if (filter.minPricePerDay !== undefined)
                        where.pricePerDay.gte = filter.minPricePerDay;
                    if (filter.maxPricePerDay !== undefined)
                        where.pricePerDay.lte = filter.maxPricePerDay;
                }
                if (filter.minPricePerHour !== undefined || filter.maxPricePerHour !== undefined) {
                    where.pricePerHour = {};
                    if (filter.minPricePerHour !== undefined)
                        where.pricePerHour.gte = filter.minPricePerHour;
                    if (filter.maxPricePerHour !== undefined)
                        where.pricePerHour.lte = filter.maxPricePerHour;
                }
                if (filter.critAirRating !== undefined)
                    where.critAirRating = filter.critAirRating;
                if (filter.availability !== undefined)
                    where.availability = filter.availability;
            }
            return await database_1.default.car.findMany({
                where,
                include: {
                    bookings: true,
                    images: true
                }
            });
        },
        car: async (_, { id }) => {
            return await database_1.default.car.findUnique({
                where: { id },
                include: {
                    bookings: true,
                    images: true
                }
            });
        },
        availableCars: async (_, { startDate, endDate }) => {
            // Convert string dates to Date objects
            const start = new Date(startDate);
            const end = new Date(endDate);
            // Find cars that don't have overlapping bookings
            const bookedCarIds = await database_1.default.booking.findMany({
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
            const bookedIds = bookedCarIds.map((booking) => booking.carId);
            return await database_1.default.car.findMany({
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
        createCar: async (_, { input }) => {
            return await database_1.default.car.create({
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
        updateCar: async (_, { id, input }) => {
            return await database_1.default.car.update({
                where: { id },
                data: input,
                include: {
                    bookings: true,
                    images: true
                }
            });
        },
        deleteCar: async (_, { id }) => {
            // Delete associated images from filesystem
            const images = await database_1.default.carImage.findMany({
                where: { carId: id }
            });
            for (const image of images) {
                await (0, upload_1.deleteUploadedFile)(image.imagePath);
            }
            await database_1.default.car.delete({
                where: { id }
            });
            return true;
        },
        uploadCarImages: async (_, { input }) => {
            const { carId, images, altTexts, primaryIndex } = input;
            // Verify car exists
            const car = await database_1.default.car.findUnique({
                where: { id: carId }
            });
            if (!car) {
                throw new Error('Car not found');
            }
            const uploadedImages = [];
            for (let i = 0; i < images.length; i++) {
                const image = images[i];
                const altText = altTexts?.[i] || null;
                const isPrimary = i === (primaryIndex || 0);
                // Create database record
                const carImage = await database_1.default.carImage.create({
                    data: {
                        carId,
                        imagePath: (0, upload_1.getRelativePath)(image.path),
                        altText,
                        isPrimary
                    }
                });
                uploadedImages.push(carImage);
            }
            return uploadedImages;
        },
        deleteCarImage: async (_, { imageId }) => {
            const image = await database_1.default.carImage.findUnique({
                where: { id: imageId }
            });
            if (!image) {
                throw new Error('Image not found');
            }
            // Delete from filesystem
            await (0, upload_1.deleteUploadedFile)(image.imagePath);
            // Delete from database
            await database_1.default.carImage.delete({
                where: { id: imageId }
            });
            return true;
        },
        setPrimaryCarImage: async (_, { carId, imageId }) => {
            // Verify image belongs to car
            const image = await database_1.default.carImage.findFirst({
                where: {
                    id: imageId,
                    carId
                }
            });
            if (!image) {
                throw new Error('Image not found or does not belong to this car');
            }
            // Reset all images for this car to non-primary
            await database_1.default.carImage.updateMany({
                where: { carId },
                data: { isPrimary: false }
            });
            // Set the specified image as primary
            await database_1.default.carImage.update({
                where: { id: imageId },
                data: { isPrimary: true }
            });
            return true;
        }
    },
    Car: {
        bookings: async (parent) => {
            return await database_1.default.booking.findMany({
                where: { carId: parent.id }
            });
        },
        images: async (parent) => {
            return await database_1.default.carImage.findMany({
                where: { carId: parent.id },
                orderBy: { createdAt: 'asc' }
            });
        }
    },
    CarImage: {
        car: async (parent) => {
            return await database_1.default.car.findUnique({
                where: { id: parent.carId }
            });
        }
    }
};
//# sourceMappingURL=carResolvers.js.map