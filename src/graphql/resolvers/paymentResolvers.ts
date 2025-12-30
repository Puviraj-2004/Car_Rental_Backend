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

      const payment = await prisma.payment.create({
        data: {
          ...input,
          status: input.status || 'COMPLETED', // Default to COMPLETED for basic implementation
        },
        include: { booking: true }
      });

      // Update booking status to CONFIRMED when payment is created
      if (payment.status === 'COMPLETED') {
        await prisma.booking.update({
          where: { id: input.bookingId },
          data: { status: 'CONFIRMED' }
        });

        // Log the payment and booking confirmation
        await prisma.auditLog.create({
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

    updatePaymentStatus: async (_: any, { input }: { input: any }, context: any) => {
      isAdmin(context);

      const { id, status, transactionId } = input;
      return await prisma.payment.update({
        where: { id },
        data: { status, transactionId },
        include: { booking: true }
      });
    }
  }
};