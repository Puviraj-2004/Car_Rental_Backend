import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const paymentResolvers = {
  Query: {
    payments: async () => {
      return await prisma.payment.findMany({
        include: { booking: true }
      });
    },

    payment: async (_: any, { id }: { id: string }) => {
      return await prisma.payment.findUnique({
        where: { id },
        include: { booking: true }
      });
    },

    bookingPayment: async (_: any, { bookingId }: { bookingId: string }) => {
      return await prisma.payment.findUnique({
        where: { bookingId },
        include: { booking: true }
      });
    }
  },

  Mutation: {
    createPayment: async (_: any, { input }: { input: any }) => {
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

    updatePaymentStatus: async (_: any, { input }: { input: any }) => {
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
    booking: async (parent: any) => {
      return await prisma.booking.findUnique({
        where: { id: parent.bookingId }
      });
    }
  }
};
