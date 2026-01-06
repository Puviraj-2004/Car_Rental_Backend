import { isAdmin, isOwnerOrAdmin, isAuthenticated } from '../../utils/authguard';
import { paymentService } from '../../services/paymentService';

export const paymentResolvers = {
  Query: {
    payments: async (_: any, __: any, context: any) => {
      isAdmin(context);
      return await paymentService.getAllPayments();
    },

    bookingPayment: async (_: any, { bookingId }: { bookingId: string }, context: any) => {
      const payment = await paymentService.getPaymentByBookingId(bookingId);

      if (payment) {
        isOwnerOrAdmin(context, payment.booking.userId);
      } else {
        isAdmin(context);
      }

      return payment;
    }
  },

  Mutation: {
    createStripeCheckoutSession: async (_: any, { bookingId }: { bookingId: string }, context: any) => {
      isAuthenticated(context);

      // Fetch booking to check ownership before calling service
      const booking = await paymentService.getBookingForAuth(bookingId);
      if (!booking) throw new Error('Booking not found');
      isOwnerOrAdmin(context, booking.userId);

      return await paymentService.createStripeSession(bookingId);
    },

    mockFinalizePayment: async (_: any, { bookingId, success }: { bookingId: string; success: boolean }, context: any) => {
      isAuthenticated(context);

      const booking = await paymentService.getBookingForAuth(bookingId);
      if (!booking) throw new Error('Booking not found');
      isOwnerOrAdmin(context, booking.userId);

      return await paymentService.finalizeMockPayment(bookingId, success);
    },

    createPayment: async (_: any, { input }: { input: any }, context: any) => {
      isAuthenticated(context);

      const booking = await paymentService.getBookingForAuth(input.bookingId);
      if (!booking) throw new Error('Booking not found');
      isOwnerOrAdmin(context, booking.userId);

      return await paymentService.processManualPayment(input);
    },

    updatePaymentStatus: async (_: any, { input }: { input: any }, context: any) => {
      isAdmin(context);
      const { id, status } = input;
      return await paymentService.updatePaymentStatus(id, status);
    }
  }
};