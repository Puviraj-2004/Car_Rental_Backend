import { isAdmin } from '../../utils/authguard';
import { platformService } from '../../services/platformService';
import { cleanupService } from '../../services/cleanupService';

export const platformResolvers = {
  Query: {
    platformSettings: async () => {
      return await platformService.getPlatformSettings();
    },

    auditLogs: async (_: any, __: any, context: any) => {
      isAdmin(context);
      return [];
    }
  },

  Mutation: {
    updatePlatformSettings: async (_: any, { input }: { input: any }, context: any) => {
      isAdmin(context);
      return await platformService.updatePlatformSettings(input);
    },

    cleanupExpiredVerifications: async (_: any, __: any, context: any) => {
      isAdmin(context); // Maintaining security standard
      return {
        success: true,
        message: `Feature disabled`,
        deletedCount: 0
      };
    },

    cleanupOldCompletedBookings: async (_: any, { daysOld }: { daysOld?: number }, context: any) => {
      isAdmin(context);
      const days = daysOld || 90;
      const deletedCount = await platformService.runOldBookingsCleanup(days);

      return {
        success: true,
        message: `Cleaned up ${deletedCount} old completed bookings (older than ${days} days)`,
        deletedCount
      };
    },

    getCleanupStats: async (_: any, __: any, context: any) => {
      isAdmin(context);
      return await cleanupService.getCleanupStats();
    },

    triggerExpirationCheck: async (_: any, __: any, context: any) => {
      isAdmin(context);
      const result = await platformService.triggerManualExpiration();

      return {
        success: true,
        message: `Expiration check completed`,
        details: result
      };
    },

    getExpirationStats: async (_: any, __: any, context: any) => {
      isAdmin(context);
      return { 
        expiredAwaitingVerification: 0, 
        expiredAwaitingPayment: 0, 
        totalExpired: 0, 
        nextCheckIn: "Disabled" 
      };
    }
  }
};