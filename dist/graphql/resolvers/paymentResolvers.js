"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentResolvers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.paymentResolvers = {
    Query: {
        payments: async () => {
            return await prisma.payment.findMany({
                include: { booking: true }
            });
        },
        payment: async (_, { id }) => {
            return await prisma.payment.findUnique({
                where: { id },
                include: { booking: true }
            });
        },
        bookingPayment: async (_, { bookingId }) => {
            return await prisma.payment.findUnique({
                where: { bookingId },
                include: { booking: true }
            });
        }
    },
    Mutation: {
        createPayment: async (_, { input }) => {
            // Verify booking exists and doesn't already have a payment
            const existingPayment = await prisma.payment.findUnique({
                where: { bookingId: input.bookingId }
            });
            if (existingPayment) {
                throw new Error('Payment already exists for this booking');
            }
            return await prisma.payment.create({
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
            return await prisma.payment.update({
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
            return await prisma.booking.findUnique({
                where: { id: parent.bookingId }
            });
        }
    }
};
//# sourceMappingURL=paymentResolvers.js.map