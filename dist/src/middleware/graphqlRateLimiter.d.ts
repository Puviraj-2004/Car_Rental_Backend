declare class GraphQLRateLimiter {
    private maxAttempts;
    private windowMs;
    private attempts;
    constructor(maxAttempts: number, windowMs: number);
    checkLimit(key: string): void;
    cleanup(): void;
}
export declare const authOperationLimiter: GraphQLRateLimiter;
export declare const passwordResetLimiter: GraphQLRateLimiter;
export declare const registrationLimiter: GraphQLRateLimiter;
export declare const adminOperationLimiter: GraphQLRateLimiter;
export declare function generateRateLimitKey(operation: string, userId?: string, ip?: string): string;
export {};
//# sourceMappingURL=graphqlRateLimiter.d.ts.map