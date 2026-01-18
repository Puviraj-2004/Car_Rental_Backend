"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.expirationService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const database_1 = __importDefault(require("../utils/database"));
const securityLogger_1 = require("../utils/securityLogger");
const client_1 = require("@prisma/client");
class ExpirationService {
    /**
     * Starts the cron job to check for expired bookings every 1 minute.
     * Industrial Standard: High frequency check for precise inventory release.
     */
    startExpirationService() {
        securityLogger_1.securityLogger.info('Expiration service started', { message: 'Monitoring booking lifecycle' });
        // Run every minute
        node_cron_1.default.schedule('*/1 * * * *', async () => {
            await this.handleBookingExpirations();
        });
    }
    async handleBookingExpirations() {
        const now = new Date();
        const oneHourMs = 60 * 60 * 1000;
        const fifteenMinMs = 15 * 60 * 1000;
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        try {
            const pendingBookings = await database_1.default.booking.findMany({
                where: { status: client_1.BookingStatus.PENDING },
                select: {
                    id: true,
                    createdAt: true,
                    updatedAt: true,
                    documentVerification: { select: { createdAt: true } }
                }
            });
            const toCancelPending = [];
            for (const b of pendingBookings) {
                const baseExpiry = new Date(b.createdAt.getTime() + oneHourMs);
                const dvStartedAt = b.documentVerification?.createdAt || null;
                const effectiveExpiry = dvStartedAt && dvStartedAt >= new Date(baseExpiry.getTime() - fifteenMinMs)
                    ? new Date(baseExpiry.getTime() + fifteenMinMs)
                    : baseExpiry;
                if (now > effectiveExpiry) {
                    toCancelPending.push(b.id);
                }
            }
            if (toCancelPending.length > 0) {
                securityLogger_1.securityLogger.warn('Auto-cancelling expired pending bookings', { count: toCancelPending.length, status: 'PENDING' });
                await database_1.default.booking.updateMany({
                    where: { id: { in: toCancelPending } },
                    data: { status: client_1.BookingStatus.CANCELLED, updatedAt: now }
                });
            }
            const unpaidVerified = await database_1.default.booking.findMany({
                where: { status: client_1.BookingStatus.VERIFIED },
                select: { id: true, updatedAt: true, payment: { select: { status: true } } }
            });
            const toCancelVerified = [];
            for (const b of unpaidVerified) {
                const hasSucceededPayment = b.payment?.status === 'SUCCEEDED';
                if (!hasSucceededPayment && b.updatedAt < new Date(now.getTime() - fifteenMinMs)) {
                    toCancelVerified.push(b.id);
                }
            }
            if (toCancelVerified.length > 0) {
                securityLogger_1.securityLogger.warn('Releasing inventory for unpaid verified bookings', { count: toCancelVerified.length, status: 'VERIFIED' });
                await database_1.default.booking.updateMany({
                    where: { id: { in: toCancelVerified } },
                    data: { status: client_1.BookingStatus.CANCELLED, updatedAt: now }
                });
            }
            await database_1.default.booking.deleteMany({
                where: {
                    status: 'DRAFT',
                    createdAt: { lt: twentyFourHoursAgo }
                }
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            securityLogger_1.securityLogger.error('Expiration service error', { error: errorMessage, operation: 'expirationCheck' });
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