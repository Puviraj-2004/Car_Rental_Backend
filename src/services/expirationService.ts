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
    // Time thresholds
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const fifteenMinsAgo = new Date(now.getTime() - 15 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    try {
      // ---------------------------------------------------------
      // SCENARIO 1: Verification Timeout (Activity Based)
      // ---------------------------------------------------------
      // Rule: Booking is PENDING (waiting for docs).
      // Condition: Created > 1 hour ago AND User hasn't uploaded anything for 15 mins.
      const stalePendingBookings = await prisma.booking.findMany({
        where: {
          status: BookingStatus.PENDING,
          createdAt: { lt: oneHourAgo },
          updatedAt: { lt: fifteenMinsAgo } 
        },
        select: { id: true }
      });

      if (stalePendingBookings.length > 0) {
        securityLogger.warn('Auto-cancelling stale bookings', { count: stalePendingBookings.length, status: 'PENDING' });
        await prisma.booking.updateMany({
          where: { id: { in: stalePendingBookings.map(b => b.id) } },
          data: { status: BookingStatus.CANCELLED, updatedAt: now }
        });
      }

      // ---------------------------------------------------------
      // SCENARIO 2: Payment Timeout (15 Minute Window)
      // ---------------------------------------------------------
      // Rule: AI Verified the docs (Status: VERIFIED).
      // Condition: User hasn't paid within 15 minutes of verification.
      const unpaidVerifiedBookings = await prisma.booking.findMany({
        where: {
          status: BookingStatus.VERIFIED,
          payment: null, // No payment record exists
          updatedAt: { lt: fifteenMinsAgo }
        },
        select: { id: true }
      });

      if (unpaidVerifiedBookings.length > 0) {
        securityLogger.warn('Releasing inventory for unpaid bookings', { count: unpaidVerifiedBookings.length, status: 'VERIFIED' });
        await prisma.booking.updateMany({
          where: { id: { in: unpaidVerifiedBookings.map(b => b.id) } },
          data: { status: BookingStatus.CANCELLED, updatedAt: now }
        });
      }

      // ---------------------------------------------------------
      // SCENARIO 3: Draft Cleanup
      // ---------------------------------------------------------
      // Remove Drafts older than 24 hours to keep DB clean
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