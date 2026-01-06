import prisma from '../utils/database';
import { BookingStatus, CarStatus } from '../types/graphql';
import { Prisma } from '@prisma/client';

export const BOOKING_INCLUDES = {
  basic: {
    car: { include: { model: { include: { brand: true } } } },
    payment: true
  },
  detailed: {
    user: true,
    car: { include: { model: { include: { brand: true } }, images: true } },
    payment: true,
    verification: true,
  },
  admin: {
    user: true,
    car: { include: { model: { include: { brand: true } } } },
    payment: true,
    verification: true
  }
};

export class BookingRepository {
  async findMany(where: Prisma.BookingWhereInput, include?: Prisma.BookingInclude, orderBy: Prisma.BookingOrderByWithRelationInput = { createdAt: 'desc' }) {
    return await prisma.booking.findMany({ where, include, orderBy });
  }

  async findUnique(id: string, include?: Prisma.BookingInclude) {
    return await prisma.booking.findUnique({ where: { id }, include });
  }

  async findFirst(where: Prisma.BookingWhereInput, include?: Prisma.BookingInclude) {
    return await prisma.booking.findFirst({ where, include });
  }

  async findVerificationToken(token: string) {
    return await prisma.bookingVerification.findUnique({ where: { token } });
  }

  async findConflicts(carId: string, startDate: Date, endDate: Date) {
    const conflictStatuses = [BookingStatus.PENDING, BookingStatus.VERIFIED, BookingStatus.CONFIRMED, BookingStatus.ONGOING];
    return await prisma.booking.findMany({
      where: {
        AND: [
          { carId },
          { status: { in: conflictStatuses } },
          {
            OR: [
              { AND: [{ startDate: { lte: startDate } }, { endDate: { gt: startDate } }] },
              { AND: [{ startDate: { lt: endDate } }, { endDate: { gte: endDate } }] },
              { AND: [{ startDate: { gte: startDate } }, { endDate: { lte: endDate } }] }
            ]
          }
        ]
      },
      include: { user: true },
      orderBy: { startDate: 'asc' }
    });
  }

  async create(data: Prisma.BookingCreateInput) {
    return await prisma.booking.create({
      data,
      include: { car: { include: { model: { include: { brand: true } } } } }
    });
  }

  async update(id: string, data: Prisma.BookingUpdateInput, include: Prisma.BookingInclude = BOOKING_INCLUDES.detailed) {
    return await prisma.booking.update({ where: { id }, data, include });
  }

  async delete(id: string) {
    return await prisma.booking.delete({ where: { id } });
  }

  async startTripTransaction(bookingId: string, carId: string) {
    return await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.ONGOING, updatedAt: new Date() }
      });
      await tx.car.update({
        where: { id: carId },
        data: { status: CarStatus.RENTED }
      });
      return b;
    });
  }

  async completeTripTransaction(bookingId: string, carId: string) {
    return await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.COMPLETED, updatedAt: new Date() }
      });
      await tx.car.update({
        where: { id: carId },
        data: { status: CarStatus.MAINTENANCE }
      });
      return b;
    });
  }
}

export const bookingRepository = new BookingRepository();