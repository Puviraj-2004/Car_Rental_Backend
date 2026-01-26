import prisma from '../utils/database';
import { securityLogger } from '../utils/securityLogger';
import { BookingStatus } from '@prisma/client';

class CleanupService {
  /**
   * Clean up old completed/cancelled/rejected/expired bookings (optional - for database maintenance)
   * Removes these bookings older than specified days
   */
  async cleanupOldCompletedBookings(daysOld: number = 90): Promise<{ deletedCount: number }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const cleanableStatuses = [
        BookingStatus.COMPLETED,
        BookingStatus.CANCELLED,
        BookingStatus.REJECTED,
        BookingStatus.EXPIRED
      ];

      const oldBookings = await prisma.booking.findMany({
        where: {
          status: { in: cleanableStatuses },
          updatedAt: {
            lt: cutoffDate
          }
        }
      });

      if (oldBookings.length === 0) {
        return { deletedCount: 0 };
      }

      const { count } = await prisma.booking.deleteMany({
        where: {
          status: { in: cleanableStatuses },
          updatedAt: {
            lt: cutoffDate
          }
        }
      });

      securityLogger.info('Cleanup completed', { deletedBookings: count });
      return { deletedCount: count };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      securityLogger.error('Cleanup operation failed', { error: errorMessage, operation: 'oldBookingsCleanup' });
      throw new Error('Failed to cleanup old completed bookings');
    }
  }

  /**
   * Get statistics about cleanups
   */
  async getCleanupStats() {
    try {
      const cleanableStatuses = [
        BookingStatus.COMPLETED,
        BookingStatus.CANCELLED,
        BookingStatus.REJECTED,
        BookingStatus.EXPIRED
      ];

      const oldBookingsCount = await prisma.booking.count({
        where: {
          status: { in: cleanableStatuses },
          updatedAt: {
            lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
          }
        }
      });

      return {
        oldCompletedBookings: oldBookingsCount,
        totalPendingCleanup: oldBookingsCount
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      securityLogger.error('Failed to get cleanup stats', { error: errorMessage, operation: 'getCleanupStats' });
      throw new Error('Failed to get cleanup statistics');
    }
  }
}

// Export singleton instance
export const cleanupService = new CleanupService();
