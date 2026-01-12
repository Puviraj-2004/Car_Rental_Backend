import prisma from '../utils/database';
import { Prisma, BookingStatus, CarStatus } from '@prisma/client'; // ✅ Use Prisma native enums for repo

/**
 * Senior Architect Note:
 * Centralized Include configurations.
 * Added 'images: true' to the admin section to prevent "Cannot return null for non-nullable field Car.images" errors.
 */
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
    car: { include: { model: { include: { brand: true } }, images: true } }, // ✅ FIXED: Added images: true
    payment: true,
    verification: true
  }
};

export class BookingRepository {
  async findMany(
    where: Prisma.BookingWhereInput, 
    include: Prisma.BookingInclude = BOOKING_INCLUDES.detailed, 
    orderBy: Prisma.BookingOrderByWithRelationInput = { createdAt: 'desc' }
  ) {
    return await prisma.booking.findMany({ where, include, orderBy });
  }

  async findUnique(id: string, include: Prisma.BookingInclude = BOOKING_INCLUDES.detailed) {
    return await prisma.booking.findUnique({ where: { id }, include });
  }

  async findFirst(where: Prisma.BookingWhereInput, include: Prisma.BookingInclude = BOOKING_INCLUDES.detailed) {
    return await prisma.booking.findFirst({ where, include });
  }

  async findVerificationToken(token: string) {
    return await prisma.bookingVerification.findUnique({ where: { token } });
  }

  async findConflicts(carId: string, startDate: Date, endDate: Date, excludeBookingId?: string) {
    // 🛡️ Senior Logic: Strict Status-based conflict check
    const conflictStatuses: BookingStatus[] = [
      BookingStatus.PENDING, 
      BookingStatus.VERIFIED, 
      BookingStatus.CONFIRMED, 
      BookingStatus.ONGOING
    ];

    const whereClause: any = {
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
    };

    // Add exclude booking ID if provided
    if (excludeBookingId) {
      whereClause.AND.push({ id: { not: excludeBookingId } });
    }

    return await prisma.booking.findMany({
      where: whereClause,
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

  async update(
    id: string, 
    data: Prisma.BookingUpdateInput, 
    include: Prisma.BookingInclude = BOOKING_INCLUDES.detailed
  ) {
    return await prisma.booking.update({ where: { id }, data, include });
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
