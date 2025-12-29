declare class CleanupService {
    /**
     * Clean up expired verification tokens (but keep bookings)
     * This removes only expired verification tokens, preserving the bookings
     */
    cleanupExpiredVerifications(): Promise<{
        deletedCount: number;
    }>;
    /**
     * Clean up old completed bookings (optional - for database maintenance)
     * Removes completed bookings older than specified days
     */
    cleanupOldCompletedBookings(daysOld?: number): Promise<{
        deletedCount: number;
    }>;
    /**
     * Get statistics about expired and pending cleanups
     */
    getCleanupStats(): Promise<{
        expiredVerificationTokens: number;
        bookingsWithoutValidVerification: number;
        oldCompletedBookings: number;
        totalPendingCleanup: number;
    }>;
}
export declare const cleanupService: CleanupService;
export {};
//# sourceMappingURL=cleanupService.d.ts.map