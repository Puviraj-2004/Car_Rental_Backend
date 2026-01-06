import prisma from '../utils/database';
import { Prisma, BookingStatus } from '@prisma/client';

export const CAR_INCLUDES = {
  model: { include: { brand: true } },
  images: true,
  bookings: true,
};

export class CarRepository {
  async findMany(where: Prisma.CarWhereInput) {
    return await prisma.car.findMany({
      where,
      include: { model: { include: { brand: true } }, images: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findUnique(id: string) {
    return await prisma.car.findUnique({
      where: { id },
      include: {
        model: { include: { brand: true } },
        images: { orderBy: { isPrimary: 'desc' } },
        bookings: true
      }
    });
  }

  async findBrands() {
    return await prisma.brand.findMany({ orderBy: { name: 'asc' } });
  }

  async findModelsByBrand(brandId: string) {
    return await prisma.vehicleModel.findMany({ 
      where: { brandId }, 
      orderBy: { name: 'asc' } 
    });
  }

  // Admin CRUD - Brands
  async createBrand(data: { name: string; logoUrl?: string }) {
    return await prisma.brand.create({ data });
  }
  async updateBrand(id: string, data: { name?: string; logoUrl?: string }) {
    return await prisma.brand.update({ where: { id }, data });
  }
  async deleteBrand(id: string) {
    return await prisma.brand.delete({ where: { id } });
  }

  // Admin CRUD - Models
  async createModel(data: { name: string; brandId: string }) {
    return await prisma.vehicleModel.create({ data });
  }
  async updateModel(id: string, data: { name?: string }) {
    return await prisma.vehicleModel.update({ where: { id }, data });
  }
  async deleteModel(id: string) {
    return await prisma.vehicleModel.delete({ where: { id } });
  }

  // Admin CRUD - Cars
  async createCar(data: Prisma.CarCreateInput) {
    return await prisma.car.create({
      data,
      include: { model: { include: { brand: true } } }
    });
  }
  async updateCar(id: string, data: Prisma.CarUpdateInput) {
    return await prisma.car.update({
      where: { id },
      data,
      include: { model: { include: { brand: true } } }
    });
  }
  async deleteCar(id: string) {
    return await prisma.car.delete({ where: { id } });
  }

  // Image Management
  async findImageById(id: string) {
    return await prisma.carImage.findUnique({ where: { id } });
  }
  async createImage(data: Prisma.CarImageCreateInput) {
    return await prisma.carImage.create({ data });
  }
  async deleteImage(id: string) {
    return await prisma.carImage.delete({ where: { id } });
  }
  async updateManyImages(where: Prisma.CarImageWhereInput, data: Prisma.CarImageUpdateManyMutationInput) {
    return await prisma.carImage.updateMany({ where, data });
  }
  async updateImage(id: string, data: Prisma.CarImageUpdateInput) {
    return await prisma.carImage.update({ where: { id }, data });
  }

  // Helper methods for business logic validation
  async countModelsByBrand(brandId: string): Promise<number> {
    return await prisma.vehicleModel.count({
      where: { brandId }
    });
  }

  async countCarsByModel(modelId: string): Promise<number> {
    return await prisma.car.count({
      where: { modelId }
    });
  }

  async countActiveBookings(carId: string): Promise<number> {
    return await prisma.booking.count({
      where: {
        carId,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.VERIFIED, BookingStatus.CONFIRMED, BookingStatus.ONGOING]
        }
      }
    });
  }
}

export const carRepository = new CarRepository();