"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupService = void 0;
const database_1 = __importDefault(require("../utils/database"));
// System user ID for automated operations (should be a dedicated system user in production)
const SYSTEM_USER_ID = 'system-cleanup';
class CleanupService {
    /**
     * Clean up expired verification tokens (but keep bookings)
     * This removes only expired verification tokens, preserving the bookings
     */
    async cleanupExpiredVerifications() {
        try {
            console.log('🧹 Starting cleanup of expired verification tokens...');
            // Find all expired verification tokens
            const expiredVerifications = await database_1.default.bookingVerification.findMany({
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
            await database_1.default.bookingVerification.deleteMany({
                where: {
                    id: { in: verificationIds }
                }
            });
            // Log the cleanup action
            await database_1.default.auditLog.create({
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
        }
        catch (error) {
            console.error('❌ Error during expired verification cleanup:', error);
            throw new Error('Failed to cleanup expired verification tokens');
        }
    }
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
            await database_1.default.booking.deleteMany({
                where: {
                    status: 'COMPLETED',
                    updatedAt: {
                        lt: cutoffDate
                    }
                }
            });
            await database_1.default.auditLog.create({
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
        }
        catch (error) {
            console.error('❌ Error during old bookings cleanup:', error);
            throw new Error('Failed to cleanup old completed bookings');
        }
    }
    /**
     * Get statistics about expired and pending cleanups
     */
    async getCleanupStats() {
        try {
            const expiredVerificationTokens = await database_1.default.bookingVerification.count({
                where: {
                    expiresAt: {
                        lt: new Date()
                    }
                }
            });
            const bookingsWithoutValidVerification = await database_1.default.booking.count({
                where: {
                    status: 'AWAITING_VERIFICATION',
                    verification: null // No verification token at all
                }
            });
            const oldCompletedBookings = await database_1.default.booking.count({
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