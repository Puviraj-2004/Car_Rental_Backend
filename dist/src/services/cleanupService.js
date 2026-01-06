"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupService = void 0;
const database_1 = __importDefault(require("../utils/database"));
const securityLogger_1 = require("../utils/securityLogger");
const client_1 = require("@prisma/client");
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
                    status: client_1.BookingStatus.COMPLETED,
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
                    status: client_1.BookingStatus.COMPLETED,
                    updatedAt: {
                        lt: cutoffDate
                    }
                }
            });
            securityLogger_1.securityLogger.info('Cleanup completed', { deletedBookings: count });
            return { deletedCount: count };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            securityLogger_1.securityLogger.error('Cleanup operation failed', { error: errorMessage, operation: 'oldBookingsCleanup' });
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
                    status: client_1.BookingStatus.COMPLETED,
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
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            securityLogger_1.securityLogger.error('Failed to get cleanup stats', { error: errorMessage, operation: 'getCleanupStats' });
            throw new Error('Failed to get cleanup statistics');
        }
    }
}
// Export singleton instance
exports.cleanupService = new CleanupService();
//# sourceMappingURL=cleanupService.js.map