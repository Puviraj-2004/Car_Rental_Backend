"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentResolvers = void 0;
const database_1 = __importDefault(require("../../utils/database"));
exports.paymentResolvers = {
    Query: {
        payments: async () => {
            return await database_1.default.payment.findMany({
                include: { booking: true }
            });
        },
        payment: async (_, { id }) => {
            return await database_1.default.payment.findUnique({
                where: { id },
                include: { booking: true }
            });
        },
        bookingPayment: async (_, { bookingId }) => {
            return await database_1.default.payment.findUnique({
                where: { bookingId },
                include: { booking: true }
            });
        }
    },
    Mutation: {
        createPayment: async (_, { input }) => {
            // Verify booking exists and doesn't already have a payment
            const existingPayment = await database_1.default.payment.findUnique({
                where: { bookingId: input.bookingId }
            });
            if (existingPayment) {
                throw new Error('Payment already exists for this booking');
            }
            return await database_1.default.payment.create({
                data: {
                    ...input,
                    currency: input.currency || 'EUR',
                    status: 'pending'
                },
                include: { booking: true }
            });
        },
        updatePaymentStatus: async (_, { input }) => {
            const { id, status, transactionId } = input;
            return await database_1.default.payment.update({
                where: { id },
                data: {
                    status,
                    transactionId
                },
                include: { booking: true }
            });
        }
    },
    Payment: {
        booking: async (parent) => {
            return await database_1.default.booking.findUnique({
                where: { id: parent.bookingId }
            });
        }
    }
};
//# sourceMappingURL=paymentResolvers.js.map