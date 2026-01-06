"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingResolvers = void 0;
const authguard_1 = require("../../utils/authguard");
const bookingService_1 = require("../../services/bookingService");
exports.bookingResolvers = {
    Query: {
        bookings: async (_, __, context) => {
            (0, authguard_1.isAdmin)(context);
            return await bookingService_1.bookingService.getAllBookings();
        },
        myBookings: async (_, __, context) => {
            (0, authguard_1.isAuthenticated)(context);
            return await bookingService_1.bookingService.getBookingsByUserId(context.userId);
        },
        checkCarAvailability: async (_, { carId, startDate, endDate }) => {
            return await bookingService_1.bookingService.checkAvailability(carId, startDate, endDate);
        },
        booking: async (_, { id }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            const booking = await bookingService_1.bookingService.getBookingById(id);
            if (!booking)
                return null;
            (0, authguard_1.isOwnerOrAdmin)(context, booking.userId);
            return booking;
        },
        bookingByToken: async (_, { token }) => {
            return await bookingService_1.bookingService.getBookingByToken(token);
        },
        userBookings: async (_, { userId }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await bookingService_1.bookingService.getBookingsByUserIdBasic(userId);
        },
        carBookings: async (_, { carId }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await bookingService_1.bookingService.getBookingsByCarId(carId);
        }
    },
    Mutation: {
        createBooking: async (_, { input }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            return await bookingService_1.bookingService.createBooking(context.userId, context.role, input);
        },
        confirmReservation: async (_, { id }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            return await bookingService_1.bookingService.confirmReservation(id, context.userId);
        },
        startTrip: async (_, { bookingId }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            return await bookingService_1.bookingService.startTrip(bookingId);
        },
        completeTrip: async (_, { bookingId }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await bookingService_1.bookingService.completeTrip(bookingId);
        },
        finishCarMaintenance: async (_, { carId }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await bookingService_1.bookingService.finishCarMaintenance(carId);
        },
        updateBookingStatus: async (_, { id, status }, context) => {
            return await bookingService_1.bookingService.updateBookingStatus(id, status, context.userId, context.role);
        },
        cancelBooking: async (_, { id }, context) => {
            (0, authguard_1.isAuthenticated)(context);
            await bookingService_1.bookingService.cancelBooking(id, context.userId, context.role);
            return true;
        },
        deleteBooking: async (_, { id }, context) => {
            (0, authguard_1.isAdmin)(context);
            await bookingService_1.bookingService.deleteBooking(id);
            return true;
        },
        updateBooking: async (_, { id, input }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await bookingService_1.bookingService.updateBooking(id, input);
        }
    }
};
//# sourceMappingURL=bookingResolvers.js.map