import { bookingRepository, BOOKING_INCLUDES } from '../repositories/bookingRepository';
import { AppError, ErrorCode } from '../errors/AppError';
import { carService } from './carService';
import { Prisma } from '@prisma/client';
import { CreateBookingInput, UpdateBookingInput } from '../types/graphql';
import { BookingStatus } from '@prisma/client';
import { validateBookingInput } from '../utils/validation';
import { calculateRentalCost, calculateTax, calculateTotalPrice } from '../utils/calculation';
import crypto from 'crypto';

export class BookingService {
  async checkAvailability(carId: string, startDate: string, endDate: string, excludeBookingId?: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const conflicts = await bookingRepository.findConflicts(carId, start, end, excludeBookingId);
    return {
      available: conflicts.length === 0,
      conflictingBookings: conflicts
    };
  }

  async createBooking(userId: string, role: string, input: CreateBookingInput) {
    // Comprehensive input validation
    const validation = validateBookingInput(input);
    if (!validation.isValid) {
      throw new AppError(validation.errors[0], ErrorCode.BAD_USER_INPUT);
    }

    if (input.bookingType === 'REPLACEMENT' && role !== 'ADMIN') {
      throw new AppError('Only admins can create courtesy car bookings', ErrorCode.FORBIDDEN);
    }

    const start = new Date(input.startDate);
    const end = new Date(input.endDate);

    if (start >= end) throw new AppError('End date must be after start date', ErrorCode.BAD_USER_INPUT);
    
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    if (durationHours < 2) throw new AppError('Minimum duration is 2 hours', ErrorCode.BAD_USER_INPUT);

    const { available } = await this.checkAvailability(input.carId, input.startDate, input.endDate);
    if (!available) throw new AppError('Car is not available for these dates', ErrorCode.ALREADY_EXISTS);

    // Get car details for pricing calculation
    const car = await carService.getCarById(input.carId);
    if (!car) throw new AppError('Car not found', ErrorCode.NOT_FOUND);

    // Calculate rental duration in days
    const durationDays = Math.ceil(durationHours / 24);
    
    // Calculate base price using car's daily rate
    const basePrice = calculateRentalCost('DAY', durationDays, null, null, car.pricePerDay);
    
    // Calculate tax (20% tax rate)
    const taxAmount = calculateTax(basePrice, 20);
    
    // Calculate total price (excluding deposit)
    const totalPrice = calculateTotalPrice(basePrice, taxAmount);

    // Transform GraphQL input to Prisma input
    const bookingData: Prisma.BookingCreateInput = {
      user: { connect: { id: userId } },
      car: { connect: { id: input.carId } },
      startDate: start,
      endDate: end,
      status: BookingStatus.DRAFT,
      endOdometer: 0,
      damageFee: input.damageFee || 0,
      extraKmFee: input.extraKmFee || 0,
      // Add calculated pricing (deposit separate from total)
      basePrice,
      taxAmount,
      totalPrice,
      depositAmount: car.depositAmount,
    };

    return await bookingRepository.create(bookingData);
  }

  async confirmReservation(id: string, userId: string) {
    const booking = await bookingRepository.findFirst({ id, userId });
    if (!booking) throw new AppError('Booking not found', ErrorCode.NOT_FOUND);
    if (booking.status !== BookingStatus.DRAFT) throw new AppError('Only draft bookings can be confirmed', ErrorCode.BAD_USER_INPUT);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    return await bookingRepository.update(id, {
      status: BookingStatus.PENDING,
      verification: { create: { token, expiresAt } }
    });
  }

