#!/usr/bin/env ts-node
/**
 * Rate Limiting Test Script
 *
 * Tests the brute force protection and rate limiting functionality
 * Run with: npm run test:rate-limiting
 */
declare class RateLimitingTester {
    private results;
    private log;
    private makeGraphQLRequest;
    testAPIRateLimiting(): Promise<void>;
    testAuthRateLimiting(): Promise<void>;
    testSecurityHeaders(): Promise<void>;
    testCSRFProtection(): Promise<void>;
    runAllTests(): Promise<void>;
}
export default RateLimitingTester;
//# sourceMappingURL=testRateLimiting.d.ts.map