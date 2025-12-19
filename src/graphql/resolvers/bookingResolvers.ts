import { PrismaClient } from '@prisma/client';
import { calculateTax, calculateTotalPrice, calculateRentalCost } from '../../utils/pricing';
import { validateBookingInput } from '../../utils/validation';

const prisma = new PrismaClient();

export const bookingResolvers = {
  Query: {
    bookings: async () => {
      return await prisma.booking.findMany({
        include: {
          user: true,
          car: true,
          payment: true
        }
      });
    },

    booking: async (_: any, { id }: { id: string }) => {
      return await prisma.booking.findUnique({
        where: { id },
        include: {
          user: true,
          car: true,
          payment: true
        }
      });
    },

    userBookings: async (_: any, { userId }: { userId: string }) => {
      return await prisma.booking.findMany({
        where: { userId },
        include: {
          user: true,
          car: true,
          payment: true
        }
      });
    },

    carBookings: async (_: any, { carId }: { carId: string }) => {
      return await prisma.booking.findMany({
        where: { carId },
        include: {
          user: true,
          car: true,
          payment: true
        }
      });
    }
  },

  Mutation: {
    createBooking: async (_: any, { input }: { input: any }, context: any) => {
      if (!context.userId) {
        throw new Error('Authentication required');
      }

      // Validate input
      const validation = validateBookingInput(input);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      const { carId, startDate, endDate, rentalType, rentalValue, pickupLocation, dropoffLocation } = input;

      // Check if dates are valid and car availability (only for DAY rentals)
      if (rentalType === 'DAY') {
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Check if car is available for the given dates
        const overlappingBookings = await prisma.booking.findMany({
          where: {
            carId,
            status: { not: 'cancelled' },
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: start } }
            ]
          }
        });

        if (overlappingBookings.length > 0) {
          throw new Error('Car is not available for the selected dates');
        }
      }

      // Get car details
      const car = await prisma.car.findUnique({
        where: { id: carId }
      });

      if (!car) {
        throw new Error('Car not found');
      }

      if (!car.availability) {
        throw new Error('Car is not available');
      }

      // Calculate pricing based on rental type
      let calculatedRentalValue = rentalValue;

      if (rentalType === 'DAY' && !rentalValue) {
        // Calculate days if not provided
        const start = new Date(startDate);
        const end = new Date(endDate);
        calculatedRentalValue = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      }

      const basePrice = calculateRentalCost(
        rentalType,
        calculatedRentalValue,
        car.pricePerHour,
        car.pricePerKm,
        car.pricePerDay
      );

      const taxAmount = calculateTax(basePrice);
      const totalPrice = calculateTotalPrice(basePrice, taxAmount);

      // Create booking
      return await prisma.booking.create({
        data: {
          userId: context.userId,
          carId,
          startDate: rentalType === 'DAY' ? new Date(startDate) : null,
          endDate: rentalType === 'DAY' ? new Date(endDate) : null,
          rentalType,
          rentalValue: calculatedRentalValue,
          basePrice,
          taxAmount,
          totalPrice,
          status: 'pending',
          pickupLocation,
          dropoffLocation
        },
        include: {
          user: true,
          car: true,
          payment: true
        }
      });
    },

    updateBookingStatus: async (_: any, { input }: { input: any }) => {
      return await prisma.booking.update({
        where: { id: input.id },
        data: { status: input.status },
        include: {
          user: true,
          car: true,
          payment: true
        }
      });
    },

    cancelBooking: async (_: any, { id }: { id: string }) => {
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
    user: async (parent: any) => {
      return await prisma.user.findUnique({
        where: { id: parent.userId }
      });
    },

    car: async (parent: any) => {
      return await prisma.car.findUnique({
        where: { id: parent.carId }
      });
    },

    payment: async (parent: any) => {
      return await prisma.payment.findUnique({
        where: { bookingId: parent.id }
      });
    }
  }
};