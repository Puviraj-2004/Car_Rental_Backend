"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformResolvers = void 0;
const authguard_1 = require("../../utils/authguard");
const platformService_1 = require("../../services/platformService");
const cleanupService_1 = require("../../services/cleanupService");
exports.platformResolvers = {
    Query: {
        platformSettings: async () => {
            return await platformService_1.platformService.getPlatformSettings();
        },
        auditLogs: async (_, __, context) => {
            (0, authguard_1.isAdmin)(context);
            return [];
        }
    },
    Mutation: {
        updatePlatformSettings: async (_, { input }, context) => {
            (0, authguard_1.isAdmin)(context);
            return await platformService_1.platformService.updatePlatformSettings(input);
        },
        cleanupExpiredVerifications: async (_, __, context) => {
            (0, authguard_1.isAdmin)(context); // Maintaining security standard
            return {
                success: true,
                message: `Feature disabled`,
                deletedCount: 0
            };
        },
        cleanupOldCompletedBookings: async (_, { daysOld }, context) => {
            (0, authguard_1.isAdmin)(context);
            const days = daysOld || 90;
            const deletedCount = await platformService_1.platformService.runOldBookingsCleanup(days);
            return {
                success: true,
                message: `Cleaned up ${deletedCount} old completed bookings (older than ${days} days)`,
                deletedCount
            };
        },
        getCleanupStats: async (_, __, context) => {
            (0, authguard_1.isAdmin)(context);
            return await cleanupService_1.cleanupService.getCleanupStats();
        },
        triggerExpirationCheck: async (_, __, context) => {
            (0, authguard_1.isAdmin)(context);
            const result = await platformService_1.platformService.triggerManualExpiration();
            return {
                success: true,
                message: `Expiration check completed`,
                details: result
            };
        },
        getExpirationStats: async (_, __, context) => {
            (0, authguard_1.isAdmin)(context);
            return {
                expiredAwaitingVerification: 0,
                expiredAwaitingPayment: 0,
                totalExpired: 0,
                nextCheckIn: "Disabled"
            };
        }
    }
};
//# sourceMappingURL=platformResolvers.js.map