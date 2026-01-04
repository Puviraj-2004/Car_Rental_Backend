"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expirationService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const database_1 = __importDefault(require("../utils/database"));
class ExpirationService {
    /**
     * Starts the cron job to check for expired bookings every 1 minute.
     * Industrial Standard: High frequency check for precise inventory release.
     */
    startExpirationService() {
        console.log('⏳ Expiration Service Started: Monitoring Booking Lifecycle...');
        // Run every minute
        node_cron_1.default.schedule('*/1 * * * *', async () => {
            await this.handleBookingExpirations();
        });
    }
    async handleBookingExpirations() {
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
            const stalePendingBookings = await database_1.default.booking.findMany({
                where: {
                    status: 'PENDING',
                    createdAt: { lt: oneHourAgo },
                    updatedAt: { lt: fifteenMinsAgo }
                },
                select: { id: true }
            });
            if (stalePendingBookings.length > 0) {
                console.log(`❌ Auto-cancelling ${stalePendingBookings.length} stale PENDING bookings...`);
                await database_1.default.booking.updateMany({
                    where: { id: { in: stalePendingBookings.map(b => b.id) } },
                    data: { status: 'CANCELLED', updatedAt: now }
                });
            }
            // ---------------------------------------------------------
            // SCENARIO 2: Payment Timeout (15 Minute Window)
            // ---------------------------------------------------------
            // Rule: AI Verified the docs (Status: VERIFIED).
            // Condition: User hasn't paid within 15 minutes of verification.
            const unpaidVerifiedBookings = await database_1.default.booking.findMany({
                where: {
                    status: 'VERIFIED',
                    payment: null, // No payment record exists
                    updatedAt: { lt: fifteenMinsAgo }
                },
                select: { id: true }
            });
            if (unpaidVerifiedBookings.length > 0) {
                console.log(`⚠️ Releasing inventory for ${unpaidVerifiedBookings.length} unpaid VERIFIED bookings...`);
                await database_1.default.booking.updateMany({
                    where: { id: { in: unpaidVerifiedBookings.map(b => b.id) } },
                    data: { status: 'CANCELLED', updatedAt: now }
                });
            }
            // ---------------------------------------------------------
            // SCENARIO 3: Draft Cleanup
            // ---------------------------------------------------------
            // Remove Drafts older than 24 hours to keep DB clean
            await database_1.default.booking.deleteMany({
                where: {
                    status: 'DRAFT',
                    createdAt: { lt: twentyFourHoursAgo }
                }
            });
        }
        catch (error) {
            console.error('❌ Error in Expiration Service:', error);
        }
    }
    /**
     * Manually trigger logic (for testing)
     */
    async triggerExpirationCheck() {
        await this.handleBookingExpirations();
        return true;
    }
}
exports.expirationService = new ExpirationService();
//# sourceMappingURL=expirationService.js.map