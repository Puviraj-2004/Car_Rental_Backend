"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentResolvers = void 0;
const database_1 = __importDefault(require("../../utils/database"));
const authguard_1 = require("../../utils/authguard");
exports.paymentResolvers = {
    Query: {
        payments: async (_, __, context) => {
            (0, authguard_1.isAdmin)(context);
            return await database_1.default.payment.findMany({ include: { booking: true } });
        },
        bookingPayment: async (_, { bookingId }, context) => {
            const payment = await database_1.default.payment.findUnique({
                where: { bookingId },
                include: { booking: true }
            });
            if (payment) {
                (0, authguard_1.isOwnerOrAdmin)(context, payment.booking.userId);
            }
            else {
                (0, authguard_1.isAdmin)(context); // If no payment found, only admin usually checks this directly
            }
            return payment;
        }
    },
    Mutation: {
        createPayment: async (_, { input }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            const booking = await database_1.default.booking.findUnique({
                where: { id: input.bookingId }
            });
            if (!booking)
                throw new Error('Booking not found');
            (0, authguard_1.isOwnerOrAdmin)(context, booking.userId); // Only owner can pay
            const existingPayment = await database_1.default.payment.findUnique({
                where: { bookingId: input.bookingId }
            });
            if (existingPayment)
                throw new Error('Payment already exists');
            const payment = await database_1.default.payment.create({
                data: {
                    ...input,
                    status: input.status || 'COMPLETED', // Default to COMPLETED for basic implementation
                },
                include: { booking: true }
            });
            // Update booking status to CONFIRMED when payment is created
            if (payment.status === 'COMPLETED') {
                await database_1.default.booking.update({
                    where: { id: input.bookingId },
                    data: { status: 'CONFIRMED' }
                });
                // Log the payment and booking confirmation
                await database_1.default.auditLog.create({
                    data: {
                        userId: context.userId,
                        action: 'PAYMENT_COMPLETED_BOOKING_CONFIRMED',
                        details: {
                            paymentId: payment.id,
                            bookingId: input.bookingId,
                            amount: input.amount,
                            transactionId: input.transactionId
                        }
                    }
                });
            }
            return payment;
        },
        updatePaymentStatus: async (_, { input }, context) => {
            (0, authguard_1.isAdmin)(context);
            const { id, status, transactionId } = input;
            return await database_1.default.payment.update({
                where: { id },
                data: { status, transactionId },
                include: { booking: true }
            });
        }
    }
};
//# sourceMappingURL=paymentResolvers.js.map