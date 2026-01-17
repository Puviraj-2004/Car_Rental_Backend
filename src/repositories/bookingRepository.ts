import prisma from '../utils/database';
import { BookingStatus, CarStatus } from '@prisma/client';

/**
 * Senior Architect Note:
 * Centralized Include configurations.
 * Added 'images: true' to admin section to prevent "Cannot return null for non-nullable field Car.images" errors.
 */
export const BOOKING_INCLUDES = {
  basic: {
    user: true,
    car: { include: { model: { include: { brand: true } }, images: true } },
    payment: true,
    verification: true,
    documentVerification: true
  },
  detailed: {
    user: true,
    car: { include: { model: { include: { brand: true } }, images: true } },
    payment: true,
    verification: true,
    documentVerification: true
  },
  admin: {  // ✅ Add this
    user: true,
    car: { include: { model: { include: { brand: true } }, images: true } },
    payment: true,
    verification: true,
    documentVerification: true
  }
};

export class BookingRepository {
  async findMany(where: any = {}, include: any = BOOKING_INCLUDES.basic, orderBy: any = { startDate: 'desc' }) {
    return await prisma.booking.findMany({ where, include, orderBy });
  }

  async findUnique(id: string, include: any = BOOKING_INCLUDES.detailed) {
    return await prisma.booking.findUnique({ where: { id }, include });
  }

  async findFirst(where: any, include: any = BOOKING_INCLUDES.detailed) {
    return await prisma.booking.findFirst({ where, include });
  }

  async findVerificationToken(token: string) {
    return await prisma.bookingVerification.findUnique({ where: { token } });
  }

  async updateBookingStatus(id: string, status: BookingStatus) {
    return await prisma.booking.update({
      where: { id },
      data: { status, updatedAt: new Date() }
    });
  }

  async findConflicts(carId: string, startDate: Date, endDate: Date, excludeBookingId?: string) {
    const bufferMs = 24 * 60 * 60 * 1000;

    const noBufferOverlap = {
      OR: [
        { AND: [{ startDate: { lte: startDate } }, { endDate: { gt: startDate } }] },
        { AND: [{ startDate: { lt: endDate } }, { endDate: { gte: endDate } }] },
        { AND: [{ startDate: { gte: startDate } }, { endDate: { lte: endDate } }] }
      ]
    };

    const bufferedStart = new Date(startDate.getTime() - bufferMs);
    const bufferedEnd = new Date(endDate.getTime() + bufferMs);
    const bufferOverlap = {
      OR: [
        { AND: [{ startDate: { lte: bufferedStart } }, { endDate: { gt: bufferedStart } }] },
        { AND: [{ startDate: { lt: bufferedEnd } }, { endDate: { gte: bufferedEnd } }] },
        { AND: [{ startDate: { gte: bufferedStart } }, { endDate: { lte: bufferedEnd } }] }
      ]
    };

    const whereClause: any = {
      AND: [
        { carId },
        {
          OR: [
            { AND: [{ status: { in: [BookingStatus.PENDING, BookingStatus.VERIFIED] } }, noBufferOverlap] },
            { AND: [{ status: { in: [BookingStatus.CONFIRMED, BookingStatus.ONGOING] } }, bufferOverlap] }
          ]
        }
      ]
    };

    // Add exclude booking ID if provided
    if (excludeBookingId) {
      whereClause.AND.push({ id: { not: excludeBookingId } });
    }

    return await prisma.booking.findMany({
      where: whereClause,
      include: BOOKING_INCLUDES.basic,
      orderBy: { startDate: 'asc' }
    });
  }

  async create(data: any) {
    return await prisma.booking.create({
      data,
      include: BOOKING_INCLUDES.detailed
    });
  }

  async update(id: string, data: any) {
    return await prisma.booking.update({
      where: { id },
      data,
      include: BOOKING_INCLUDES.detailed
    });
  }

  async delete(id: string) {
    return await prisma.booking.delete({ where: { id } });
  }

  // 🚀 Transactional Start Trip: Atomic update for Booking & Car
  async startTripTransaction(bookingId: string, carId: string) {
    return await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.ONGOING, updatedAt: new Date() },
        include: BOOKING_INCLUDES.detailed
      }),
      prisma.car.update({
        where: { id: carId },
        data: { status: CarStatus.RENTED }
      })
    ]);
  }

  // 🧹 Transactional Complete Trip: Booking to COMPLETED, Car to MAINTENANCE
  async completeTripTransaction(bookingId: string, carId: string) {
    return await prisma.$transaction([
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.COMPLETED, updatedAt: new Date() },
        include: BOOKING_INCLUDES.detailed
      }),
      prisma.car.update({
        where: { id: carId },
        data: { status: CarStatus.MAINTENANCE }
      })
    ]);
  }
}

export const bookingRepository = new BookingRepository();