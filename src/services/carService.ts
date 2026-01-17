import { carRepository } from '../repositories/carRepository';
import { uploadToCloudinary } from '../utils/cloudinary';
import { validateCarFilterInput, validateCarData } from '../utils/validation';
import { AppError, ErrorCode } from '../errors/AppError';
import { Prisma } from '@prisma/client';
import {
  FileUpload,
  CarFilterInput,
  CreateCarInput,
  UpdateCarInput,
  CreateBrandInput,
  UpdateBrandInput,
  CreateModelInput,
  UpdateModelInput,
  CarStatus,
  BookingStatus
} from '../types/graphql';

export class CarService {
  private buildBookingAvailabilityFilter(startDateTime: Date, endDateTime: Date) {
    const bufferMs = 24 * 60 * 60 * 1000;

    const overlapNoBuffer = { AND: [{ startDate: { lt: endDateTime } }, { endDate: { gt: startDateTime } }] };
    const overlapWithBuffer = {
      OR: [
        { AND: [{ startDate: { lt: new Date(endDateTime.getTime() + bufferMs) } }, { endDate: { gt: new Date(startDateTime.getTime() - bufferMs) } }] }]
    };

    return {
      none: {
        OR: [
          {
            AND: [
              { status: { in: [BookingStatus.PENDING, BookingStatus.VERIFIED] as any } },
              overlapNoBuffer
            ]
          },
          {
            AND: [
              { status: { in: [BookingStatus.CONFIRMED, BookingStatus.ONGOING] as any } },
              overlapWithBuffer
            ]
          }
        ]
      }
    };
  }

  private buildStatusFilter(includeOutOfService: boolean = false) {
    return includeOutOfService ? {} : { status: { not: 'OUT_OF_SERVICE' } };
  }

  async getCars(filter?: CarFilterInput) {
    if (filter && (filter.startDate || filter.endDate)) {
      const validation = validateCarFilterInput(filter);
      if (!validation.isValid) {
        throw new AppError(`Filter validation failed: ${validation.errors.join(', ')}`, ErrorCode.BAD_USER_INPUT);
      }
    }

  

    const where: Prisma.CarWhereInput = {};
    if (filter) {
      if (filter.brandIds?.length) (where as any).brandId = { in: filter.brandIds };  
      if (filter.modelIds?.length) (where as any).modelId = { in: filter.modelIds };
      if (filter.fuelTypes?.length) (where as any).fuelType = { in: filter.fuelTypes };
      if (filter.transmissions?.length) (where as any).transmission = { in: filter.transmissions };
      if (filter.statuses?.length) (where as any).status = { in: filter.statuses };
      if (filter.critAirRatings?.length) (where as any).critAirRating = { in: filter.critAirRatings };

      if (filter.startDate && filter.endDate) {
        const start = filter.startDate.includes('T') ? new Date(filter.startDate) : new Date(`${filter.startDate}T10:00:00`);
        const end = filter.endDate.includes('T') ? new Date(filter.endDate) : new Date(`${filter.endDate}T10:00:00`);
        where.status = { in: [CarStatus.AVAILABLE, CarStatus.RENTED] };
        where.bookings = this.buildBookingAvailabilityFilter(start, end);
      } else {
        Object.assign(where, this.buildStatusFilter(filter.includeOutOfService));
      }
    } else {
      Object.assign(where, this.buildStatusFilter(false));
    }

    return await carRepository.findMany(where);
  }

  async getAvailableCars(startDate: string, endDate: string) {
    const start = startDate.includes('T') ? new Date(startDate) : new Date(`${startDate}T10:00:00`);
    const end = endDate.includes('T') ? new Date(endDate) : new Date(`${endDate}T10:00:00`);

    return await carRepository.findMany({
      status: { in: [CarStatus.AVAILABLE, CarStatus.RENTED] },
      bookings: this.buildBookingAvailabilityFilter(start, end)
    });
  }

  async addCarImage(carId: string, file: FileUpload, isPrimary: boolean) {
    const { filename, createReadStream } = await file;
    if (!createReadStream) throw new AppError("File upload failed", ErrorCode.UPLOAD_ERROR);

    const uploadResult = await uploadToCloudinary(createReadStream(), 'cars', false, filename);

    if (isPrimary) {
      await carRepository.updateManyImages({ carId }, { isPrimary: false });
    }

    return await carRepository.createImage({
      car: { connect: { id: carId } },
      url: uploadResult.secure_url,
      isPrimary: isPrimary || false
    });
  }

  async setPrimaryImage(carId: string, imageId: string) {
    await carRepository.updateManyImages({ carId }, { isPrimary: false });
    await carRepository.updateImage(imageId, { isPrimary: true });
    return true;
  }

  async getCarById(id: string) {
    return await carRepository.findUnique(id);
  }

  async getBrands() {
    return await carRepository.findBrands();
  }

  async getModelsByBrand(brandId: string) {
    return await carRepository.findModelsByBrand(brandId);
  }

