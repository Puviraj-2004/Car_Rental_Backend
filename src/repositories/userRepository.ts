import prisma from '../utils/database';
import { VerificationStatus , LicenseCategory } from '@prisma/client';
import { BookingStatus } from '../types/graphql';

const USER_INCLUDE = { bookings: true };

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
      include: includeAll ? USER_INCLUDE : { bookings: true }
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

  async findVerificationByBookingId(bookingId: string) {
    return await prisma.documentVerification.findUnique({ where: { bookingId } });
  }

  async upsertVerification(bookingId: string, data: {
    licenseFrontUrl?: string;
    licenseBackUrl?: string;
    idCardUrl?: string;
    idCardBackUrl?: string;
    addressProofUrl?: string;
    licenseNumber?: string;
    licenseExpiry?: Date;
    licenseIssueDate?: Date;
    driverDob?: Date;
    licenseCategories?: LicenseCategory[];
    idNumber?: string;
    idExpiry?: Date;
    verifiedAddress?: string;
    status?: VerificationStatus;
  }) {
    return await prisma.documentVerification.upsert({
      where: { bookingId },
      update: data,
      create: {
        booking: { connect: { id: bookingId } },
        ...data
      },
      include: {
        booking: {
          include: {
            user: true  // Include user data for frontend
          }
        }
      }
    });
  }

  async updateVerification(bookingId: string, data: {
    documentType?: string;
    side?: string;
    status?: VerificationStatus;
    url?: string;
  }) {
    return await prisma.documentVerification.update({
      where: { bookingId },
      data
    });
  }

  async findBookingVerificationByToken(token: string) {
    return await prisma.bookingVerification.findUnique({ where: { token } });
  }


  async updateBookingVerification(id: string, data: {
    isVerified?: boolean;
    verifiedAt?: Date;
  }) {
    return await prisma.bookingVerification.update({
      where: { id },
      data
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