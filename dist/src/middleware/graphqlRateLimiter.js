"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOperationLimiter = exports.registrationLimiter = exports.passwordResetLimiter = exports.authOperationLimiter = void 0;
exports.generateRateLimitKey = generateRateLimitKey;
const AppError_1 = require("../errors/AppError");
// Simple in-memory rate limiting for GraphQL operations
// In production, consider using Redis for distributed rate limiting
class GraphQLRateLimiter {
    maxAttempts;
    windowMs;
    attempts = new Map();
    constructor(maxAttempts, windowMs) {
        this.maxAttempts = maxAttempts;
        this.windowMs = windowMs;
    }
    checkLimit(key) {
        const now = Date.now();
        const record = this.attempts.get(key);
        // Reset if window has passed
        if (!record || now > record.resetTime) {
            this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
            return;
        }
        // Increment count
        record.count++;
        // Check if limit exceeded
        if (record.count > this.maxAttempts) {
            const resetIn = Math.ceil((record.resetTime - now) / 1000);
            throw new AppError_1.AppError(`Too many requests. Try again in ${resetIn} seconds.`, AppError_1.ErrorCode.RATE_LIMIT_EXCEEDED);
        }
        this.attempts.set(key, record);
    }
    // Clean up old records periodically (basic cleanup)
    cleanup() {
        const now = Date.now();
        for (const [key, record] of this.attempts.entries()) {
            if (now > record.resetTime) {
                this.attempts.delete(key);
            }
        }
    }
}
// Create rate limiters for different GraphQL operations
exports.authOperationLimiter = new GraphQLRateLimiter(5, 15 * 60 * 1000); // 5 per 15min
exports.passwordResetLimiter = new GraphQLRateLimiter(3, 60 * 60 * 1000); // 3 per hour
exports.registrationLimiter = new GraphQLRateLimiter(3, 60 * 60 * 1000); // 3 per hour
exports.adminOperationLimiter = new GraphQLRateLimiter(50, 15 * 60 * 1000); // 50 per 15min
// Helper function to generate rate limit key
function generateRateLimitKey(operation, userId, ip) {
    const identifier = userId || ip || 'unknown';
    return `${operation}:${identifier}`;
}
// Periodic cleanup (run every 30 minutes)
setInterval(() => {
    exports.authOperationLimiter.cleanup();
    exports.passwordResetLimiter.cleanup();
    exports.registrationLimiter.cleanup();
    exports.adminOperationLimiter.cleanup();
}, 30 * 60 * 1000);
//# sourceMappingURL=graphqlRateLimiter.js.map