import prisma from '../utils/database';
import { PaymentStatus } from '../types/graphql';

export class PaymentRepository {
  async findAll() {
    return await prisma.payment.findMany({
      include: { booking: true }
    });
  }

  async findByBookingId(bookingId: string) {
    return await prisma.payment.findUnique({
      where: { bookingId },
      include: { booking: true }
    });
  }

  async findById(id: string) {
    return await prisma.payment.findUnique({
      where: { id },
      include: { booking: true }
    });
  }

  async upsertPayment(bookingId: string, data: { amount: number; status: PaymentStatus; stripeId: string }) {
    return await prisma.payment.upsert({
      where: { bookingId },
      update: data,
      create: {
        bookingId,
        ...data
      },
      include: { booking: true }
    });
  }

  async create(data: { bookingId: string; amount: number; status: PaymentStatus; stripeId?: string }) {
    return await prisma.payment.create({
      data,
      include: { booking: true }
    });
  }

  async update(id: string, data: { amount?: number; status?: PaymentStatus; stripeId?: string }) {
    return await prisma.payment.update({
      where: { id },
      data,
      include: { booking: true }
    });
  }
}

export const paymentRepository = new PaymentRepository();