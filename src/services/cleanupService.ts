import prisma from '../utils/database';

class CleanupService {
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

      const { count } = await prisma.booking.deleteMany({
        where: {
          status: 'COMPLETED',
          updatedAt: {
            lt: cutoffDate
          }
        }
      });

      console.log(`Deleted ${count} old bookings.`);
      return { deletedCount: count };

    } catch (error) {
      console.error('❌ Error during old bookings cleanup:', error);
      throw new Error('Failed to cleanup old completed bookings');
    }
  }

  /**
   * Get statistics about cleanups
   */
  async getCleanupStats() {
    try {
      const oldCompletedBookings = await prisma.booking.count({
        where: {
          status: 'COMPLETED',
          updatedAt: {
            lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
          }
        }
      });

      return {
        oldCompletedBookings,
        totalPendingCleanup: oldCompletedBookings
      };
    } catch (error) {
      console.error('❌ Error getting cleanup stats:', error);
      throw new Error('Failed to get cleanup statistics');
    }
  }
}

// Export singleton instance
export const cleanupService = new CleanupService();
