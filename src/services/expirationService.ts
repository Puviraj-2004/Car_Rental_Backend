import cron from 'node-cron';
import prisma from '../utils/database';
import { securityLogger } from '../utils/securityLogger';
import { BookingStatus } from '@prisma/client';

class ExpirationService {
  /**
   * Starts the cron job to check for expired bookings every 1 minute.
   * Industrial Standard: High frequency check for precise inventory release.
   */
  startExpirationService(): void {
    securityLogger.info('Expiration service started', { message: 'Monitoring booking lifecycle' });
    
    // Run every minute
    cron.schedule('*/1 * * * *', async () => {
      await this.handleBookingExpirations();
    });
  }

  private async handleBookingExpirations(): Promise<void> {
    const now = new Date();
    const oneHourMs = 60 * 60 * 1000;
    const fifteenMinMs = 15 * 60 * 1000;
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    try {
      const pendingBookings = await prisma.booking.findMany({
        where: { status: BookingStatus.PENDING },
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          documentVerification: { select: { createdAt: true } }
        }
      });

      const toCancelPending: string[] = [];
      for (const b of pendingBookings) {
        const baseExpiry = new Date(b.createdAt.getTime() + oneHourMs);
        const dvStartedAt = b.documentVerification?.createdAt || null;
        const effectiveExpiry = dvStartedAt && dvStartedAt >= new Date(baseExpiry.getTime() - fifteenMinMs)
          ? new Date(baseExpiry.getTime() + fifteenMinMs)
          : baseExpiry;

        if (now > effectiveExpiry) {
          toCancelPending.push(b.id);
        }
      }

      if (toCancelPending.length > 0) {
        securityLogger.warn('Auto-cancelling expired pending bookings', { count: toCancelPending.length, status: 'PENDING' });
        await prisma.booking.updateMany({
          where: { id: { in: toCancelPending } },
          data: { status: BookingStatus.CANCELLED, updatedAt: now }
        });
      }

      const unpaidVerified = await prisma.booking.findMany({
        where: { status: BookingStatus.VERIFIED },
        select: { id: true, updatedAt: true, payment: { select: { status: true } } }
      });

      const toCancelVerified: string[] = [];
      for (const b of unpaidVerified) {
        const hasSucceededPayment = b.payment?.status === 'SUCCEEDED';
        if (!hasSucceededPayment && b.updatedAt < new Date(now.getTime() - fifteenMinMs)) {
          toCancelVerified.push(b.id);
        }
      }

      if (toCancelVerified.length > 0) {
        securityLogger.warn('Releasing inventory for unpaid verified bookings', { count: toCancelVerified.length, status: 'VERIFIED' });
        await prisma.booking.updateMany({
          where: { id: { in: toCancelVerified } },
          data: { status: BookingStatus.CANCELLED, updatedAt: now }
        });
      }

      await prisma.booking.deleteMany({
        where: { 
          status: 'DRAFT', 
          createdAt: { lt: twentyFourHoursAgo } 
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      securityLogger.error('Expiration service error', { error: errorMessage, operation: 'expirationCheck' });
    }
  }

  /**
   * Manually trigger logic (for testing)
   */
  async triggerExpirationCheck(): Promise<boolean> {
    await this.handleBookingExpirations();
    return true;
  }
}

export const expirationService = new ExpirationService();