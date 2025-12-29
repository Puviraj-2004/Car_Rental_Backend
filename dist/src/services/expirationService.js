"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expirationService = void 0;
const cron = __importStar(require("node-cron"));
const database_1 = __importDefault(require("../utils/database"));
class ExpirationService {
    isRunning = false;
    /**
     * Start the background expiration service
     * Runs every 10 minutes to cancel expired bookings
     */
    startExpirationService() {
        if (this.isRunning) {
            console.log('🕒 Expiration service is already running');
            return;
        }
        console.log('🕒 Starting booking expiration service...');
        // Run every 10 minutes
        cron.schedule('*/10 * * * *', async () => {
            try {
                await this.cancelExpiredBookings();
            }
            catch (error) {
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
    async cancelExpiredBookings() {
        try {
            const now = new Date();
            // Find expired bookings
            const expiredBookings = await database_1.default.booking.findMany({
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
                    await database_1.default.$transaction(async (tx) => {
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
                    console.log(`❌ Auto-cancelled expired booking ${booking.id} for user ${booking.user.email}`);
                }
                catch (error) {
                    console.error(`❌ Failed to cancel expired booking ${booking.id}:`, error);
                }
            }
        }
        catch (error) {
            console.error('❌ Error in cancelExpiredBookings:', error);
            throw error;
        }
    }
    /**
     * Manually trigger expiration check (for testing or admin use)
     */
    async triggerExpirationCheck() {
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
            const expiredAwaitingVerification = await database_1.default.booking.count({
                where: {
                    status: 'AWAITING_VERIFICATION',
                    expiresAt: { lt: now }
                }
            });
            const expiredAwaitingPayment = await database_1.default.booking.count({
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
        }
        catch (error) {
            console.error('❌ Error getting expiration stats:', error);
            throw new Error('Failed to get expiration statistics');
        }
    }
    /**
     * Check if a specific booking has expired
     */
    async isBookingExpired(bookingId) {
        try {
            const booking = await database_1.default.booking.findUnique({
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
        }
        catch (error) {
            console.error('❌ Error checking booking expiration:', error);
            return false;
        }
    }
}
// Export singleton instance
exports.expirationService = new ExpirationService();
//# sourceMappingURL=expirationService.js.map