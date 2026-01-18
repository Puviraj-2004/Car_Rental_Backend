import { paymentRepository } from '../repositories/paymentRepository';
import { bookingRepository } from '../repositories/bookingRepository';
import { AppError, ErrorCode } from '../errors/AppError';
import { PaymentStatus, BookingStatus, CreatePaymentInput } from '../types/graphql';

const isMockStripe = (process.env.MOCK_STRIPE || '').toLowerCase() === 'true';

// 🛡️ Senior Logic: Explicitly define the relation types to stop 'never' errors
interface BookingWithDetails {
  id: string;
  userId: string;
  totalPrice: number | null;
  status: string;
  car: {
    model: {
      name: string;
      brand: {
        name: string;
      };
    };
  };
  payment: {
    status: string;
    stripeId: string | null;
  } | null;
}

export class PaymentService {
  private getStripeClient(): any {
    if (isMockStripe) return null;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
    if (!stripeSecretKey) return null;

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Stripe = require('stripe');
    return new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
  }

  async createStripeSession(bookingId: string) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Cast the repository call to our detailed interface
    const booking = await bookingRepository.findUnique(bookingId, { 
      car: { include: { model: { include: { brand: true } } } }, 
      payment: true 
    }) as BookingWithDetails | null;

    if (!booking) throw new AppError('Booking not found', ErrorCode.NOT_FOUND);
    
    if (booking.status !== BookingStatus.VERIFIED) {
      throw new AppError(`Booking is not ready for payment. Status: ${booking.status}`, ErrorCode.BAD_USER_INPUT);
    }

    // Explicit check for existing payment to avoid 'never' access
    if (booking.payment && booking.payment.status === PaymentStatus.SUCCEEDED) {
      throw new AppError('Payment already completed', ErrorCode.BAD_USER_INPUT);
    }

    const amount = Math.max(0, Number(booking.totalPrice || 0));

    if (isMockStripe) {
      const sessionId = `mock_${booking.id}`;
      await paymentRepository.upsertPayment(booking.id, {
        amount,
        status: PaymentStatus.PENDING,
        stripeId: sessionId
      });

      return {
        url: `${frontendUrl}/payment/mock?bookingId=${booking.id}`,
        sessionId,
      };
    }

    const stripe = this.getStripeClient();
    if (!stripe) throw new AppError('Stripe is not configured correctly', ErrorCode.INTERNAL_SERVER_ERROR);

    const carName = `${booking.car.model.brand.name} ${booking.car.model.name}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'eur',
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: `Car Rental - ${carName}`,
            description: `Booking ID: ${booking.id}`,
          },
        },
      }],
      
      payment_intent_data: {
        metadata: { bookingId: booking.id, userId: booking.userId }
      },
      success_url: `${frontendUrl}/payment/success?bookingId=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment/cancel?bookingId=${booking.id}`,
      metadata: { bookingId: booking.id, userId: booking.userId },
    });

    await paymentRepository.upsertPayment(booking.id, {
      amount,
      status: PaymentStatus.PENDING,
      stripeId: session.id
    });

    return { url: session.url || '', sessionId: session.id };
  }

  async finalizeMockPayment(bookingId: string, success: boolean) {
    const booking = await bookingRepository.findUnique(bookingId, { payment: true }) as BookingWithDetails | null;
    if (!booking) throw new AppError('Booking not found', ErrorCode.NOT_FOUND);

    const amount = Math.max(0, Number(booking.totalPrice || 0));
    const newStatus = success ? PaymentStatus.SUCCEEDED : PaymentStatus.FAILED;

    const payment = await paymentRepository.upsertPayment(booking.id, {
      amount,
      status: newStatus,
      // Safely access stripeId using optional chaining and fallback
      stripeId: booking.payment?.stripeId || `mock_${booking.id}`,
    });

    if (success) {
      await bookingRepository.update(booking.id, { status: BookingStatus.CONFIRMED });
    }

    return payment;
  }

  async processManualPayment(input: CreatePaymentInput) {
    const booking = await bookingRepository.findUnique(input.bookingId, {});
    if (!booking) throw new AppError('Booking not found', ErrorCode.NOT_FOUND);

    const existingPayment = await paymentRepository.findByBookingId(input.bookingId);
    if (existingPayment) throw new AppError('Payment already exists', ErrorCode.ALREADY_EXISTS);

    const payment = await paymentRepository.create({
      ...input,
      status: input.status || PaymentStatus.SUCCEEDED,
    });

    if (payment.status === PaymentStatus.SUCCEEDED) {
      await bookingRepository.update(input.bookingId, { status: BookingStatus.CONFIRMED });
    }

    return payment;
  }

  async refundPayment(paymentId: string) {
    const payment = await paymentRepository.findById(paymentId);
    if (!payment) throw new AppError('Payment not found', ErrorCode.NOT_FOUND);

    const bookingId = payment.bookingId;

    if (isMockStripe) {
      await paymentRepository.update(paymentId, { status: PaymentStatus.REFUNDED });
      await bookingRepository.update(bookingId, { status: BookingStatus.CANCELLED });
      return await paymentRepository.findById(paymentId);
    }

    const stripe = this.getStripeClient();
    if (!stripe) throw new AppError('Stripe is not configured correctly', ErrorCode.INTERNAL_SERVER_ERROR);

    if (!payment.stripeId) throw new AppError('No stripe identifier for payment', ErrorCode.BAD_USER_INPUT);

    // Attempt refund using payment_intent id saved in stripeId
    try {
      await stripe.refunds.create({ payment_intent: payment.stripeId });
      await paymentRepository.update(paymentId, { status: PaymentStatus.REFUNDED });
      await bookingRepository.update(bookingId, { status: BookingStatus.CANCELLED });
      return await paymentRepository.findById(paymentId);
    } catch (err: any) {
      throw new AppError(`Stripe refund failed: ${err?.message || err}`, ErrorCode.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllPayments() {
    return await paymentRepository.findAll();
  }

  async getPaymentByBookingId(bookingId: string) {
    return await paymentRepository.findByBookingId(bookingId);
  }

  async updatePaymentStatus(id: string, status: PaymentStatus) {
    // Business logic validation for payment status updates
    const validStatuses = [PaymentStatus.PENDING, PaymentStatus.SUCCEEDED, PaymentStatus.FAILED, PaymentStatus.REFUNDED];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid payment status: ${status}`, ErrorCode.BAD_USER_INPUT);
    }

    const existingPayment = await paymentRepository.findById(id);
    if (!existingPayment) {
      throw new AppError('Payment not found', ErrorCode.NOT_FOUND);
    }

    return await paymentRepository.update(id, { status });
  }

  async getBookingForAuth(bookingId: string) {
    // Minimal method for authorization checks - returns only userId
    const booking = await bookingRepository.findUnique(bookingId, {});
    return booking ? { userId: booking.userId } : null;
  }
}

export const paymentService = new PaymentService();