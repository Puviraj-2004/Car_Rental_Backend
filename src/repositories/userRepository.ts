import prisma from '../utils/database';
import { VerificationStatus } from '@prisma/client';
import { BookingStatus } from '../types/graphql';

const USER_INCLUDE = { verification: true, bookings: true };

export class UserRepository {
  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      include: USER_INCLUDE
    });
  }

  async findById(id: string, includeAll: boolean = false) {
    return await prisma.user.findUnique({
      where: { id },
      include: includeAll ? USER_INCLUDE : { verification: true }
    });
  }

  async findAll() {
    return await prisma.user.findMany({
      include: USER_INCLUDE
    });
  }

  async createUser(data: {
    email: string;
    password: string;
    fullName: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
  }) {
    return await prisma.user.create({
      data,
      include: USER_INCLUDE
    });
  }

  async updateUser(id: string, data: {
    email?: string;
    password?: string;
    fullName?: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
    fullAddress?: string;
  }) {
    return await prisma.user.update({
      where: { id },
      data,
      include: USER_INCLUDE
    });
  }

  async deleteUser(id: string) {
    return await prisma.user.delete({ where: { id } });
  }

  async findVerificationByUserId(userId: string) {
    return await prisma.documentVerification.findUnique({ where: { userId } });
  }

  async upsertVerification(userId: string, data: {
    licenseFrontUrl?: string;
    licenseBackUrl?: string;
    idCardUrl?: string;
    addressProofUrl?: string;
    licenseNumber?: string;
    licenseExpiry?: Date;
    licenseCategory?: any;
    idNumber?: string;
    idExpiry?: Date;
    status?: VerificationStatus;
  }) {
    return await prisma.documentVerification.upsert({
      where: { userId },
      update: data,
      create: {
        user: { connect: { id: userId } },
        ...data
      }
    });
  }

  async updateVerification(userId: string, data: {
    documentType?: string;
    side?: string;
    status?: VerificationStatus;
    url?: string;
  }) {
    return await prisma.documentVerification.update({
      where: { userId },
      data
    });
  }

  async findBookingVerificationByToken(token: string) {
    return await prisma.bookingVerification.findUnique({ where: { token } });
  }

  async updateBookingStatus(id: string, status: BookingStatus) {
    return await prisma.booking.update({
      where: { id },
      data: { status, updatedAt: new Date() }
    });
  }

  async updateManyBookingsStatus(userId: string, currentStatus: BookingStatus, nextStatus: BookingStatus) {
    return await prisma.booking.updateMany({
      where: { userId, status: currentStatus },
      data: { status: nextStatus, updatedAt: new Date() }
    });
  }

  async countActiveBookings(userId: string): Promise<number> {
    return await prisma.booking.count({
      where: {
        userId,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.VERIFIED, BookingStatus.CONFIRMED, BookingStatus.ONGOING]
        }
      }
    });
  }
}

export const userRepository = new UserRepository();