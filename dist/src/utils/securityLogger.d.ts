declare class SecurityLogger {
    private logToFile;
    info(message: string, data?: any): void;
    warn(message: string, data?: any): void;
    error(message: string, data?: any): void;
}
export declare const securityLogger: SecurityLogger;
export declare const logSecurityEvent: {
    loginSuccess: (data: {
        userId: string;
        email: string;
        ip?: string;
        userAgent?: string;
    }) => void;
    loginFailure: (data: {
        email: string;
        attemptCount: number;
        ip?: string;
        userAgent?: string;
    }) => void;
    accountLocked: (data: {
        email: string;
        ip?: string;
        lockoutDuration: number;
    }) => void;
    registrationSuccess: (data: {
        userId: string;
        email: string;
        ip?: string;
    }) => void;
    registrationFailure: (data: {
        email?: string;
        reason: string;
        ip?: string;
    }) => void;
    rateLimitExceeded: (data: {
        endpoint: string;
        ip: string;
        userAgent?: string;
        limit: number;
        windowMs: number;
    }) => void;
    suspiciousActivity: (data: {
        type: string;
        ip: string;
        details: any;
    }) => void;
    adminAction: (data: {
        action: string;
        adminId: string;
        targetId?: string;
        ip?: string;
    }) => void;
};
export {};
//# sourceMappingURL=securityLogger.d.ts.map