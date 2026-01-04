import prisma from '../../utils/database';
import { isAdmin, isOwnerOrAdmin, isAuthenticated } from '../../utils/authguard';

export const paymentResolvers = {
  Query: {
    payments: async (_: any, __: any, context: any) => {
      isAdmin(context);
      return await prisma.payment.findMany({ include: { booking: true } });
    },

    bookingPayment: async (_: any, { bookingId }: { bookingId: string }, context: any) => {
      const payment = await prisma.payment.findUnique({
        where: { bookingId },
        include: { booking: true }
      });

      if (payment) {
        isOwnerOrAdmin(context, payment.booking.userId);
      } else {
        isAdmin(context); // If no payment found, only admin usually checks this directly
      }

      return payment;
    }
  },

  Mutation: {
    createPayment: async (_: any, { input }: { input: any }, context: any) => {
      isAuthenticated(context);

      const booking = await prisma.booking.findUnique({
        where: { id: input.bookingId }
      });

      if (!booking) throw new Error('Booking not found');
      isOwnerOrAdmin(context, booking.userId); // Only owner can pay

      const existingPayment = await prisma.payment.findUnique({
        where: { bookingId: input.bookingId }
      });
      if (existingPayment) throw new Error('Payment already exists');

      // input.status should be enum compatible usually, or cast
      const payment = await prisma.payment.create({
        data: {
          ...input,
          status: input.status || 'SUCCEEDED', // Default to SUCCEEDED for basic implementation
        },
        include: { booking: true }
      });

      // Update booking status to CONFIRMED when payment is created
      if (payment.status === 'SUCCEEDED') {
        await prisma.booking.update({
          where: { id: input.bookingId },
          data: { status: 'CONFIRMED' }
        });

        // AuditLog removed
      }

      return payment;
    },

    updatePaymentStatus: async (_: any, { input }: { input: any }, context: any) => {
      isAdmin(context);

      const { id, status } = input;
      // Removed transactionId as it's not in schema
      return await prisma.payment.update({
        where: { id },
        data: { status },
        include: { booking: true }
      });
    }
  }
};