  async startTrip(bookingId: string) {
    const booking = await bookingRepository.findUnique(bookingId, { car: true });
    if (!booking) throw new AppError('Booking not found', ErrorCode.NOT_FOUND);
    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.VERIFIED) {
      throw new AppError('Booking not ready for pickup', ErrorCode.BAD_USER_INPUT);
    }
    return await bookingRepository.startTripTransaction(bookingId, booking.carId);
  }

  async completeTrip(bookingId: string) {
    const booking = await bookingRepository.findUnique(bookingId, {});
    if (!booking) throw new AppError('Booking not found', ErrorCode.NOT_FOUND);
    return await bookingRepository.completeTripTransaction(bookingId, booking.carId);
  }

  async getBookingByToken(token: string) {
    const verification = await bookingRepository.findVerificationToken(token);
    if (!verification) throw new AppError('Invalid token', ErrorCode.BAD_USER_INPUT);
    if (verification.expiresAt < new Date()) throw new AppError('Token expired', ErrorCode.BAD_USER_INPUT);

    return await bookingRepository.findUnique(verification.bookingId, BOOKING_INCLUDES.detailed);
  }

  async getAllBookings() {
    return await bookingRepository.findMany({}, BOOKING_INCLUDES.admin);
  }

  async getBookingsByUserId(userId: string) {
    return await bookingRepository.findMany({ userId }, BOOKING_INCLUDES.detailed);
  }

  async getBookingById(id: string) {
    return await bookingRepository.findUnique(id, BOOKING_INCLUDES.detailed);
  }

  async getBookingsByUserIdBasic(userId: string) {
    return await bookingRepository.findMany({ userId }, BOOKING_INCLUDES.basic);
  }

  async getBookingsByCarId(carId: string) {
    return await bookingRepository.findMany({ carId }, BOOKING_INCLUDES.basic, { startDate: 'desc' });
  }

  async getBookingForAuth(id: string) {
    // Minimal method for authorization checks - returns only userId
    const booking = await bookingRepository.findUnique(id, {});
    return booking ? { userId: booking.userId } : null;
  }

  async updateBookingStatus(id: string, status: BookingStatus, userId?: string, role?: string) {
    // Business logic validation for booking status updates
    const validStatuses: BookingStatus[] = ['PENDING', 'VERIFIED', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid booking status: ${status}`, ErrorCode.BAD_USER_INPUT);
    }

    // Authorization check for cancellation
    if (status === BookingStatus.CANCELLED) {
      const booking = await this.getBookingForAuth(id);
      if (!booking) {
        throw new AppError('Booking not found', ErrorCode.NOT_FOUND);
      }
      if (booking.userId !== userId && role !== 'ADMIN') {
        throw new AppError('Unauthorized to cancel this booking', ErrorCode.FORBIDDEN);
      }
    } else {
      // Admin only for other status changes
      if (role !== 'ADMIN') {
        throw new AppError('Only admins can update booking status', ErrorCode.FORBIDDEN);
      }
    }

    return await bookingRepository.update(id, { status });
  }

  async cancelBooking(id: string, userId: string, role: string) {
    const booking = await this.getBookingForAuth(id);
    if (!booking) {
      throw new AppError('Booking not found', ErrorCode.NOT_FOUND);
    }
    if (booking.userId !== userId && role !== 'ADMIN') {
      throw new AppError('Unauthorized to cancel this booking', ErrorCode.FORBIDDEN);
    }

    return await bookingRepository.update(id, { status: BookingStatus.CANCELLED });
  }

  async deleteBooking(id: string) {
    // Check if booking can be deleted (only draft or cancelled bookings)
    const booking = await bookingRepository.findUnique(id, {});
    if (!booking) {
      throw new AppError('Booking not found', ErrorCode.NOT_FOUND);
    }

    const deletableStatuses: BookingStatus[] = ['DRAFT', 'CANCELLED'];
    if (!deletableStatuses.includes(booking.status)) {
      throw new AppError('Only draft or cancelled bookings can be deleted', ErrorCode.BAD_USER_INPUT);
    }

    return await bookingRepository.delete(id);
  }

  async updateBooking(id: string, input: UpdateBookingInput, userId?: string, userRole?: string) {
    // Get the existing booking to check permissions
    const existingBooking = await bookingRepository.findUnique(id, {});
    if (!existingBooking) {
      throw new AppError('Booking not found', ErrorCode.NOT_FOUND);
    }

    // Check if user can update this booking
    if (userRole !== 'ADMIN' && existingBooking.userId !== userId) {
      throw new AppError('Access denied. You can only update your own bookings.', ErrorCode.FORBIDDEN);
    }

    // Only allow updates for PENDING bookings (non-admin users)
    if (userRole !== 'ADMIN' && existingBooking.status !== 'PENDING') {
      throw new AppError('Only pending bookings can be updated', ErrorCode.BAD_USER_INPUT);
    }

    const data = {
      ...input,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
    };

    // Business logic validation
    if (data.startDate && data.endDate && data.startDate >= data.endDate) {
      throw new AppError('End date must be after start date', ErrorCode.BAD_USER_INPUT);
    }

    return await bookingRepository.update(id, data);
  }

  async finishCarMaintenance(carId: string) {
    return await carService.finishMaintenance(carId);
  }
}

export const bookingService = new BookingService();