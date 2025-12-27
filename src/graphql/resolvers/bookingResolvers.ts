// backend/src/graphql/resolvers/bookingResolvers.ts

import { v4 as uuidv4 } from 'uuid';
import prisma from '../../utils/database';
import { isAuthenticated, isAdmin, isOwnerOrAdmin } from '../../utils/authguard';

export const bookingResolvers = {
  Query: {
    // 🛡️ Admin: Ella bookings-aiyum paarkka
    bookings: async (_: any, __: any, context: any) => {
      isAdmin(context);
      return await prisma.booking.findMany({
        include: {
          user: true,
          car: { include: { brand: true, model: true } },
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    },

    // 👤 User: Thannudaiya bookings-ai paarkka
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

    // 🔍 Single Booking: Details paarkka (Owner or Admin only)
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
      isOwnerOrAdmin(context, booking.userId); 
      
      return booking;
    },

    // 📊 Admin: Oru specific user-oda bookings-ai paarkka
    userBookings: async (_: any, { userId }: { userId: string }, context: any) => {
      isAdmin(context);
      return await prisma.booking.findMany({
        where: { userId },
        include: { car: true, payment: true }
      });
    }
  },

  Mutation: {
    // 🆕 Step 1: User creates a draft booking
    createBooking: async (_: any, { input }: { input: any }, context: any) => {
      isAuthenticated(context);

      // 🚨 Dates-ai string-ilirundhu Date object-aaga maatra vendum
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);

      return await prisma.booking.create({
        data: {
          userId: context.userId,
          carId: input.carId,
          startDate,
          endDate,
          basePrice: input.basePrice,
          taxAmount: input.taxAmount,
          totalPrice: input.totalPrice,
          depositAmount: input.depositAmount,
          surchargeAmount: input.surchargeAmount || 0, // ✅ New Field added
          rentalType: input.rentalType,
          pickupLocation: input.pickupLocation,
          dropoffLocation: input.dropoffLocation,
          status: 'DRAFT',
        },
        include: {
          car: { include: { brand: true, model: true } },
        },
      });
    },

    // 📧 Step 2: System verification link anuppudhal
    sendBookingVerificationLink: async (_: any, { bookingId }: { bookingId: string }, context: any) => {
      const booking = await prisma.booking.findUnique({ where: { id: bookingId }});
      if (!booking) throw new Error('Booking not found');
      
      isOwnerOrAdmin(context, booking.userId);

      const token = uuidv4(); // Unique token generation
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

      // Token-ai save seiyyal
      await prisma.bookingVerification.upsert({
        where: { bookingId },
        update: { token, expiresAt, isVerified: false },
        create: { bookingId, token, expiresAt }
      });

      // Status-ai update seiyyal
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'AWAITING_VERIFICATION' }
      });

      // 💡 Inge dhaan neenga email anuppum function-ai (eg: sendEmail) call seiyyanum
      console.log(`Verification Token for Booking ${bookingId}: ${token}`);

      return {
        success: true,
        message: "Verification link generated and sent successfully.",
        bookingId
      };
    },

    // 🔗 Step 3: Magic link token-ai verify seiyyal (Public Route)
    verifyBookingToken: async (_: any, { token }: { token: string }) => {
      const verification = await prisma.bookingVerification.findUnique({
        where: { token }
      });

      if (!verification) throw new Error("Invalid or broken verification link.");
      if (new Date() > verification.expiresAt) throw new Error("Verification link has expired.");

      // DB updates
      await prisma.$transaction([
        prisma.bookingVerification.update({
          where: { id: verification.id },
          data: { isVerified: true, verifiedAt: new Date() }
        }),
        prisma.booking.update({
          where: { id: verification.bookingId },
          data: { status: 'AWAITING_PAYMENT' }
        })
      ]);

      return {
        success: true,
        message: "Booking verified. You can now proceed to payment.",
        bookingId: verification.bookingId
      };
    },

    // ⚙️ Admin: Status-ai manual-aaga update seiyya (eg: CONFIRMED after payment)
    updateBookingStatus: async (_: any, { id, status }: { id: string, status: any }, context: any) => {
      isAdmin(context);
      
      return await prisma.booking.update({
        where: { id },
        data: { status },
      });
    },
    
    // ❌ Cancel Booking: User or Admin can cancel
    cancelBooking: async (_: any, { id }: { id: string }, context: any) => {
      const booking = await prisma.booking.findUnique({ where: { id }});
      if (!booking) throw new Error('Booking not found');
      
      isOwnerOrAdmin(context, booking.userId);

      await prisma.booking.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });
      return true;
    },

    // 🗑️ Delete Booking: Admin only
    deleteBooking: async (_: any, { id }: { id: string }, context: any) => {
      isAdmin(context);
      await prisma.booking.delete({ where: { id } });
      return true;
    }
  }
};