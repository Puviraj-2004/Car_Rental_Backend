import { isAuthenticated, isAdmin, isOwnerOrAdmin } from '../../utils/authguard';
import { bookingService } from '../../services/bookingService';

export const bookingResolvers = {
  Query: {
    bookings: async (_: any, __: any, context: any) => {
      isAdmin(context);
      return await bookingService.getAllBookings();
    },

    myBookings: async (_: any, __: any, context: any) => {
      isAuthenticated(context);
      return await bookingService.getBookingsByUserId(context.userId);
    },

    checkCarAvailability: async (_: any, { carId, startDate, endDate }: any) => {
      return await bookingService.checkAvailability(carId, startDate, endDate);
    },

    booking: async (_: any, { id }: { id: string }, context: any) => {
      isAuthenticated(context);
      const booking = await bookingService.getBookingById(id);
      if (!booking) return null;
      isOwnerOrAdmin(context, booking.userId);
      return booking;
    },

    bookingByToken: async (_: any, { token }: { token: string }) => {
      return await bookingService.getBookingByToken(token);
    },

    userBookings: async (_: any, { userId }: { userId: string }, context: any) => {
      isAdmin(context);
      return await bookingService.getBookingsByUserIdBasic(userId);
    },

    carBookings: async (_: any, { carId }: { carId: string }, context: any) => {
      isAdmin(context);
      return await bookingService.getBookingsByCarId(carId);
    }
  },

  Mutation: {
    createBooking: async (_: any, { input }: { input: any }, context: any) => {
      isAuthenticated(context);
      return await bookingService.createBooking(context.userId, context.role, input);
    },

    confirmReservation: async (_: any, { id }: { id: string }, context: any) => {
      isAuthenticated(context);
      return await bookingService.confirmReservation(id, context.userId);
    },

    startTrip: async (_: any, { bookingId }: { bookingId: string }, context: any) => {
      isAuthenticated(context);
      return await bookingService.startTrip(bookingId);
    },

    completeTrip: async (_: any, { bookingId }: { bookingId: string }, context: any) => {
      isAdmin(context);
      return await bookingService.completeTrip(bookingId);
    },

    finishCarMaintenance: async (_: any, { carId }: { carId: string }, context: any) => {
      isAdmin(context);
      return await bookingService.finishCarMaintenance(carId);
    },

    updateBookingStatus: async (_: any, { id, status }: any, context: any) => {
      return await bookingService.updateBookingStatus(id, status, context.userId, context.role);
    },

    cancelBooking: async (_: any, { id }: { id: string }, context: any) => {
      isAuthenticated(context);
      await bookingService.cancelBooking(id, context.userId, context.role);
      return true;
    },

    deleteBooking: async (_: any, { id }: { id: string }, context: any) => {
      isAdmin(context);
      await bookingService.deleteBooking(id);
      return true;
    },

    updateBooking: async (_: any, { id, input }: { id: string, input: any }, context: any) => {
      isAdmin(context);
      return await bookingService.updateBooking(id, input);
    }
  }
};