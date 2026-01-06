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
const crypto_1 = __importDefault(require("crypto"));
class BookingService {
    async checkAvailability(carId, startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const conflicts = await bookingRepository_1.bookingRepository.findConflicts(carId, start, end);
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
        if (start >= end)
            throw new AppError_1.AppError('End date must be after start date', AppError_1.ErrorCode.BAD_USER_INPUT);
        const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        if (durationHours < 2)
            throw new AppError_1.AppError('Minimum duration is 2 hours', AppError_1.ErrorCode.BAD_USER_INPUT);
        const { available } = await this.checkAvailability(input.carId, input.startDate, input.endDate);
        if (!available)
            throw new AppError_1.AppError('Car is not available for these dates', AppError_1.ErrorCode.ALREADY_EXISTS);
        // Transform GraphQL input to Prisma input
        const bookingData = {
            user: { connect: { id: userId } },
            car: { connect: { id: input.carId } },
            startDate: start,
            endDate: end,
            status: client_1.BookingStatus.DRAFT,
            endOdometer: 0,
            damageFee: input.damageFee || 0,
            extraKmFee: input.extraKmFee || 0,
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
        const booking = await bookingRepository_1.bookingRepository.findUnique(bookingId, { car: true });
        if (!booking)
            throw new AppError_1.AppError('Booking not found', AppError_1.ErrorCode.NOT_FOUND);
        if (booking.status !== client_1.BookingStatus.CONFIRMED && booking.status !== client_1.BookingStatus.VERIFIED) {
            throw new AppError_1.AppError('Booking not ready for pickup', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        return await bookingRepository_1.bookingRepository.startTripTransaction(bookingId, booking.carId);
    }
    async completeTrip(bookingId) {
        const booking = await bookingRepository_1.bookingRepository.findUnique(bookingId, {});
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
        const booking = await this.getBookingForAuth(id);
        if (!booking) {
            throw new AppError_1.AppError('Booking not found', AppError_1.ErrorCode.NOT_FOUND);
        }
        if (booking.userId !== userId && role !== 'ADMIN') {
            throw new AppError_1.AppError('Unauthorized to cancel this booking', AppError_1.ErrorCode.FORBIDDEN);
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
    async updateBooking(id, input) {
        const data = {
            ...input,
            startDate: input.startDate ? new Date(input.startDate) : undefined,
            endDate: input.endDate ? new Date(input.endDate) : undefined,
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