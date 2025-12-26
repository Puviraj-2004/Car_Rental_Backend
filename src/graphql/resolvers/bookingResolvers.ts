import prisma from '../../utils/database';
import { v4 as uuidv4 } from 'uuid';
import { isAuthenticated, isAdmin, isOwnerOrAdmin } from '../../utils/authguard';

export const bookingResolvers = {
  Query: {
    bookings: async (_: any, __: any, context: any) => {
      isAdmin(context); // Only Admin sees all bookings
      return await prisma.booking.findMany({
        include: {
          user: true,
          car: { include: { brand: true, model: true } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    myBookings: async (_: any, __: any, context: any) => {
      isAuthenticated(context);
      return await prisma.booking.findMany({
        where: { userId: context.userId },
        include: {
          car: { include: { brand: true, model: true, images: true } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    booking: async (_: any, { id }: { id: string }, context: any) => {
      const booking = await prisma.booking.findUnique({
        where: { id },
        include: {
          user: true,
          car: { include: { brand: true, model: true } },
          payment: true,
          verification: true
        },
      });
      
      if (!booking) throw new Error('Booking not found');
      isOwnerOrAdmin(context, booking.userId); // Check permission
      
      return booking;
    },
  },

  Mutation: {
    createBooking: async (_: any, { input }: { input: any }, context: any) => {
      isAuthenticated(context);

      return await prisma.booking.create({
        data: {
          ...input,
          userId: context.userId,
          status: 'DRAFT',
        },
        include: {
          car: { include: { brand: true, model: true } },
        },
      });
    },

    // User requests verification link
    sendBookingVerificationLink: async (_: any, { bookingId }: { bookingId: string }, context: any) => {
      // Need to fetch booking to check ownership
      const booking = await prisma.booking.findUnique({ where: { id: bookingId }});
      if (!booking) throw new Error('Booking not found');
      
      isOwnerOrAdmin(context, booking.userId);

      const token = uuidv4();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); 

      await prisma.bookingVerification.upsert({
        where: { bookingId },
        update: { token, expiresAt, isVerified: false },
        create: { bookingId, token, expiresAt }
      });

      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'AWAITING_VERIFICATION' }
      });

      // Email Logic Here (e.g. await sendEmail(...))

      return {
        success: true,
        message: "Verification link sent to your email.",
        bookingId
      };
    },

    // Public Route (Relies on Token)
    verifyBookingToken: async (_: any, { token }: { token: string }) => {
      const verification = await prisma.bookingVerification.findUnique({
        where: { token }
      });

      if (!verification) throw new Error("Invalid token");
      if (new Date() > verification.expiresAt) throw new Error("Token expired");

      await prisma.bookingVerification.update({
        where: { id: verification.id },
        data: { isVerified: true, verifiedAt: new Date() }
      });

      await prisma.booking.update({
        where: { id: verification.bookingId },
        data: { status: 'AWAITING_PAYMENT' }
      });

      return {
        success: true,
        message: "Booking verified. You can now proceed to payment.",
        bookingId: verification.bookingId
      };
    },

    updateBookingStatus: async (_: any, { id, status }: { id: string, status: any }, context: any) => {
      isAdmin(context);
      
      // If status is CONFIRMED, maybe send an email?
      return await prisma.booking.update({
        where: { id },
        data: { status },
      });
    },
    
    cancelBooking: async (_: any, { id }: { id: string }, context: any) => {
      const booking = await prisma.booking.findUnique({ where: { id }});
      if (!booking) throw new Error('Not found');
      
      isOwnerOrAdmin(context, booking.userId);

      await prisma.booking.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });
      return true;
    },

    deleteBooking: async (_: any, { id }: { id: string }, context: any) => {
      isAdmin(context);
      await prisma.booking.delete({ where: { id } });
      return true;
    }
  }
};