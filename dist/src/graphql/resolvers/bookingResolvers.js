"use strict";
// backend/src/graphql/resolvers/bookingResolvers.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingResolvers = void 0;
const uuid_1 = require("uuid");
const database_1 = __importDefault(require("../../utils/database"));
const authguard_1 = require("../../utils/authguard");
exports.bookingResolvers = {
    Query: {
        // 🛡️ Admin: Ella bookings-aiyum paarkka
        bookings: async (_, __, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.booking.findMany({
                include: {
                    user: true,
                    car: { include: { brand: true, model: true } },
                    payment: true,
                },
                orderBy: { createdAt: 'desc' },
            });
        },
        // 👤 User: Thannudaiya bookings-ai paarkka
        myBookings: async (_, __, context) => {
            (0, authguard_1.isAuthenticated)(context);
            return await database_1.default.booking.findMany({
                where: { userId: context.userId },
                include: {
                    car: { include: { brand: true, model: true, images: true } },
                    payment: true,
                },
                orderBy: { createdAt: 'desc' },
            });
        },
        // 🔍 Single Booking: Details paarkka (Owner or Admin only)
        booking: async (_, { id }, context) => {
            const booking = await database_1.default.booking.findUnique({
                where: { id },
                include: {
                    user: true,
                    car: { include: { brand: true, model: true } },
                    payment: true,
                    verification: true
                },
            });
            if (!booking)
                throw new Error('Booking not found');
            (0, authguard_1.isOwnerOrAdmin)(context, booking.userId);
            return booking;
        },
        // 📊 Admin: Oru specific user-oda bookings-ai paarkka
        userBookings: async (_, { userId }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.booking.findMany({
                where: { userId },
                include: { car: true, payment: true }
            });
        }
    },
    Mutation: {
        // 🆕 Step 1: User creates a draft booking
        createBooking: async (_, { input }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            // 🚨 Dates-ai string-ilirundhu Date object-aaga maatra vendum
            const startDate = new Date(input.startDate);
            const endDate = new Date(input.endDate);
            return await database_1.default.booking.create({
                data: {
                    userId: context.userId,
                    carId: input.carId,
                    startDate,
                    endDate,
                    basePrice: input.basePrice,
                    taxAmount: input.taxAmount,
                    totalPrice: input.totalPrice,
                    depositAmount: input.depositAmount,
                    surchargeAmount: input.surchargeAmount || 0, // ✅ New Field added
                    rentalType: input.rentalType,
                    pickupLocation: input.pickupLocation,
                    dropoffLocation: input.dropoffLocation,
                    status: 'DRAFT',
                },
                include: {
                    car: { include: { brand: true, model: true } },
                },
            });
        },
        // 📧 Step 2: System verification link anuppudhal
        sendBookingVerificationLink: async (_, { bookingId }, context) => {
            const booking = await database_1.default.booking.findUnique({ where: { id: bookingId } });
            if (!booking)
                throw new Error('Booking not found');
            (0, authguard_1.isOwnerOrAdmin)(context, booking.userId);
            const token = (0, uuid_1.v4)(); // Unique token generation
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry
            // Token-ai save seiyyal
            await database_1.default.bookingVerification.upsert({
                where: { bookingId },
                update: { token, expiresAt, isVerified: false },
                create: { bookingId, token, expiresAt }
            });
            // Status-ai update seiyyal
            await database_1.default.booking.update({
                where: { id: bookingId },
                data: { status: 'AWAITING_VERIFICATION' }
            });
            // 💡 Inge dhaan neenga email anuppum function-ai (eg: sendEmail) call seiyyanum
            console.log(`Verification Token for Booking ${bookingId}: ${token}`);
            return {
                success: true,
                message: "Verification link generated and sent successfully.",
                bookingId
            };
        },
        // 🔗 Step 3: Magic link token-ai verify seiyyal (Public Route)
        verifyBookingToken: async (_, { token }) => {
            const verification = await database_1.default.bookingVerification.findUnique({
                where: { token }
            });
            if (!verification)
                throw new Error("Invalid or broken verification link.");
            if (new Date() > verification.expiresAt)
                throw new Error("Verification link has expired.");
            // DB updates
            await database_1.default.$transaction([
                database_1.default.bookingVerification.update({
                    where: { id: verification.id },
                    data: { isVerified: true, verifiedAt: new Date() }
                }),
                database_1.default.booking.update({
                    where: { id: verification.bookingId },
                    data: { status: 'AWAITING_PAYMENT' }
                })
            ]);
            return {
                success: true,
                message: "Booking verified. You can now proceed to payment.",
                bookingId: verification.bookingId
            };
        },
        // ⚙️ Admin: Status-ai manual-aaga update seiyya (eg: CONFIRMED after payment)
        updateBookingStatus: async (_, { id, status }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.booking.update({
                where: { id },
                data: { status },
            });
        },
        // ❌ Cancel Booking: User or Admin can cancel
        cancelBooking: async (_, { id }, context) => {
            const booking = await database_1.default.booking.findUnique({ where: { id } });
            if (!booking)
                throw new Error('Booking not found');
            (0, authguard_1.isOwnerOrAdmin)(context, booking.userId);
            await database_1.default.booking.update({
                where: { id },
                data: { status: 'CANCELLED' }
            });
            return true;
        },
        // 🗑️ Delete Booking: Admin only
        deleteBooking: async (_, { id }, context) => {
            (0, authguard_1.isAdmin)(context);
            await database_1.default.booking.delete({ where: { id } });
            return true;
        }
    }
};
//# sourceMappingURL=bookingResolvers.js.map