"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingResolvers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Calculate TVA (20% tax) for French bookings
const calculateTax = (amount) => {
    return amount * 0.2; // 20% TVA
};
// Calculate total price including tax
const calculateTotalPrice = (basePrice, taxAmount) => {
    return basePrice + taxAmount;
};
exports.bookingResolvers = {
    Query: {
        bookings: async () => {
            return await prisma.booking.findMany({
                include: {
                    user: true,
                    car: true
                }
            });
        },
        booking: async (_, { id }) => {
            return await prisma.booking.findUnique({
                where: { id },
                include: {
                    user: true,
                    car: true
                }
            });
        },
        userBookings: async (_, { userId }) => {
            return await prisma.booking.findMany({
                where: { userId },
                include: {
                    user: true,
                    car: true
                }
            });
        },
        carBookings: async (_, { carId }) => {
            return await prisma.booking.findMany({
                where: { carId },
                include: {
                    user: true,
                    car: true
                }
            });
        }
    },
    Mutation: {
        createBooking: async (_, { input }, context) => {
            if (!context.userId) {
                throw new Error('Authentication required');
            }
            // Check if dates are valid
            const startDate = new Date(input.startDate);
            const endDate = new Date(input.endDate);
            if (startDate >= endDate) {
                throw new Error('End date must be after start date');
            }
            // Check if car is available for the given dates
            const overlappingBookings = await prisma.booking.findMany({
                where: {
                    carId: input.carId,
                    status: { not: 'cancelled' },
                    AND: [
                        { startDate: { lte: endDate } },
                        { endDate: { gte: startDate } }
                    ]
                }
            });
            if (overlappingBookings.length > 0) {
                throw new Error('Car is not available for the selected dates');
            }
            // Get car details
            const car = await prisma.car.findUnique({
                where: { id: input.carId }
            });
            if (!car) {
                throw new Error('Car not found');
            }
            if (!car.availability) {
                throw new Error('Car is not available');
            }
            // Calculate pricing
            const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
            const basePrice = days * car.pricePerDay;
            const taxAmount = calculateTax(basePrice);
            const totalPrice = calculateTotalPrice(basePrice, taxAmount);
            // Create booking
            return await prisma.booking.create({
                data: {
                    userId: context.userId,
                    carId: input.carId,
                    startDate,
                    endDate,
                    basePrice,
                    taxAmount,
                    totalPrice,
                    status: 'pending',
                    pickupLocation: input.pickupLocation,
                    dropoffLocation: input.dropoffLocation
                },
                include: {
                    user: true,
                    car: true
                }
            });
        },
        updateBookingStatus: async (_, { input }) => {
            return await prisma.booking.update({
                where: { id: input.id },
                data: { status: input.status },
                include: {
                    user: true,
                    car: true
                }
            });
        },
        cancelBooking: async (_, { id }) => {
            const booking = await prisma.booking.findUnique({
                where: { id }
            });
            if (!booking) {
                throw new Error('Booking not found');
            }
            // Only allow cancellation of pending or confirmed bookings
            if (booking.status !== 'pending' && booking.status !== 'confirmed') {
                throw new Error('Cannot cancel booking with current status');
            }
            await prisma.booking.update({
                where: { id },
                data: { status: 'cancelled' }
            });
            return true;
        }
    },
    Booking: {
        user: async (parent) => {
            return await prisma.user.findUnique({
                where: { id: parent.userId }
            });
        },
        car: async (parent) => {
            return await prisma.car.findUnique({
                where: { id: parent.carId }
            });
        }
    }
};
//# sourceMappingURL=bookingResolvers.js.map