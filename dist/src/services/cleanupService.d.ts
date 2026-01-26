declare class CleanupService {
    /**
     * Clean up old completed/cancelled/rejected/expired bookings (optional - for database maintenance)
     * Removes these bookings older than specified days
     */
    cleanupOldCompletedBookings(daysOld?: number): Promise<{
        deletedCount: number;
    }>;
    /**
     * Get statistics about cleanups
     */
    getCleanupStats(): Promise<{
        oldCompletedBookings: number;
        totalPendingCleanup: number;
    }>;
}
export declare const cleanupService: CleanupService;
export {};
//# sourceMappingURL=cleanupService.d.ts.map