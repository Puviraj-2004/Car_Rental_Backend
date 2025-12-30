import * as cron from 'node-cron';
import prisma from '../utils/database';

// Cleanup orphaned verification documents from Cloudinary
const cleanupVerificationDocuments = async (userId: string) => {
  try {
    const driverProfile = await prisma.driverProfile.findUnique({
      where: { userId },
      select: {
        licenseFrontPublicId: true,
        licenseBackPublicId: true,
        idProofPublicId: true,
        addressProofPublicId: true
      }
    });

    if (driverProfile) {
      // Note: Images are kept in Cloudinary for admin review
      // If deletion is needed in the future, uncomment and implement:
      // const publicIds = [
      //   driverProfile.licenseFrontPublicId,
      //   driverProfile.licenseBackPublicId,
      //   driverProfile.idProofPublicId,
      //   driverProfile.addressProofPublicId
      // ].filter(Boolean);
      // for (const publicId of publicIds) {
      //   if (publicId) await deleteFromCloudinary(publicId);
      // }

      // Clear URLs from driver profile
      await prisma.driverProfile.update({
        where: { userId },
        data: {
          licenseFrontUrl: null,
          licenseFrontPublicId: null,
          licenseBackUrl: null,
          licenseBackPublicId: null,
          idProofUrl: null,
          idProofPublicId: null,
          addressProofUrl: null,
          addressProofPublicId: null,
          status: 'NOT_UPLOADED'
        }
      });

      console.log(`🧹 Cleaned up verification documents for user ${userId}`);
    }
  } catch (error) {
    console.error('Error cleaning up verification documents:', error);
  }
};

class ExpirationService {
  private isRunning: boolean = false;

  /**
   * Start the background expiration service
   * Runs every 10 minutes to cancel expired bookings
   */
  startExpirationService(): void {
    if (this.isRunning) {
      console.log('🕒 Expiration service is already running');
      return;
    }

    console.log('🕒 Starting booking expiration service...');

    // Run every 10 minutes
    cron.schedule('*/10 * * * *', async () => {
      try {
        await this.cancelExpiredBookings();
      } catch (error) {
        console.error('❌ Error in expiration service:', error);
      }
    });

    this.isRunning = true;
    console.log('✅ Booking expiration service started - runs every 10 minutes');
  }

  /**
   * Cancel all bookings that have expired
   * Bookings in AWAITING_VERIFICATION or AWAITING_PAYMENT status
   * that have passed their expiresAt time
   */
  private async cancelExpiredBookings(): Promise<void> {
    try {
      const now = new Date();

      // Find expired bookings
      const expiredBookings = await prisma.booking.findMany({
        where: {
          OR: [
            { status: 'AWAITING_VERIFICATION' },
            { status: 'AWAITING_PAYMENT' }
          ],
          expiresAt: {
            lt: now
          }
        },
        include: {
          car: {
            select: { id: true, brand: { select: { name: true } }, model: { select: { name: true } } }
          },
          user: {
            select: { id: true, email: true, username: true }
          }
        }
      });

      if (expiredBookings.length === 0) {
        return; // No expired bookings
      }

      console.log(`⏰ Found ${expiredBookings.length} expired bookings to cancel`);

      // Cancel each booking in a transaction
      for (const booking of expiredBookings) {
        // Temporary UTC logging for verification
        console.log(`⏰ UTC Check: Current time: ${now.toISOString()} | Booking ${booking.id} expires at: ${booking.expiresAt?.toISOString()}`);

        try {
          await prisma.$transaction(async (tx) => {
            // Update booking status to CANCELLED
            await tx.booking.update({
              where: { id: booking.id },
              data: {
                status: 'CANCELLED',
                updatedAt: now
              }
            });

            // Delete any associated verification token
            if (booking.status === 'AWAITING_VERIFICATION') {
              await tx.bookingVerification.deleteMany({
                where: { bookingId: booking.id }
              });

              // Note: cleanupVerificationDocuments will be called after the transaction
            }

            // Log the cancellation
            await tx.auditLog.create({
              data: {
                userId: booking.userId,
                action: 'AUTO_BOOKING_EXPIRATION',
                details: {
                  bookingId: booking.id,
                  previousStatus: booking.status,
                  carInfo: `${booking.car.brand.name} ${booking.car.model.name}`,
                  expiredAt: booking.expiresAt,
                  cancelledAt: now
                }
              }
            });
          });

          // Cleanup orphaned verification documents
          if (booking.status === 'AWAITING_VERIFICATION') {
            await cleanupVerificationDocuments(booking.userId);
          }

          console.log(`❌ Auto-cancelled expired booking ${booking.id} for user ${booking.user.email}`);

        } catch (error) {
          console.error(`❌ Failed to cancel expired booking ${booking.id}:`, error);
        }
      }

    } catch (error) {
      console.error('❌ Error in cancelExpiredBookings:', error);
      throw error;
    }
  }

  /**
   * Manually trigger expiration check (for testing or admin use)
   */
  async triggerExpirationCheck(): Promise<{ cancelledCount: number }> {
    console.log('🔧 Manually triggering expiration check...');
    await this.cancelExpiredBookings();
    return { cancelledCount: 0 }; // This could be improved to return actual count
  }

  /**
   * Get statistics about expired bookings
   */
  async getExpirationStats() {
    try {
      const now = new Date();

      const expiredAwaitingVerification = await prisma.booking.count({
        where: {
          status: 'AWAITING_VERIFICATION',
          expiresAt: { lt: now }
        }
      });

      const expiredAwaitingPayment = await prisma.booking.count({
        where: {
          status: 'AWAITING_PAYMENT',
          expiresAt: { lt: now }
        }
      });

      const totalExpired = expiredAwaitingVerification + expiredAwaitingPayment;

      return {
        expiredAwaitingVerification,
        expiredAwaitingPayment,
        totalExpired,
        nextCheckIn: '10 minutes' // Since cron runs every 10 minutes
      };
    } catch (error) {
      console.error('❌ Error getting expiration stats:', error);
      throw new Error('Failed to get expiration statistics');
    }
  }

  /**
   * Check if a specific booking has expired
   */
  async isBookingExpired(bookingId: string): Promise<boolean> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: {
          status: true,
          expiresAt: true
        }
      });

      if (!booking || !booking.expiresAt) {
        return false;
      }

      // Check if booking is in expirable status and has expired
      const expirableStatuses = ['AWAITING_VERIFICATION', 'AWAITING_PAYMENT'];
      if (!expirableStatuses.includes(booking.status)) {
        return false;
      }

      return new Date() > booking.expiresAt;
    } catch (error) {
      console.error('❌ Error checking booking expiration:', error);
      return false;
    }
  }
}

// Export singleton instance
export const expirationService = new ExpirationService();
