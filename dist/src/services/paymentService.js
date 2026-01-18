"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.PaymentService = void 0;
const paymentRepository_1 = require("../repositories/paymentRepository");
const bookingRepository_1 = require("../repositories/bookingRepository");
const AppError_1 = require("../errors/AppError");
const graphql_1 = require("../types/graphql");
const isMockStripe = (process.env.MOCK_STRIPE || '').toLowerCase() === 'true';
class PaymentService {
    getStripeClient() {
        if (isMockStripe)
            return null;
        const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
        if (!stripeSecretKey)
            return null;
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const Stripe = require('stripe');
        return new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
    }
    async createStripeSession(bookingId) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        // Cast the repository call to our detailed interface
        const booking = await bookingRepository_1.bookingRepository.findUnique(bookingId, {
            car: { include: { model: { include: { brand: true } } } },
            payment: true
        });
        if (!booking)
            throw new AppError_1.AppError('Booking not found', AppError_1.ErrorCode.NOT_FOUND);
        if (booking.status !== graphql_1.BookingStatus.VERIFIED) {
            throw new AppError_1.AppError(`Booking is not ready for payment. Status: ${booking.status}`, AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        // Explicit check for existing payment to avoid 'never' access
        if (booking.payment && booking.payment.status === graphql_1.PaymentStatus.SUCCEEDED) {
            throw new AppError_1.AppError('Payment already completed', AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        const amount = Math.max(0, Number(booking.totalPrice || 0));
        if (isMockStripe) {
            const sessionId = `mock_${booking.id}`;
            await paymentRepository_1.paymentRepository.upsertPayment(booking.id, {
                amount,
                status: graphql_1.PaymentStatus.PENDING,
                stripeId: sessionId
            });
            return {
                url: `${frontendUrl}/payment/mock?bookingId=${booking.id}`,
                sessionId,
            };
        }
        const stripe = this.getStripeClient();
        if (!stripe)
            throw new AppError_1.AppError('Stripe is not configured correctly', AppError_1.ErrorCode.INTERNAL_SERVER_ERROR);
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
            // Pass bookingId/userId into the created PaymentIntent so refunds can be correlated
            payment_intent_data: {
                metadata: { bookingId: booking.id, userId: booking.userId }
            },
            success_url: `${frontendUrl}/payment/success?bookingId=${booking.id}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${frontendUrl}/payment/cancel?bookingId=${booking.id}`,
            metadata: { bookingId: booking.id, userId: booking.userId },
        });
        await paymentRepository_1.paymentRepository.upsertPayment(booking.id, {
            amount,
            status: graphql_1.PaymentStatus.PENDING,
            stripeId: session.id
        });
        return { url: session.url || '', sessionId: session.id };
    }
    async finalizeMockPayment(bookingId, success) {
        const booking = await bookingRepository_1.bookingRepository.findUnique(bookingId, { payment: true });
        if (!booking)
            throw new AppError_1.AppError('Booking not found', AppError_1.ErrorCode.NOT_FOUND);
        const amount = Math.max(0, Number(booking.totalPrice || 0));
        const newStatus = success ? graphql_1.PaymentStatus.SUCCEEDED : graphql_1.PaymentStatus.FAILED;
        const payment = await paymentRepository_1.paymentRepository.upsertPayment(booking.id, {
            amount,
            status: newStatus,
            // Safely access stripeId using optional chaining and fallback
            stripeId: booking.payment?.stripeId || `mock_${booking.id}`,
        });
        if (success) {
            await bookingRepository_1.bookingRepository.update(booking.id, { status: graphql_1.BookingStatus.CONFIRMED });
        }
        return payment;
    }
    async processManualPayment(input) {
        const booking = await bookingRepository_1.bookingRepository.findUnique(input.bookingId, {});
        if (!booking)
            throw new AppError_1.AppError('Booking not found', AppError_1.ErrorCode.NOT_FOUND);
        const existingPayment = await paymentRepository_1.paymentRepository.findByBookingId(input.bookingId);
        if (existingPayment)
            throw new AppError_1.AppError('Payment already exists', AppError_1.ErrorCode.ALREADY_EXISTS);
        const payment = await paymentRepository_1.paymentRepository.create({
            ...input,
            status: input.status || graphql_1.PaymentStatus.SUCCEEDED,
        });
        if (payment.status === graphql_1.PaymentStatus.SUCCEEDED) {
            await bookingRepository_1.bookingRepository.update(input.bookingId, { status: graphql_1.BookingStatus.CONFIRMED });
        }
        return payment;
    }
    async refundPayment(paymentId) {
        const payment = await paymentRepository_1.paymentRepository.findById(paymentId);
        if (!payment)
            throw new AppError_1.AppError('Payment not found', AppError_1.ErrorCode.NOT_FOUND);
        const bookingId = payment.bookingId;
        if (isMockStripe) {
            await paymentRepository_1.paymentRepository.update(paymentId, { status: graphql_1.PaymentStatus.REFUNDED });
            await bookingRepository_1.bookingRepository.update(bookingId, { status: graphql_1.BookingStatus.CANCELLED });
            return await paymentRepository_1.paymentRepository.findById(paymentId);
        }
        const stripe = this.getStripeClient();
        if (!stripe)
            throw new AppError_1.AppError('Stripe is not configured correctly', AppError_1.ErrorCode.INTERNAL_SERVER_ERROR);
        if (!payment.stripeId)
            throw new AppError_1.AppError('No stripe identifier for payment', AppError_1.ErrorCode.BAD_USER_INPUT);
        // Attempt refund using payment_intent id saved in stripeId
        try {
            await stripe.refunds.create({ payment_intent: payment.stripeId });
            await paymentRepository_1.paymentRepository.update(paymentId, { status: graphql_1.PaymentStatus.REFUNDED });
            await bookingRepository_1.bookingRepository.update(bookingId, { status: graphql_1.BookingStatus.CANCELLED });
            return await paymentRepository_1.paymentRepository.findById(paymentId);
        }
        catch (err) {
            throw new AppError_1.AppError(`Stripe refund failed: ${err?.message || err}`, AppError_1.ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
    async getAllPayments() {
        return await paymentRepository_1.paymentRepository.findAll();
    }
    async getPaymentByBookingId(bookingId) {
        return await paymentRepository_1.paymentRepository.findByBookingId(bookingId);
    }
    async updatePaymentStatus(id, status) {
        // Business logic validation for payment status updates
        const validStatuses = [graphql_1.PaymentStatus.PENDING, graphql_1.PaymentStatus.SUCCEEDED, graphql_1.PaymentStatus.FAILED, graphql_1.PaymentStatus.REFUNDED];
        if (!validStatuses.includes(status)) {
            throw new AppError_1.AppError(`Invalid payment status: ${status}`, AppError_1.ErrorCode.BAD_USER_INPUT);
        }
        const existingPayment = await paymentRepository_1.paymentRepository.findById(id);
        if (!existingPayment) {
            throw new AppError_1.AppError('Payment not found', AppError_1.ErrorCode.NOT_FOUND);
        }
        return await paymentRepository_1.paymentRepository.update(id, { status });
    }
    async getBookingForAuth(bookingId) {
        // Minimal method for authorization checks - returns only userId
        const booking = await bookingRepository_1.bookingRepository.findUnique(bookingId, {});
        return booking ? { userId: booking.userId } : null;
    }
}
exports.PaymentService = PaymentService;
exports.paymentService = new PaymentService();
//# sourceMappingURL=paymentService.js.map