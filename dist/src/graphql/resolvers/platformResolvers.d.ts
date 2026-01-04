export declare const platformResolvers: {
    Query: {
        platformSettings: () => Promise<{
            id: string;
            address: string | null;
            updatedAt: Date;
            companyName: string;
            supportEmail: string | null;
            supportPhone: string | null;
            taxPercentage: number;
            currency: string;
            youngDriverMinAge: number;
            youngDriverFee: number;
        }>;
        auditLogs: (_: any, { limit: _limit, offset: _offset }: {
            limit?: number;
            offset?: number;
        }, context: any) => Promise<never[]>;
    };
    Mutation: {
        updatePlatformSettings: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<{
            id: string;
            address: string | null;
            updatedAt: Date;
            companyName: string;
            supportEmail: string | null;
            supportPhone: string | null;
            taxPercentage: number;
            currency: string;
            youngDriverMinAge: number;
            youngDriverFee: number;
        }>;
        cleanupExpiredVerifications: (_: any, __: any, _context: any) => Promise<{
            success: boolean;
            message: string;
            deletedCount: number;
        }>;
        cleanupOldCompletedBookings: (_: any, { daysOld }: {
            daysOld?: number;
        }, context: any) => Promise<{
            success: boolean;
            message: string;
            deletedCount: number;
        }>;
        getCleanupStats: (_: any, __: any, _context: any) => Promise<{
            oldCompletedBookings: number;
            totalPendingCleanup: number;
        }>;
        triggerExpirationCheck: (_: any, __: any, context: any) => Promise<{
            success: boolean;
            message: string;
            details: boolean;
        }>;
        getExpirationStats: (_: any, __: any, _context: any) => Promise<{
            expiredAwaitingVerification: number;
            expiredAwaitingPayment: number;
            totalExpired: number;
            nextCheckIn: string;
        }>;
    };
};
//# sourceMappingURL=platformResolvers.d.ts.map