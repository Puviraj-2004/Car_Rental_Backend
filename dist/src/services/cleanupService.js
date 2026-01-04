"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupService = void 0;
const database_1 = __importDefault(require("../utils/database"));
class CleanupService {
    /**
     * Clean up old completed bookings (optional - for database maintenance)
     * Removes completed bookings older than specified days
     */
    async cleanupOldCompletedBookings(daysOld = 90) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysOld);
            const oldBookings = await database_1.default.booking.findMany({
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
            const { count } = await database_1.default.booking.deleteMany({
                where: {
                    status: 'COMPLETED',
                    updatedAt: {
                        lt: cutoffDate
                    }
                }
            });
            console.log(`Deleted ${count} old bookings.`);
            return { deletedCount: count };
        }
        catch (error) {
            console.error('❌ Error during old bookings cleanup:', error);
            throw new Error('Failed to cleanup old completed bookings');
        }
    }
    /**
     * Get statistics about cleanups
     */
    async getCleanupStats() {
        try {
            const oldCompletedBookings = await database_1.default.booking.count({
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
        }
        catch (error) {
            console.error('❌ Error getting cleanup stats:', error);
            throw new Error('Failed to get cleanup statistics');
        }
    }
}
// Export singleton instance
exports.cleanupService = new CleanupService();
//# sourceMappingURL=cleanupService.js.map