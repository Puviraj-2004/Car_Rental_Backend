"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.carRepository = exports.CarRepository = exports.CAR_INCLUDES = void 0;
const database_1 = __importDefault(require("../utils/database"));
const client_1 = require("@prisma/client");
exports.CAR_INCLUDES = {
    model: { include: { brand: true } },
    images: true,
    bookings: true,
};
class CarRepository {
    async findMany(where) {
        return await database_1.default.car.findMany({
            where,
            include: { model: { include: { brand: true } }, images: true },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findUnique(id) {
        return await database_1.default.car.findUnique({
            where: { id },
            include: {
                model: { include: { brand: true } },
                images: { orderBy: { isPrimary: 'desc' } },
                bookings: true
            }
        });
    }
    async findAllModels() {
        return await database_1.default.vehicleModel.findMany({
            include: { brand: true },
            orderBy: { name: 'asc' }
        });
    }
    async findBrands() {
        return await database_1.default.brand.findMany({ orderBy: { name: 'asc' } });
    }
    async findModelsByBrand(brandId) {
        return await database_1.default.vehicleModel.findMany({
            where: { brandId },
            orderBy: { name: 'asc' }
        });
    }
    // Admin CRUD - Brands
    async createBrand(data) {
        return await database_1.default.brand.create({ data });
    }
    async updateBrand(id, data) {
        return await database_1.default.brand.update({ where: { id }, data });
    }
    async deleteBrand(id) {
        return await database_1.default.brand.delete({ where: { id } });
    }
    // Admin CRUD - Models
    async createModel(data) {
        return await database_1.default.vehicleModel.create({ data });
    }
    async updateModel(id, data) {
        return await database_1.default.vehicleModel.update({ where: { id }, data });
    }
    async deleteModel(id) {
        // First check if model exists
        const existingModel = await database_1.default.vehicleModel.findUnique({
            where: { id }
        });
        if (!existingModel) {
            throw new Error(`Model with ID ${id} not found`);
        }
        await database_1.default.vehicleModel.delete({ where: { id } });
        return true; // Return boolean instead of deleted record
    }
    // Admin CRUD - Cars
    async createCar(data) {
        return await database_1.default.car.create({
            data,
            include: { model: { include: { brand: true } } }
        });
    }
    async updateCar(id, data) {
        return await database_1.default.car.update({
            where: { id },
            data,
            include: { model: { include: { brand: true } } }
        });
    }
    async deleteCar(id) {
        return await database_1.default.car.delete({ where: { id } });
    }
    // Image Management
    async findImageById(id) {
        return await database_1.default.carImage.findUnique({ where: { id } });
    }
    async createImage(data) {
        return await database_1.default.carImage.create({ data });
    }
    async deleteImage(id) {
        return await database_1.default.carImage.delete({ where: { id } });
    }
    async updateManyImages(where, data) {
        return await database_1.default.carImage.updateMany({ where, data });
    }
    async updateImage(id, data) {
        return await database_1.default.carImage.update({ where: { id }, data });
    }
    // Helper methods for business logic validation
    async countModelsByBrand(brandId) {
        return await database_1.default.vehicleModel.count({
            where: { brandId }
        });
    }
    async countCarsByModel(modelId) {
        return await database_1.default.car.count({
            where: { modelId }
        });
    }
    async countActiveBookings(carId) {
        return await database_1.default.booking.count({
            where: {
                carId,
                status: {
                    in: [client_1.BookingStatus.PENDING, client_1.BookingStatus.VERIFIED, client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.ONGOING]
                }
            }
        });
    }
}
exports.CarRepository = CarRepository;
exports.carRepository = new CarRepository();
//# sourceMappingURL=carRepository.js.map