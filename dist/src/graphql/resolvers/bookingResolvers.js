"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingResolvers = void 0;
const database_1 = __importDefault(require("../../utils/database"));
const authguard_1 = require("../../utils/authguard");
// ----------------------------------------------------------------------
// 🛠️ HELPER FUNCTIONS
// ----------------------------------------------------------------------
// 📅 Helper: Parse booking dates safely
const parseBookingDates = (input) => ({
    startDate: new Date(input.startDate),
    endDate: new Date(input.endDate)
});
// 🔍 Helper: Check car availability (Updated for Industrial Logic)
const checkCarAvailabilityForBooking = async (carId, startDate, endDate) => {
    // Industrial Logic:
    // A car is unavailable if there is ANY booking in these statuses:
    // - PENDING (User is verifying docs)
    // - VERIFIED (User verified but hasn't paid)
    // - CONFIRMED (Paid, waiting for pickup)
    // - ONGOING (Car is out)
    // - RESERVED (Admin blocked)
    const conflictStatuses = ['PENDING', 'VERIFIED', 'CONFIRMED', 'ONGOING'];
    const conflictingBookings = await database_1.default.booking.findMany({
        where: {
            AND: [
                { carId },
                { status: { in: conflictStatuses } }, // Cast to any to avoid Enum strictness during dev
                {
                    OR: [
                        // 1. New start date falls inside existing booking
                        {
                            AND: [
                                { startDate: { lte: startDate } },
                                { endDate: { gt: startDate } }
                            ]
                        },
                        // 2. New end date falls inside existing booking
                        {
                            AND: [
                                { startDate: { lt: endDate } },
                                { endDate: { gte: endDate } }
                            ]
                        },
                        // 3. New booking completely covers existing booking
                        {
                            AND: [
                                { startDate: { gte: startDate } },
                                { endDate: { lte: endDate } }
                            ]
                        }
                    ]
                }
            ]
        },
        include: {
            user: true
        },
        orderBy: { startDate: 'asc' }
    });
    return {
        available: conflictingBookings.length === 0,
        conflictingBookings
    };
};
// 🎫 Helper: Fetch booking by ID with validation
const getBookingById = async (id) => {
    const booking = await database_1.default.booking.findUnique({ where: { id } });
    if (!booking)
        throw new Error('Booking not found');
    return booking;
};
// 🔄 Helper: Generic status update
const updateBookingStatusHelper = async (id, status) => {
    return await database_1.default.booking.update({
        where: { id },
        data: { status }
    });
};
// 📊 Common Include Structures
const BOOKING_INCLUDES = {
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
// ----------------------------------------------------------------------
// 🚀 RESOLVERS
// ----------------------------------------------------------------------
exports.bookingResolvers = {
    Query: {
        // 🛡️ Admin: View All Bookings
        bookings: async (_, __, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.booking.findMany({
                include: BOOKING_INCLUDES.admin,
                orderBy: { createdAt: 'desc' },
            });
        },
        // 👤 User: View My Bookings
        myBookings: async (_, __, context) => {
            (0, authguard_1.isAuthenticated)(context);
            return await database_1.default.booking.findMany({
                where: { userId: context.userId },
                include: BOOKING_INCLUDES.detailed,
                orderBy: { createdAt: 'desc' },
            });
        },
        // 🔍 Public/User: Check Availability
        checkCarAvailability: async (_, { carId, startDate, endDate }) => {
            const { startDate: start, endDate: end } = parseBookingDates({ startDate, endDate });
            return await checkCarAvailabilityForBooking(carId, start, end);
        },
        // 🔍 Single Booking Details (Owner or Admin)
        booking: async (_, { id }, context) => {
            const booking = await getBookingById(id);
            (0, authguard_1.isOwnerOrAdmin)(context, booking.userId);
            return await database_1.default.booking.findUnique({
                where: { id },
                include: BOOKING_INCLUDES.detailed,
            });
        },
        // 🔗 Get Booking by Token (For QR Scan / Magic Link)
        bookingByToken: async (_, { token }) => {
            const verification = await database_1.default.bookingVerification.findUnique({
                where: { token }
            });
            if (!verification) {
                throw new Error('Invalid verification token');
            }
            // Token Expiry Check
            if (verification.expiresAt < new Date()) {
                throw new Error('Verification token has expired');
            }
            return await database_1.default.booking.findUnique({
                where: { id: verification.bookingId },
                include: BOOKING_INCLUDES.detailed
            });
        },
        // 📊 Admin: Specific User Bookings
        userBookings: async (_, { userId }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.booking.findMany({
                where: { userId },
                include: BOOKING_INCLUDES.basic
            });
        },
        // 🚗 Admin: Specific Car Bookings
        carBookings: async (_, { carId }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.booking.findMany({
                where: { carId },
                include: BOOKING_INCLUDES.basic,
                orderBy: { startDate: 'desc' }
            });
        }
    },
    Mutation: {
        // 🆕 Step 1: Create Booking (DRAFT Status)
        createBooking: async (_, { input }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            // Security check: Only admins can create REPLACEMENT bookings
            if (input.bookingType === 'REPLACEMENT' && context.role !== 'ADMIN') {
                throw new Error('Unauthorized: Only administrators can create courtesy car bookings');
            }
            const { startDate, endDate } = parseBookingDates(input);
            // Basic Date Validation
            if (startDate >= endDate) {
                throw new Error('End date must be after start date');
            }
            // Minimum duration check (e.g., 2 hours)
            const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
            if (durationHours < 2) {
                throw new Error('Booking duration must be at least 2 hours');
            }
            // Check Availability
            const availability = await checkCarAvailabilityForBooking(input.carId, startDate, endDate);
            if (!availability.available) {
                throw new Error('Car is not available for the selected dates');
            }
            // Create Booking as DRAFT
            const booking = await database_1.default.booking.create({
                data: {
                    userId: context.userId,
                    carId: input.carId,
                    startDate,
                    endDate,
                    pickupTime: input.pickupTime,
                    returnTime: input.returnTime,
                    basePrice: input.basePrice || 0,
                    taxAmount: input.taxAmount || 0,
                    surchargeAmount: input.surchargeAmount || 0,
                    totalPrice: input.totalPrice || 0,
                    depositAmount: input.depositAmount || 0,
                    bookingType: input.bookingType || 'RENTAL',
                    repairOrderId: input.repairOrderId,
                    status: 'DRAFT', // Always start as Draft
                    returnNotes: input.returnNotes,
                    damageFee: input.damageFee || 0,
                    extraKmFee: input.extraKmFee || 0,
                    startOdometer: input.startOdometer,
                    endOdometer: 0,
                },
                include: {
                    car: { include: { model: { include: { brand: true } } } },
                },
            });
            return booking;
        },
        // ✅ Step 2: Confirm Reservation (DRAFT -> PENDING) + Token Generation
        confirmReservation: async (_, { id }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            const booking = await database_1.default.booking.findFirst({
                where: { id, userId: context.userId }
            });
            if (!booking)
                throw new Error('Booking not found');
            if (booking.status !== 'DRAFT')
                throw new Error('Booking is already confirmed');
            // Generate Secure Token
            const token = require('crypto').randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Hours Validity
            return await database_1.default.booking.update({
                where: { id },
                data: {
                    status: 'PENDING',
                    verification: {
                        create: {
                            token,
                            expiresAt
                        }
                    }
                },
                include: {
                    ...BOOKING_INCLUDES.detailed,
                    verification: true
                }
            });
        },
        // 🚀 Step 3: Start Trip (CONFIRMED -> ONGOING & Car -> RENTED)
        // This is called when the user picks up the car (via Admin or Keybox app)
        startTrip: async (_, { bookingId }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            const booking = await database_1.default.booking.findUnique({
                where: { id: bookingId },
                include: { car: true }
            });
            if (!booking)
                throw new Error('Booking not found');
            // Strict Rule: Booking must be Paid/Confirmed
            if (booking.status !== 'CONFIRMED' && booking.status !== 'VERIFIED') {
                throw new Error('Booking is not ready to start. Please complete verification and payment.');
            }
            // Transaction to update both Booking and Car
            const updatedBooking = await database_1.default.$transaction(async (tx) => {
                // A. Change Booking to ONGOING
                const b = await tx.booking.update({
                    where: { id: bookingId },
                    data: {
                        status: 'ONGOING',
                        updatedAt: new Date() // Updates timestamp for logs
                    }
                });
                // B. Change Car Status to RENTED (Physically unavailable)
                await tx.car.update({
                    where: { id: booking.carId },
                    data: { status: 'RENTED' }
                });
                return b;
            });
            return updatedBooking;
        },
        // 🏁 Step 4: Complete Trip (ONGOING -> COMPLETED & Car -> MAINTENANCE)
        // This is called when the user returns the car
        completeTrip: async (_, { bookingId }, context) => {
            (0, authguard_1.isAdmin)(context); // Usually Admin checks the car return
            const booking = await database_1.default.booking.findUnique({ where: { id: bookingId } });
            if (!booking)
                throw new Error('Booking not found');
            const updatedBooking = await database_1.default.$transaction(async (tx) => {
                // A. Change Booking to COMPLETED
                const b = await tx.booking.update({
                    where: { id: bookingId },
                    data: {
                        status: 'COMPLETED',
                        updatedAt: new Date()
                    }
                });
                // B. Change Car Status to MAINTENANCE (Requires Cleaning/Check)
                await tx.car.update({
                    where: { id: booking.carId },
                    data: { status: 'MAINTENANCE' }
                });
                return b;
            });
            return updatedBooking;
        },
        // 🛠️ Step 5: Finish Maintenance (MAINTENANCE -> AVAILABLE)
        finishCarMaintenance: async (_, { carId }, context) => {
            (0, authguard_1.isAdmin)(context);
            const car = await database_1.default.car.update({
                where: { id: carId },
                data: { status: 'AVAILABLE' }
            });
            return car;
        },
        // ⚙️ Admin: Manual Status Update
        updateBookingStatus: async (_, { id, status }, context) => {
            // User can only cancel their own booking if not started
            if (status === 'CANCELLED') {
                (0, authguard_1.isAuthenticated)(context);
                const booking = await database_1.default.booking.findUnique({ where: { id } });
                if (!booking)
                    throw new Error("Booking not found");
                if (booking.status === 'ONGOING' || booking.status === 'COMPLETED') {
                    throw new Error('Cannot cancel an ongoing or completed booking.');
                }
                if (booking.userId !== context.userId && context.role !== 'ADMIN') {
                    throw new Error('Unauthorized');
                }
            }
            else {
                // All other status changes require Admin
                (0, authguard_1.isAdmin)(context);
            }
            return await updateBookingStatusHelper(id, status);
        },
        // ❌ Cancel Booking
        cancelBooking: async (_, { id }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            const booking = await database_1.default.booking.findUnique({ where: { id } });
            if (!booking)
                throw new Error('Booking not found');
            // Ownership check
            if (booking.userId !== context.userId && context.role !== 'ADMIN') {
                throw new Error('Unauthorized');
            }
            await updateBookingStatusHelper(id, 'CANCELLED');
            return true;
        },
        // 🗑️ Delete Booking (Admin Only - Soft delete preferred usually, but this is hard delete)
        deleteBooking: async (_, { id }, context) => {
            (0, authguard_1.isAdmin)(context);
            await database_1.default.booking.delete({ where: { id } });
            return true;
        },
        // ✏️ Update Booking Details (Admin Only)
        updateBooking: async (_, { id, input }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.booking.update({
                where: { id },
                data: {
                    startDate: input.startDate ? new Date(input.startDate) : undefined,
                    endDate: input.endDate ? new Date(input.endDate) : undefined,
                    pickupTime: input.pickupTime,
                    returnTime: input.returnTime,
                    basePrice: input.basePrice,
                    taxAmount: input.taxAmount,
                    surchargeAmount: input.surchargeAmount,
                    depositAmount: input.depositAmount,
                    startOdometer: input.startOdometer,
                    endOdometer: input.endOdometer,
                    damageFee: input.damageFee,
                    extraKmFee: input.extraKmFee,
                    returnNotes: input.returnNotes,
                    totalPrice: input.totalPrice,
                    bookingType: input.bookingType,
                    repairOrderId: input.repairOrderId,
                    status: input.status
                },
                include: BOOKING_INCLUDES.detailed
            });
        }
    }
};
//# sourceMappingURL=bookingResolvers.js.map