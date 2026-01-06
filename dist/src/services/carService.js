"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.carService = exports.CarService = void 0;
const carRepository_1 = require("../repositories/carRepository");
const cloudinary_1 = require("../utils/cloudinary");
const validation_1 = require("../utils/validation");
const AppError_1 = require("../errors/AppError");
const graphql_1 = require("../types/graphql");
class CarService {
    buildBookingAvailabilityFilter(startDateTime, endDateTime, includeBuffer = false) {
        const bufferMs = includeBuffer ? 24 * 60 * 60 * 1000 : 0;
        const conflictStatuses = [graphql_1.BookingStatus.PENDING, graphql_1.BookingStatus.VERIFIED, graphql_1.BookingStatus.CONFIRMED, graphql_1.BookingStatus.ONGOING];
        const dateOverlapConditions = includeBuffer ? [
            { AND: [{ startDate: { lt: endDateTime } }, { endDate: { gt: startDateTime } }] },
            { AND: [{ endDate: { gte: new Date(startDateTime.getTime() - bufferMs) } }, { endDate: { lt: startDateTime } }] },
            { AND: [{ startDate: { lte: new Date(endDateTime.getTime() + bufferMs) } }, { startDate: { gt: endDateTime } }] }
        ] : [
            { AND: [{ startDate: { lt: endDateTime } }, { endDate: { gt: startDateTime } }] }
        ];
        return {
            none: {
                AND: [
                    { status: { in: conflictStatuses } },
                    { OR: dateOverlapConditions }
                ]
            }
        };
    }
    buildStatusFilter(includeOutOfService = false) {
        return includeOutOfService ? {} : { status: { not: 'OUT_OF_SERVICE' } };
    }
    async getCars(filter) {
        if (filter && (filter.startDate || filter.endDate)) {
            const validation = (0, validation_1.validateCarFilterInput)(filter);
            if (!validation.isValid) {
                throw new AppError_1.AppError(`Filter validation failed: ${validation.errors.join(', ')}`, AppError_1.ErrorCode.BAD_USER_INPUT);
            }
        }
        const where = {};
        if (filter) {
            if (filter.brandIds?.length)
                where.model = { brandId: { in: filter.brandIds } };
            if (filter.modelIds?.length)
                where.modelId = { in: filter.modelIds };
            if (filter.fuelTypes?.length)
                where.fuelType = { in: filter.fuelTypes };
            if (filter.transmissions?.length)
                where.transmission = { in: filter.transmissions };
            if (filter.statuses?.length)
                where.status = { in: filter.statuses };
            if (filter.critAirRatings?.length)
                where.critAirRating = { in: filter.critAirRatings };
            if (filter.startDate && filter.endDate) {
                const start = filter.startDate.includes('T') ? new Date(filter.startDate) : new Date(`${filter.startDate}T10:00:00`);
                const end = filter.endDate.includes('T') ? new Date(filter.endDate) : new Date(`${filter.endDate}T10:00:00`);
                where.status = { in: [graphql_1.CarStatus.AVAILABLE, graphql_1.CarStatus.RENTED] };
                where.bookings = this.buildBookingAvailabilityFilter(start, end, true);
            }
            else {
                Object.assign(where, this.buildStatusFilter(filter.includeOutOfService));
            }
        }
        else {
            Object.assign(where, this.buildStatusFilter(false));
        }
        return await carRepository_1.carRepository.findMany(where);
    }
    async getAvailableCars(startDate, endDate) {
        const start = startDate.includes('T') ? new Date(startDate) : new Date(`${startDate}T10:00:00`);
        const end = endDate.includes('T') ? new Date(endDate) : new Date(`${endDate}T10:00:00`);
        return await carRepository_1.carRepository.findMany({
            status: { in: [graphql_1.CarStatus.AVAILABLE, graphql_1.CarStatus.RENTED] },
            bookings: this.buildBookingAvailabilityFilter(start, end, false)
        });
    }
    async addCarImage(carId, file, isPrimary) {
        const { filename, createReadStream } = await file;
        if (!createReadStream)
            throw new AppError_1.AppError("File upload failed", AppError_1.ErrorCode.UPLOAD_ERROR);
        const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(createReadStream(), 'cars', false, filename);
        if (isPrimary) {
            await carRepository_1.carRepository.updateManyImages({ carId }, { isPrimary: false });
        }
        return await carRepository_1.carRepository.createImage({
            car: { connect: { id: carId } },
            url: uploadResult.secure_url,
            isPrimary: isPrimary || false
        });
    }
    async setPrimaryImage(carId, imageId) {
        await carRepository_1.carRepository.updateManyImages({ carId }, { isPrimary: false });
        await carRepository_1.carRepository.updateImage(imageId, { isPrimary: true });
        return true;
    }
    async getCarById(id) {
        return await carRepository_1.carRepository.findUnique(id);
    }
    async getBrands() {
        return await carRepository_1.carRepository.findBrands();
    }
    async getModelsByBrand(brandId) {
        return await carRepository_1.carRepository.findModelsByBrand(brandId);
    }
    async createBrand(data) {
        // Business logic validation for brand creation
        if (!data.name || data.name.trim().length === 0) {
            throw new AppError_1.AppError('Brand name is required', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        return await carRepository_1.carRepository.createBrand(data);
    }
    async updateBrand(id, data) {
        // Business logic validation for brand update
        if (!data.name || data.name.trim().length === 0) {
            throw new AppError_1.AppError('Brand name is required', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        return await carRepository_1.carRepository.updateBrand(id, data);
    }
    async deleteBrand(id) {
        // Check if brand is being used by any models
        const modelsCount = await carRepository_1.carRepository.countModelsByBrand(id);
        if (modelsCount > 0) {
            throw new AppError_1.AppError('Cannot delete brand that has associated models', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        return await carRepository_1.carRepository.deleteBrand(id);
    }
    async createModel(data) {
        // Business logic validation for model creation
        if (!data.name || data.name.trim().length === 0) {
            throw new AppError_1.AppError('Model name is required', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        if (!data.brandId) {
            throw new AppError_1.AppError('Brand ID is required', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        return await carRepository_1.carRepository.createModel(data);
    }
    async updateModel(id, data) {
        // Business logic validation for model update
        if (!data.name || data.name.trim().length === 0) {
            throw new AppError_1.AppError('Model name is required', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        return await carRepository_1.carRepository.updateModel(id, data);
    }
    async deleteModel(id) {
        // Check if model is being used by any cars
        const carsCount = await carRepository_1.carRepository.countCarsByModel(id);
        if (carsCount > 0) {
            throw new AppError_1.AppError('Cannot delete model that has associated cars', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        return await carRepository_1.carRepository.deleteModel(id);
    }
    async createCar(data) {
        // Comprehensive input validation
        const validation = (0, validation_1.validateCarData)(data);
        if (!validation.isValid) {
            throw new AppError_1.AppError(validation.errors[0], AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        // Additional business logic validation
        if (!data.modelId) {
            throw new AppError_1.AppError('Model ID is required', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        if (!data.plateNumber || data.plateNumber.trim().length === 0) {
            throw new AppError_1.AppError('Plate number is required', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        // Create the car data without modelId, then add the model relation
        const { modelId, ...restData } = data;
        const carData = {
            ...restData,
            model: { connect: { id: modelId } },
            requiredLicense: (restData.requiredLicense || 'B'),
        };
        return await carRepository_1.carRepository.createCar(carData);
    }
    async updateCar(id, data) {
        // Comprehensive input validation
        const validation = (0, validation_1.validateCarData)(data);
        if (!validation.isValid) {
            throw new AppError_1.AppError(validation.errors[0], AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        // Additional business logic validation for car update
        if (data.plateNumber && data.plateNumber.trim().length === 0) {
            throw new AppError_1.AppError('Plate number cannot be empty', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        // Transform GraphQL input to Prisma input
        const updateData = {
            ...data,
            requiredLicense: data.requiredLicense,
        };
        return await carRepository_1.carRepository.updateCar(id, updateData);
    }
    async deleteCar(id) {
        // Check if car has any active bookings
        const activeBookingsCount = await carRepository_1.carRepository.countActiveBookings(id);
        if (activeBookingsCount > 0) {
            throw new AppError_1.AppError('Cannot delete car with active bookings', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        return await carRepository_1.carRepository.deleteCar(id);
    }
    async deleteCarImage(imageId) {
        return await carRepository_1.carRepository.deleteImage(imageId);
    }
    async getCarBrand(carId) {
        const carWithDetails = await carRepository_1.carRepository.findUnique(carId);
        return carWithDetails?.model?.brand;
    }
    async finishMaintenance(carId) {
        // Set car status back to available after maintenance
        return await carRepository_1.carRepository.updateCar(carId, { status: graphql_1.CarStatus.AVAILABLE });
    }
}
exports.CarService = CarService;
exports.carService = new CarService();
//# sourceMappingURL=carService.js.map