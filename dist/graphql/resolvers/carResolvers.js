"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.carResolvers = void 0;
const upload_1 = require("../../utils/upload");
const database_1 = __importDefault(require("../../utils/database"));
const graphql_upload_ts_1 = require("graphql-upload-ts");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
exports.carResolvers = {
    Upload: graphql_upload_ts_1.GraphQLUpload,
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
                if (filter.availability !== undefined)
                    where.availability = filter.availability;
            }
            return await database_1.default.car.findMany({
                where,
                include: { images: true, bookings: true }
            });
        },
        car: async (_, { id }) => {
            return await database_1.default.car.findUnique({
                where: { id },
                include: { images: true, bookings: true }
            });
        },
    },
    Mutation: {
        createCar: async (_, { input }) => {
            return await database_1.default.car.create({
                data: { ...input, availability: input.availability ?? true },
                include: { images: true }
            });
        },
        uploadCarImages: async (_, { input }) => {
            const { carId, images, altTexts, primaryIndex } = input;
            const car = await database_1.default.car.findUnique({ where: { id: carId } });
            if (!car)
                throw new Error('Car not found');
            const uploadedImages = [];
            // Ensure upload directory exists
            const uploadDir = path_1.default.join(process.cwd(), 'uploads');
            if (!fs_1.default.existsSync(uploadDir)) {
                fs_1.default.mkdirSync(uploadDir, { recursive: true });
            }
            for (let i = 0; i < images.length; i++) {
                const file = await images[i];
                const { createReadStream, filename } = file;
                const fileExt = path_1.default.extname(filename);
                const newFilename = `${carId}-${Date.now()}-${i}${fileExt}`;
                const filePath = path_1.default.join(uploadDir, newFilename);
                // Save file to filesystem
                const stream = createReadStream();
                await new Promise((resolve, reject) => {
                    const writeStream = fs_1.default.createWriteStream(filePath);
                    stream.pipe(writeStream);
                    writeStream.on('finish', resolve);
                    writeStream.on('error', reject);
                });
                const isPrimary = i === (primaryIndex || 0);
                // Save to Database
                const carImage = await database_1.default.carImage.create({
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
        deleteCar: async (_, { id }) => {
            const images = await database_1.default.carImage.findMany({ where: { carId: id } });
            for (const image of images) {
                await (0, upload_1.deleteUploadedFile)(image.imagePath);
            }
            await database_1.default.car.delete({ where: { id } });
            return true;
        },
        deleteCarImage: async (_, { imageId }) => {
            const image = await database_1.default.carImage.findUnique({ where: { id: imageId } });
            if (!image)
                throw new Error('Image not found');
            await (0, upload_1.deleteUploadedFile)(image.imagePath);
            await database_1.default.carImage.delete({ where: { id: imageId } });
            return true;
        },
    },
    Car: {
        images: async (parent) => {
            return await database_1.default.carImage.findMany({
                where: { carId: parent.id },
                orderBy: { isPrimary: 'desc' }
            });
        }
    }
};
//# sourceMappingURL=carResolvers.js.map