import prisma from '../utils/database';

// System user ID for automated operations (should be a dedicated system user in production)
const SYSTEM_USER_ID = 'system-cleanup';

class CleanupService {
  /**
   * Clean up expired verification tokens (but keep bookings)
   * This removes only expired verification tokens, preserving the bookings
   */
  async cleanupExpiredVerifications(): Promise<{ deletedCount: number }> {
    try {
      console.log('🧹 Starting cleanup of expired verification tokens...');

      // Find all expired verification tokens
      const expiredVerifications = await prisma.bookingVerification.findMany({
        where: {
          expiresAt: {
            lt: new Date() // Expired tokens
          }
        },
        include: {
          booking: {
            select: { id: true, status: true }
          }
        }
      });

      if (expiredVerifications.length === 0) {
        console.log('✅ No expired verification tokens found');
        return { deletedCount: 0 };
      }

      console.log(`🔍 Found ${expiredVerifications.length} expired verification tokens`);

      // Delete expired verification tokens only (keep bookings)
      const verificationIds = expiredVerifications.map(v => v.id);

      await prisma.bookingVerification.deleteMany({
        where: {
          id: { in: verificationIds }
        }
      });

      // Log the cleanup action
      await prisma.auditLog.create({
        data: {
          userId: SYSTEM_USER_ID,
          action: 'EXPIRED_VERIFICATION_TOKEN_CLEANUP',
          details: {
            deletedVerifications: verificationIds.length,
            verificationIds: verificationIds,
            note: 'Only tokens deleted, bookings preserved'
          }
        }
      });

      console.log(`🗑️ Successfully deleted ${expiredVerifications.length} expired verification tokens (bookings preserved)`);

      return { deletedCount: expiredVerifications.length };

    } catch (error) {
      console.error('❌ Error during expired verification cleanup:', error);
      throw new Error('Failed to cleanup expired verification tokens');
    }
  }

  /**
   * Clean up old completed bookings (optional - for database maintenance)
   * Removes completed bookings older than specified days
   */
  async cleanupOldCompletedBookings(daysOld: number = 90): Promise<{ deletedCount: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const oldBookings = await prisma.booking.findMany({
        where: {
          status: 'COMPLETED',
          updatedAt: {
            lt: cutoffDate
          }
        }
      });

      if (oldBookings.length === 0) {
        return { deletedCount: 0 };
      }

      await prisma.booking.deleteMany({
        where: {
          status: 'COMPLETED',
          updatedAt: {
            lt: cutoffDate
          }
        }
      });

      await prisma.auditLog.create({
        data: {
          userId: SYSTEM_USER_ID,
          action: 'OLD_COMPLETED_BOOKINGS_CLEANUP',
          details: {
            deletedCount: oldBookings.length,
            daysOld,
            cutoffDate: cutoffDate.toISOString()
          }
        }
      });

      return { deletedCount: oldBookings.length };

    } catch (error) {
      console.error('❌ Error during old bookings cleanup:', error);
      throw new Error('Failed to cleanup old completed bookings');
    }
  }

  /**
   * Get statistics about expired and pending cleanups
   */
  async getCleanupStats() {
    try {
      const expiredVerificationTokens = await prisma.bookingVerification.count({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });

      const bookingsWithoutValidVerification = await prisma.booking.count({
        where: {
          status: 'AWAITING_VERIFICATION',
          verification: null // No verification token at all
        }
      });

      const oldCompletedBookings = await prisma.booking.count({
        where: {
          status: 'COMPLETED',
          updatedAt: {
            lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
          }
        }
      });

      return {
        expiredVerificationTokens,
        bookingsWithoutValidVerification,
        oldCompletedBookings,
        totalPendingCleanup: expiredVerificationTokens + oldCompletedBookings
      };
    } catch (error) {
      console.error('❌ Error getting cleanup stats:', error);
      throw new Error('Failed to get cleanup statistics');
    }
  }
}

// Export singleton instance
export const cleanupService = new CleanupService();
