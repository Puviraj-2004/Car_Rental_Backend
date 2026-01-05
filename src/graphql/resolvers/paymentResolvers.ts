import prisma from '../../utils/database';
import { isAdmin, isOwnerOrAdmin, isAuthenticated } from '../../utils/authguard';

const isMockStripe = (process.env.MOCK_STRIPE || '').toLowerCase() === 'true';

function getStripeClient(): any {
  if (isMockStripe) return null;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
  if (!stripeSecretKey) return null;

  // Lazy require so dev can run MOCK_STRIPE=true without installing stripe
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Stripe = require('stripe');
  return new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
}

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
    createStripeCheckoutSession: async (_: any, { bookingId }: { bookingId: string }, context: any) => {
      isAuthenticated(context);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { car: { include: { model: { include: { brand: true } } } }, payment: true }
      });

      if (!booking) throw new Error('Booking not found');
      isOwnerOrAdmin(context, booking.userId);

      if (booking.status !== 'VERIFIED') {
        throw new Error(`Booking is not ready for payment. Current status: ${booking.status}`);
      }

      if (booking.payment && booking.payment.status === 'SUCCEEDED') {
        throw new Error('Payment already completed');
      }

      const amount = Math.max(0, Number(booking.totalPrice || 0));

      if (isMockStripe) {
        const sessionId = `mock_${booking.id}`;
        await prisma.payment.upsert({
          where: { bookingId: booking.id },
          update: { amount, status: 'PENDING', stripeId: sessionId },
          create: { bookingId: booking.id, amount, status: 'PENDING', stripeId: sessionId },
        });

        return {
          url: `${frontendUrl}/payment/mock?bookingId=${booking.id}`,
          sessionId,
        };
      }

      const stripe = getStripeClient();
      if (!stripe) throw new Error('Stripe is not configured. Missing STRIPE_SECRET_KEY.');

      const unitAmount = Math.round(amount * 100);

      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: 'eur',
              unit_amount: unitAmount,
              product_data: {
                name:
                  `Car Rental - ${booking.car?.model?.brand?.name || ''} ${booking.car?.model?.name || ''}`.trim() ||
                  'Car Rental',
                description: `Booking ${booking.id}`,
              },
            },
          },
        ],
        success_url: `${frontendUrl}/payment/success?bookingId=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/payment/cancel?bookingId=${booking.id}`,
        metadata: {
          bookingId: booking.id,
          userId: booking.userId,
        },
      });

      await prisma.payment.upsert({
        where: { bookingId: booking.id },
        update: {
          amount,
          status: 'PENDING',
          stripeId: session.id,
        },
        create: {
          bookingId: booking.id,
          amount,
          status: 'PENDING',
          stripeId: session.id,
        },
      });

      return { url: session.url || '', sessionId: session.id };
    },

    mockFinalizePayment: async (_: any, { bookingId, success }: { bookingId: string; success: boolean }, context: any) => {
      isAuthenticated(context);

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: { payment: true },
      });

      if (!booking) throw new Error('Booking not found');
      isOwnerOrAdmin(context, booking.userId);

      if (booking.status !== 'VERIFIED') {
        throw new Error(`Booking is not ready for payment. Current status: ${booking.status}`);
      }

      const amount = Math.max(0, Number(booking.totalPrice || 0));
      const newStatus = success ? 'SUCCEEDED' : 'FAILED';

      const payment = await prisma.payment.upsert({
        where: { bookingId: booking.id },
        update: {
          amount,
          status: newStatus,
          stripeId: booking.payment?.stripeId || `mock_${booking.id}`,
        },
        create: {
          bookingId: booking.id,
          amount,
          status: newStatus,
          stripeId: `mock_${booking.id}`,
        },
        include: { booking: true },
      });

      if (success) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'CONFIRMED' },
        });
      }

      return payment;
    },

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