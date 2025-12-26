"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingResolvers = void 0;
const database_1 = __importDefault(require("../../utils/database"));
const uuid_1 = require("uuid");
const authguard_1 = require("../../utils/authguard");
exports.bookingResolvers = {
    Query: {
        bookings: async (_, __, context) => {
            (0, authguard_1.isAdmin)(context); // Only Admin sees all bookings
            return await database_1.default.booking.findMany({
                include: {
                    user: true,
                    car: { include: { brand: true, model: true } },
                    payment: true,
                },
                orderBy: { createdAt: 'desc' },
            });
        },
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
            (0, authguard_1.isOwnerOrAdmin)(context, booking.userId); // Check permission
            return booking;
        },
    },
    Mutation: {
        createBooking: async (_, { input }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            return await database_1.default.booking.create({
                data: {
                    ...input,
                    userId: context.userId,
                    status: 'DRAFT',
                },
                include: {
                    car: { include: { brand: true, model: true } },
                },
            });
        },
        // User requests verification link
        sendBookingVerificationLink: async (_, { bookingId }, context) => {
            // Need to fetch booking to check ownership
            const booking = await database_1.default.booking.findUnique({ where: { id: bookingId } });
            if (!booking)
                throw new Error('Booking not found');
            (0, authguard_1.isOwnerOrAdmin)(context, booking.userId);
            const token = (0, uuid_1.v4)();
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            await database_1.default.bookingVerification.upsert({
                where: { bookingId },
                update: { token, expiresAt, isVerified: false },
                create: { bookingId, token, expiresAt }
            });
            await database_1.default.booking.update({
                where: { id: bookingId },
                data: { status: 'AWAITING_VERIFICATION' }
            });
            // Email Logic Here (e.g. await sendEmail(...))
            return {
                success: true,
                message: "Verification link sent to your email.",
                bookingId
            };
        },
        // Public Route (Relies on Token)
        verifyBookingToken: async (_, { token }) => {
            const verification = await database_1.default.bookingVerification.findUnique({
                where: { token }
            });
            if (!verification)
                throw new Error("Invalid token");
            if (new Date() > verification.expiresAt)
                throw new Error("Token expired");
            await database_1.default.bookingVerification.update({
                where: { id: verification.id },
                data: { isVerified: true, verifiedAt: new Date() }
            });
            await database_1.default.booking.update({
                where: { id: verification.bookingId },
                data: { status: 'AWAITING_PAYMENT' }
            });
            return {
                success: true,
                message: "Booking verified. You can now proceed to payment.",
                bookingId: verification.bookingId
            };
        },
        updateBookingStatus: async (_, { id, status }, context) => {
            (0, authguard_1.isAdmin)(context);
            // If status is CONFIRMED, maybe send an email?
            return await database_1.default.booking.update({
                where: { id },
                data: { status },
            });
        },
        cancelBooking: async (_, { id }, context) => {
            const booking = await database_1.default.booking.findUnique({ where: { id } });
            if (!booking)
                throw new Error('Not found');
            (0, authguard_1.isOwnerOrAdmin)(context, booking.userId);
            await database_1.default.booking.update({
                where: { id },
                data: { status: 'CANCELLED' }
            });
            return true;
        },
        deleteBooking: async (_, { id }, context) => {
            (0, authguard_1.isAdmin)(context);
            await database_1.default.booking.delete({ where: { id } });
            return true;
        }
    }
};
//# sourceMappingURL=bookingResolvers.js.map