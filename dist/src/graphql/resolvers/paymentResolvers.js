"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentResolvers = void 0;
const authguard_1 = require("../../utils/authguard");
const paymentService_1 = require("../../services/paymentService");
exports.paymentResolvers = {
    Query: {
        payments: async (_, __, context) => {
            (0, authguard_1.isAdmin)(context);
            return await paymentService_1.paymentService.getAllPayments();
        },
        bookingPayment: async (_, { bookingId }, context) => {
            const payment = await paymentService_1.paymentService.getPaymentByBookingId(bookingId);
            if (payment) {
                // For walk-in bookings, only admins can access payment
                if (payment.booking.userId === null) {
                    (0, authguard_1.isAdmin)(context);
                }
                else {
                    (0, authguard_1.isOwnerOrAdmin)(context, payment.booking.userId);
                }
            }
            else {
                (0, authguard_1.isAdmin)(context);
            }
            return payment;
        }
    },
    Mutation: {
        createStripeCheckoutSession: async (_, { bookingId }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            // Fetch booking to check ownership before calling service
            const booking = await paymentService_1.paymentService.getBookingForAuth(bookingId);
            if (!booking)
                throw new Error('Booking not found');
            // For walk-in bookings, only admins can create payment sessions
            if (booking.userId === null) {
                (0, authguard_1.isAdmin)(context);
            }
            else {
                (0, authguard_1.isOwnerOrAdmin)(context, booking.userId);
            }
            return await paymentService_1.paymentService.createStripeSession(bookingId);
        },
        mockFinalizePayment: async (_, { bookingId, success }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            const booking = await paymentService_1.paymentService.getBookingForAuth(bookingId);
            if (!booking)
                throw new Error('Booking not found');
            // For walk-in bookings, only admins can finalize payment
            if (booking.userId === null) {
                (0, authguard_1.isAdmin)(context);
            }
            else {
                (0, authguard_1.isOwnerOrAdmin)(context, booking.userId);
            }
            return await paymentService_1.paymentService.finalizeMockPayment(bookingId, success);
        },
        createPayment: async (_, { input }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            const booking = await paymentService_1.paymentService.getBookingForAuth(input.bookingId);
            if (!booking)
                throw new Error('Booking not found');
            // For walk-in bookings, only admins can create manual payments
            if (booking.userId === null) {
                (0, authguard_1.isAdmin)(context);
            }
            else {
                (0, authguard_1.isOwnerOrAdmin)(context, booking.userId);
            }
            return await paymentService_1.paymentService.processManualPayment(input);
        },
        updatePaymentStatus: async (_, { input }, context) => {
            (0, authguard_1.isAdmin)(context);
            const { id, status } = input;
            return await paymentService_1.paymentService.updatePaymentStatus(id, status);
        },
        refundPayment: async (_, { paymentId }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await paymentService_1.paymentService.refundPayment(paymentId);
        }
    }
};
//# sourceMappingURL=paymentResolvers.js.map