  async createBrand(data: CreateBrandInput) {
    // Business logic validation for brand creation
    if (!data.name || data.name.trim().length === 0) {
      throw new AppError('Brand name is required', ErrorCode.BAD_USER_INPUT);
    }

    return await carRepository.createBrand(data);
  }

  async updateBrand(id: string, data: UpdateBrandInput) {
    // Business logic validation for brand update
    if (!data.name || data.name.trim().length === 0) {
      throw new AppError('Brand name is required', ErrorCode.BAD_USER_INPUT);
    }

    return await carRepository.updateBrand(id, data);
  }

  async deleteBrand(id: string) {
    // Check if brand is being used by any models
    const modelsCount = await carRepository.countModelsByBrand(id);
    if (modelsCount > 0) {
      throw new AppError('Cannot delete brand that has associated models', ErrorCode.BAD_USER_INPUT);
    }

    return await carRepository.deleteBrand(id);
  }

  async createModel(data: CreateModelInput) {
    // Business logic validation for model creation
    if (!data.name || data.name.trim().length === 0) {
      throw new AppError('Model name is required', ErrorCode.BAD_USER_INPUT);
    }
    if (!data.brandId) {
      throw new AppError('Brand ID is required', ErrorCode.BAD_USER_INPUT);
    }

    return await carRepository.createModel(data);
  }

  async updateModel(id: string, data: UpdateModelInput) {
    // Business logic validation for model update
    if (!data.name || data.name.trim().length === 0) {
      throw new AppError('Model name is required', ErrorCode.BAD_USER_INPUT);
    }

    return await carRepository.updateModel(id, data);
  }

  async deleteModel(id: string) {
    // Validate ID format
    if (!id || id.trim() === '') {
      throw new AppError('Model ID is required', ErrorCode.BAD_USER_INPUT);
    }

    try {
      // Check if model is being used by any cars
      const carsCount = await carRepository.countCarsByModel(id);
      if (carsCount > 0) {
        throw new AppError('Cannot delete model that has associated cars', ErrorCode.BAD_USER_INPUT);
      }

      return await carRepository.deleteModel(id);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      // Handle Prisma "record not found" error
      if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
        throw new AppError('Model not found. It may have been already deleted.', ErrorCode.NOT_FOUND);
      }
      throw error;
    }
  }
  
  async createCar(data: CreateCarInput) {
    // Comprehensive input validation
    const validation = validateCarData(data);
    if (!validation.isValid) {
      throw new AppError(validation.errors[0], ErrorCode.BAD_USER_INPUT);
    }

    // Additional business logic validation
    if (!data.modelId) {
      throw new AppError('Model ID is required', ErrorCode.BAD_USER_INPUT);
    }
    if (!data.brandId) {
      throw new AppError('Brand ID is required', ErrorCode.BAD_USER_INPUT);
    }
    if (!data.plateNumber || data.plateNumber.trim().length === 0) {
      throw new AppError('Plate number is required', ErrorCode.BAD_USER_INPUT);
    }

    // Create car data with both modelId and brandId
    const { modelId, brandId, ...restData } = data;
    const carData: any = {
      ...restData,
      modelId,
      brandId,  // NEW: Include brandId directly
      requiredLicense: (restData.requiredLicense || 'B') as any,
    };

    return await carRepository.createCar(carData);
  }

  async getModels(brandId?: string) {
    if (brandId) {
      return await carRepository.findModelsByBrand(brandId);
    }
    return await carRepository.findAllModels();
  }

  async updateCar(id: string, data: UpdateCarInput) {
    // Comprehensive input validation
    const validation = validateCarData(data);
    if (!validation.isValid) {
      throw new AppError(validation.errors[0], ErrorCode.BAD_USER_INPUT);
    }

    // Additional business logic validation for car update
    if (data.plateNumber && data.plateNumber.trim().length === 0) {
      throw new AppError('Plate number cannot be empty', ErrorCode.BAD_USER_INPUT);
    }

    // Transform GraphQL input to Prisma input
    const updateData: Prisma.CarUpdateInput = {
      ...data,
      requiredLicense: data.requiredLicense as any,
    };

    return await carRepository.updateCar(id, updateData);
  }

  async deleteCar(id: string) {
    // Check if car has any active bookings
    const activeBookingsCount = await carRepository.countActiveBookings(id);
    if (activeBookingsCount > 0) {
      throw new AppError('Cannot delete car with active bookings', ErrorCode.BAD_USER_INPUT);
    }

    return await carRepository.deleteCar(id);
  }

  async deleteCarImage(imageId: string) {
    return await carRepository.deleteImage(imageId);
  }

  async getCarBrand(carId: string) {
    const carWithDetails = await carRepository.findUnique(carId);
    return carWithDetails?.model?.brand;
  }

  async finishMaintenance(carId: string) {
    // Set car status back to available after maintenance
    return await carRepository.updateCar(carId, { status: CarStatus.AVAILABLE });
  }
}

export const carService = new CarService();