"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingService = exports.BookingService = void 0;
const bookingRepository_1 = require("../repositories/bookingRepository");
const AppError_1 = require("../errors/AppError");
const carService_1 = require("./carService");
const client_1 = require("@prisma/client");
const validation_1 = require("../utils/validation");
const calculation_1 = require("../utils/calculation");
const crypto_1 = __importDefault(require("crypto"));
class BookingService {
    async checkAvailability(carId, startDate, endDate, excludeBookingId) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const conflicts = await bookingRepository_1.bookingRepository.findConflicts(carId, start, end, excludeBookingId);
        return {
            available: conflicts.length === 0,
            conflictingBookings: conflicts
        };
    }
    async createBooking(userId, role, input) {
        // Comprehensive input validation
        const validation = (0, validation_1.validateBookingInput)(input);
        if (!validation.isValid) {
            throw new AppError_1.AppError(validation.errors[0], AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        if (input.bookingType === 'REPLACEMENT' && role !== 'ADMIN') {
            throw new AppError_1.AppError('Only admins can create courtesy car bookings', AppError_1.ErrorCode.FORBIDDEN);
        }
        const start = new Date(input.startDate);
        const end = new Date(input.endDate);
        const now = new Date();
        const minPickup = new Date(now.getTime() + 60 * 60 * 1000);
        if (start < minPickup)
            throw new AppError_1.AppError('Pickup must be at least 1 hour from now', AppError_1.ErrorCode.BAD_USER_INPUT);
        if (start >= end)
            throw new AppError_1.AppError('End date must be after start date', AppError_1.ErrorCode.BAD_USER_INPUT);
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        if (durationHours < 2)
            throw new AppError_1.AppError('Minimum duration is 2 hours', AppError_1.ErrorCode.BAD_USER_INPUT);
        const { available } = await this.checkAvailability(input.carId, input.startDate, input.endDate);
        if (!available)
            throw new AppError_1.AppError('Car is not available for these dates', AppError_1.ErrorCode.ALREADY_EXISTS);
        // Get car details for pricing calculation
        const car = await carService_1.carService.getCarById(input.carId);
        if (!car)
            throw new AppError_1.AppError('Car not found', AppError_1.ErrorCode.NOT_FOUND);
        // Calculate rental duration in days
        const durationDays = Math.ceil(durationHours / 24);
        // Calculate base price using car's daily rate
        const basePrice = (0, calculation_1.calculateRentalCost)('DAY', durationDays, null, null, car.pricePerDay);
        // Calculate tax (20% tax rate)
        const taxAmount = (0, calculation_1.calculateTax)(basePrice, 20);
        // Calculate total price (excluding deposit)
        const totalPrice = (0, calculation_1.calculateTotalPrice)(basePrice, taxAmount);
        // Transform GraphQL input to Prisma input
        const bookingData = {
            user: { connect: { id: userId } },
            car: { connect: { id: input.carId } },
            startDate: start,
            endDate: end,
            // ✅ FIXED: Added pickupTime and returnTime to Database Save
            pickupTime: input.pickupTime,
            returnTime: input.returnTime,
            status: client_1.BookingStatus.DRAFT,
            endOdometer: 0,
            damageFee: input.damageFee || 0,
            extraKmFee: input.extraKmFee || 0,
            basePrice,
            taxAmount,
            totalPrice,
            depositAmount: car.depositAmount,
        };
        return await bookingRepository_1.bookingRepository.create(bookingData);
    }
    async confirmReservation(id, userId) {
        const booking = await bookingRepository_1.bookingRepository.findFirst({ id, userId });
        if (!booking)
            throw new AppError_1.AppError('Booking not found', AppError_1.ErrorCode.NOT_FOUND);
        if (booking.status !== client_1.BookingStatus.DRAFT)
            throw new AppError_1.AppError('Only draft bookings can be confirmed', AppError_1.ErrorCode.BAD_USER_INPUT);
        const token = crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        return await bookingRepository_1.bookingRepository.update(id, {
            status: client_1.BookingStatus.PENDING,
            verification: { create: { token, expiresAt } }
        });
    }
    async startTrip(bookingId) {
        const booking = await bookingRepository_1.bookingRepository.findUnique(bookingId, bookingRepository_1.BOOKING_INCLUDES.detailed);
        if (!booking)
            throw new AppError_1.AppError('Booking not found', AppError_1.ErrorCode.NOT_FOUND);
        // Security Check 1: Payment Required
        if (booking.status !== client_1.BookingStatus.CONFIRMED && booking.status !== client_1.BookingStatus.VERIFIED) {
            throw new AppError_1.AppError('Payment Required. Please complete payment before starting trip.', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        // Security Check 2: Document Verification
        if (booking.user?.verification?.status !== client_1.VerificationStatus.APPROVED) {
            throw new AppError_1.AppError('Driver documents are not verified yet. Please verify original documents on Admin Panel before handing over the key.', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        return await bookingRepository_1.bookingRepository.startTripTransaction(bookingId, booking.carId);
    }
    async completeTrip(bookingId) {
        const booking = await bookingRepository_1.bookingRepository.findUnique(bookingId, bookingRepository_1.BOOKING_INCLUDES.detailed);
        if (!booking)
            throw new AppError_1.AppError('Booking not found', AppError_1.ErrorCode.NOT_FOUND);
        return await bookingRepository_1.bookingRepository.completeTripTransaction(bookingId, booking.carId);
    }
    async getBookingByToken(token) {
        const verification = await bookingRepository_1.bookingRepository.findVerificationToken(token);
        if (!verification)
            throw new AppError_1.AppError('Invalid token', AppError_1.ErrorCode.BAD_USER_INPUT);
        if (verification.expiresAt < new Date())
            throw new AppError_1.AppError('Token expired', AppError_1.ErrorCode.BAD_USER_INPUT);
        return await bookingRepository_1.bookingRepository.findUnique(verification.bookingId, bookingRepository_1.BOOKING_INCLUDES.detailed);
    }
    async getAllBookings() {
        return await bookingRepository_1.bookingRepository.findMany({}, bookingRepository_1.BOOKING_INCLUDES.admin);
    }
    async getBookingsByUserId(userId) {
        return await bookingRepository_1.bookingRepository.findMany({ userId }, bookingRepository_1.BOOKING_INCLUDES.detailed);
    }
    async getBookingById(id) {
        return await bookingRepository_1.bookingRepository.findUnique(id, bookingRepository_1.BOOKING_INCLUDES.detailed);
    }
    async getBookingsByUserIdBasic(userId) {
        return await bookingRepository_1.bookingRepository.findMany({ userId }, bookingRepository_1.BOOKING_INCLUDES.basic);
    }
    async getBookingsByCarId(carId) {
        return await bookingRepository_1.bookingRepository.findMany({ carId }, bookingRepository_1.BOOKING_INCLUDES.basic, { startDate: 'desc' });
    }
    async getBookingForAuth(id) {
        // Minimal method for authorization checks - returns only userId
        const booking = await bookingRepository_1.bookingRepository.findUnique(id, {});
        return booking ? { userId: booking.userId } : null;
    }
    async updateBookingStatus(id, status, userId, role) {
        // Business logic validation for booking status updates
        const validStatuses = ['PENDING', 'VERIFIED', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            throw new AppError_1.AppError(`Invalid booking status: ${status}`, AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        // Authorization check for cancellation
        if (status === client_1.BookingStatus.CANCELLED) {
            const booking = await this.getBookingForAuth(id);
            if (!booking) {
                throw new AppError_1.AppError('Booking not found', AppError_1.ErrorCode.NOT_FOUND);
            }
            if (booking.userId !== userId && role !== 'ADMIN') {
                throw new AppError_1.AppError('Unauthorized to cancel this booking', AppError_1.ErrorCode.FORBIDDEN);
            }
        }
        else {
            // Admin only for other status changes
            if (role !== 'ADMIN') {
                throw new AppError_1.AppError('Only admins can update booking status', AppError_1.ErrorCode.FORBIDDEN);
            }
        }
        return await bookingRepository_1.bookingRepository.update(id, { status });
    }
    async cancelBooking(id, userId, role) {
        // Fetch full booking so we can evaluate pickup time and current status
        const booking = await bookingRepository_1.bookingRepository.findUnique(id, {});
        if (!booking) {
            throw new AppError_1.AppError('Booking not found', AppError_1.ErrorCode.NOT_FOUND);
        }
        // Only owner or admin may cancel
        if (booking.userId !== userId && role !== 'ADMIN') {
            throw new AppError_1.AppError('Unauthorized to cancel this booking', AppError_1.ErrorCode.FORBIDDEN);
        }
        // Prevent cancelling completed or already cancelled bookings
        if (booking.status === client_1.BookingStatus.COMPLETED || booking.status === client_1.BookingStatus.CANCELLED) {
            throw new AppError_1.AppError('Cannot cancel a completed or already cancelled booking', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        // Business rule: users may cancel up until 24 hours before pickup. Admins can always cancel.
        if (role !== 'ADMIN') {
            // Compute pickup datetime: prefer booking.pickupTime when present
            let pickupDt = booking.startDate;
            try {
                if (booking.pickupTime) {
                    // Combine date portion of startDate with pickupTime (format: HH:MM)
                    const datePart = booking.startDate.toISOString().split('T')[0];
                    // Construct as ISO without timezone; server treats Date as UTC when parsing
                    pickupDt = new Date(`${datePart}T${booking.pickupTime}:00`);
                }
            }
            catch (e) {
                // If parsing fails, fall back to startDate
                pickupDt = booking.startDate;
            }
            const cutoff = new Date(pickupDt.getTime() - 24 * 60 * 60 * 1000);
            if (Date.now() > cutoff.getTime()) {
                throw new AppError_1.AppError('Cancellation window has passed. Contact admin to cancel within 24 hours of pickup.', AppError_1.ErrorCode.FORBIDDEN);
            }
        }
        return await bookingRepository_1.bookingRepository.update(id, { status: client_1.BookingStatus.CANCELLED });
    }
    async deleteBooking(id) {
        // Check if booking can be deleted (only draft or cancelled bookings)
        const booking = await bookingRepository_1.bookingRepository.findUnique(id, {});
        if (!booking) {
            throw new AppError_1.AppError('Booking not found', AppError_1.ErrorCode.NOT_FOUND);
        }
        const deletableStatuses = ['DRAFT', 'CANCELLED'];
        if (!deletableStatuses.includes(booking.status)) {
            throw new AppError_1.AppError('Only draft or cancelled bookings can be deleted', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        return await bookingRepository_1.bookingRepository.delete(id);
    }
    async updateBooking(id, input, userId, userRole) {
        // Get the existing booking to check permissions
        const existingBooking = await bookingRepository_1.bookingRepository.findUnique(id, {});
        if (!existingBooking) {
            throw new AppError_1.AppError('Booking not found', AppError_1.ErrorCode.NOT_FOUND);
        }
        // Check if user can update this booking
        if (userRole !== 'ADMIN' && existingBooking.userId !== userId) {
            throw new AppError_1.AppError('Access denied. You can only update your own bookings.', AppError_1.ErrorCode.FORBIDDEN);
        }
        // Only allow updates for PENDING bookings (non-admin users)
        if (userRole !== 'ADMIN' && existingBooking.status !== 'PENDING') {
            throw new AppError_1.AppError('Only pending bookings can be updated', AppError_1.ErrorCode.BAD_USER_INPUT);
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
            throw new AppError_1.AppError('End date must be after start date', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        return await bookingRepository_1.bookingRepository.update(id, data);
    }
    async finishCarMaintenance(carId) {
        return await carService_1.carService.finishMaintenance(carId);
    }
}
exports.BookingService = BookingService;
exports.bookingService = new BookingService();
//# sourceMappingURL=bookingService.js.map