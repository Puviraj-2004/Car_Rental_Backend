declare class ExpirationService {
    private isRunning;
    /**
     * Start the background expiration service
     * Runs every 10 minutes to cancel expired bookings
     */
    startExpirationService(): void;
    /**
     * Cancel all bookings that have expired
     * Bookings in AWAITING_VERIFICATION or AWAITING_PAYMENT status
     * that have passed their expiresAt time
     */
    private cancelExpiredBookings;
    /**
     * Manually trigger expiration check (for testing or admin use)
     */
    triggerExpirationCheck(): Promise<{
        cancelledCount: number;
    }>;
    /**
     * Get statistics about expired bookings
     */
    getExpirationStats(): Promise<{
        expiredAwaitingVerification: number;
        expiredAwaitingPayment: number;
        totalExpired: number;
        nextCheckIn: string;
    }>;
    /**
     * Check if a specific booking has expired
     */
    isBookingExpired(bookingId: string): Promise<boolean>;
}
export declare const expirationService: ExpirationService;
export {};
//# sourceMappingURL=expirationService.d.ts.map