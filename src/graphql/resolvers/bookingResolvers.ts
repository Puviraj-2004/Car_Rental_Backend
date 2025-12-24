import prisma from '../../utils/database';

export const bookingResolvers = {
  Query: {
    // 📋 Get all bookings
    bookings: async () => {
      try {
        return await (prisma.booking as any).findMany({
          include: {
            user: true,
            car: {
              include: {
                brand: true,
                model: true,
                images: true,
              },
            },
            payment: true,
          },
          orderBy: { createdAt: 'desc' },
        });
      } catch (error) {
        console.error("Error fetching bookings:", error);
        throw new Error("Could not fetch bookings");
      }
    },

    // 👤 Get current user's bookings
    // பயன்டுத்தாத context-க்கு முன்னால் _ சேர்த்துள்ளேன்
    myBookings: async (_parent: any, _args: any, _context: any) => {
      try {
        return await (prisma.booking as any).findMany({
          where: { 
            // userId: _context.user?.id 
          },
          include: {
            car: {
              include: { 
                brand: true, 
                model: true,
                images: true 
              },
            },
            payment: true,
          },
          orderBy: { createdAt: 'desc' },
        });
      } catch (error) {
        throw new Error("Error fetching your bookings");
      }
    },

    booking: async (_: any, { id }: { id: string }) => {
      return await (prisma.booking as any).findUnique({
        where: { id },
        include: {
          user: true,
          car: {
            include: { brand: true, model: true, images: true },
          },
          payment: true,
        },
      });
    },
  },

  Mutation: {
    createBooking: async (_: any, { input }: { input: any }) => {
      try {
        return await (prisma.booking as any).create({
          data: {
            ...input,
            status: 'PENDING',
          },
          include: {
            user: true,
            car: {
              include: { brand: true, model: true },
            },
          },
        });
      } catch (error) {
        console.error("Booking Creation Error:", error);
        throw new Error("Failed to create booking.");
      }
    },

    updateBookingStatus: async (_: any, { id, status }: { id: string, status: any }) => {
      try {
        return await (prisma.booking as any).update({
          where: { id },
          data: { status },
          include: { 
            car: { include: { brand: true, model: true } }, 
            user: true 
          },
        });
      } catch (error) {
        throw new Error("Failed to update booking status");
      }
    },

    deleteBooking: async (_: any, { id }: { id: string }) => {
      await (prisma.booking as any).delete({ where: { id } });
      return true;
    },
  },

  Booking: {
    user: async (parent: any) => {
      return await prisma.user.findUnique({ where: { id: parent.userId } });
    },
    car: async (parent: any) => {
      return await (prisma.car as any).findUnique({
        where: { id: parent.carId },
        include: { brand: true, model: true },
      });
    },
    payment: async (parent: any) => {
      return await (prisma.payment as any).findUnique({ where: { bookingId: parent.id } });
    },
  },
};