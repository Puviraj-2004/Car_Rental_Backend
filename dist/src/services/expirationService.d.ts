declare class ExpirationService {
    /**
     * Starts the cron job to check for expired bookings every 1 minute.
     * Industrial Standard: High frequency check for precise inventory release.
     */
    startExpirationService(): void;
    private handleBookingExpirations;
    /**
     * Manually trigger logic (for testing)
     */
    triggerExpirationCheck(): Promise<boolean>;
}
export declare const expirationService: ExpirationService;
export {};
//# sourceMappingURL=expirationService.d.ts.map