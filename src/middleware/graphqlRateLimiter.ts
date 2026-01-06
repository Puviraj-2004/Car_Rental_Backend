import { AppError, ErrorCode } from '../errors/AppError';

// Simple in-memory rate limiting for GraphQL operations
// In production, consider using Redis for distributed rate limiting
class GraphQLRateLimiter {
  private attempts = new Map<string, { count: number; resetTime: number }>();

  constructor(
    private maxAttempts: number,
    private windowMs: number
  ) {}

  checkLimit(key: string): void {
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
      throw new AppError(
        `Too many requests. Try again in ${resetIn} seconds.`,
        ErrorCode.RATE_LIMIT_EXCEEDED
      );
    }

    this.attempts.set(key, record);
  }

  // Clean up old records periodically (basic cleanup)
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.attempts.entries()) {
      if (now > record.resetTime) {
        this.attempts.delete(key);
      }
    }
  }
}

// Create rate limiters for different GraphQL operations
export const authOperationLimiter = new GraphQLRateLimiter(5, 15 * 60 * 1000); // 5 per 15min
export const passwordResetLimiter = new GraphQLRateLimiter(3, 60 * 60 * 1000); // 3 per hour
export const registrationLimiter = new GraphQLRateLimiter(3, 60 * 60 * 1000); // 3 per hour
export const adminOperationLimiter = new GraphQLRateLimiter(50, 15 * 60 * 1000); // 50 per 15min

// Helper function to generate rate limit key
export function generateRateLimitKey(operation: string, userId?: string, ip?: string): string {
  const identifier = userId || ip || 'unknown';
  return `${operation}:${identifier}`;
}

// Periodic cleanup (run every 30 minutes)
setInterval(() => {
  authOperationLimiter.cleanup();
  passwordResetLimiter.cleanup();
  registrationLimiter.cleanup();
  adminOperationLimiter.cleanup();
}, 30 * 60 * 1000);
