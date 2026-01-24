import { bookingRepository, BOOKING_INCLUDES } from '../repositories/bookingRepository';
import { AppError, ErrorCode } from '../errors/AppError';
import { carService } from './carService';
import { paymentService } from './paymentService';
import { Prisma, PaymentStatus } from '@prisma/client';
import { CreateBookingInput, UpdateBookingInput } from '../types/graphql';
import { BookingStatus, VerificationStatus } from '@prisma/client';
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

    const isAdminActor = role === 'ADMIN';
    const isWalkIn = !!input.isWalkIn && isAdminActor;

    // For walk-in/admin onsite bookings, capture guest contact; require minimal name/phone
    if (isWalkIn) {
      if (!input.guestName?.trim()) {
        throw new AppError('Guest name is required for walk-in bookings', ErrorCode.BAD_USER_INPUT);
      }
      if (!input.guestPhone?.trim()) {
        throw new AppError('Guest phone is required for walk-in bookings', ErrorCode.BAD_USER_INPUT);
      }
    }

    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    const now = new Date();
    const minPickup = new Date(now.getTime() + 60 * 60 * 1000);

    if (start < minPickup) throw new AppError('Pickup must be at least 1 hour from now', ErrorCode.BAD_USER_INPUT);

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
      ...(isWalkIn ? {} : { user: { connect: { id: userId } } }),
      car: { connect: { id: input.carId } },
      startDate: start,
      endDate: end,
      
      // ✅ FIXED: Added pickupTime and returnTime to Database Save
      pickupTime: input.pickupTime,
      returnTime: input.returnTime,

      status: BookingStatus.DRAFT,
      createdByAdmin: isAdminActor,
      isWalkIn,
      guestName: input.guestName,
      guestPhone: input.guestPhone,
      guestEmail: input.guestEmail,
      endOdometer: 0,
      damageFee: input.damageFee || 0,
      extraKmFee: input.extraKmFee || 0,
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

  async startTrip(bookingId: string, startOdometer?: number, pickupNotes?: string) {
    const booking = await bookingRepository.findUnique(bookingId, BOOKING_INCLUDES.detailed);
    if (!booking) throw new AppError('Booking not found', ErrorCode.NOT_FOUND);
    
    // Security Check 1: Payment Required
    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.VERIFIED) {
      throw new AppError('Payment Required. Please complete payment before starting trip.', ErrorCode.BAD_USER_INPUT);
    }
    
    // Security Check 2: Document Verification (skip for walk-ins)
    if (booking.user && (booking.user as any)?.verification?.status !== VerificationStatus.APPROVED) {
      throw new AppError('Driver documents are not verified yet. Please verify original documents on Admin Panel before handing over the key.', ErrorCode.BAD_USER_INPUT);
    }

    // Validate odometer reading
    if (startOdometer !== undefined && startOdometer < 0) {
      throw new AppError('Invalid odometer reading', ErrorCode.BAD_USER_INPUT);
    }
    
    // Update booking with odometer and notes before starting trip
    if (startOdometer !== undefined || pickupNotes) {
      await bookingRepository.update(bookingId, {
        startOdometer,
        pickupNotes
      });
    }
    
    return await bookingRepository.startTripTransaction(bookingId, booking.carId);
  }

  async completeTrip(bookingId: string) {
    const booking = await bookingRepository.findUnique(bookingId, BOOKING_INCLUDES.detailed);
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

  async cancelBooking(id: string, userId: string, role: string, _reason?: string) {
    // Fetch full booking with payment so we can evaluate pickup time and current status
    const booking = await bookingRepository.findUnique(id, { payment: true });
    if (!booking) {
      throw new AppError('Booking not found', ErrorCode.NOT_FOUND);
    }

    // Only owner or admin may cancel
    if (booking.userId !== userId && role !== 'ADMIN') {
      throw new AppError('Unauthorized to cancel this booking', ErrorCode.FORBIDDEN);
    }

    // Prevent cancelling completed or already cancelled bookings
    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
      throw new AppError('Cannot cancel a completed or already cancelled booking', ErrorCode.BAD_USER_INPUT);
    }

    if (role !== 'ADMIN') {
      if (booking.status === BookingStatus.ONGOING) {
        throw new AppError('Only admins can cancel an ongoing booking', ErrorCode.FORBIDDEN);
      }

      if (booking.status === BookingStatus.CONFIRMED) {
        let pickupDt = booking.startDate as Date;
        try {
          if (booking.pickupTime) {
            const datePart = (booking.startDate as Date).toISOString().split('T')[0];
            pickupDt = new Date(`${datePart}T${booking.pickupTime}:00`);
          }
        } catch (e) {
          pickupDt = booking.startDate as Date;
        }

        const cutoff = new Date(pickupDt.getTime() - 24 * 60 * 60 * 1000);
        if (Date.now() > cutoff.getTime()) {
          throw new AppError('Cancellation window has passed. Contact admin to cancel within 24 hours of pickup.', ErrorCode.FORBIDDEN);
        }
      }
    }

    // 🔄 REFUND LOGIC: If payment was SUCCEEDED, trigger refund to customer
    const payment = (booking as any).payment;
    if (payment && payment.status === PaymentStatus.SUCCEEDED) {
      try {
        await paymentService.refundPayment(payment.id);
        console.log(`💳 Refund initiated for booking ${id}, payment ${payment.id}`);
      } catch (refundError: any) {
        // Log error but still proceed with cancellation
        console.error(`⚠️ Refund failed for booking ${id}: ${refundError.message}`);
        // For admin, allow cancellation even if refund fails (can be handled manually)
        if (role !== 'ADMIN') {
          throw new AppError(`Cannot cancel: Refund failed - ${refundError.message}`, ErrorCode.INTERNAL_SERVER_ERROR);
        }
      }
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
      
      // ✅ FIXED: Ensure time is also updated
      pickupTime: input.pickupTime,
      returnTime: input.returnTime,
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