"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logSecurityEvent = exports.securityLogger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Create logs directory if it doesn't exist
const logsDir = path_1.default.join(process.cwd(), 'logs');
if (!fs_1.default.existsSync(logsDir)) {
    fs_1.default.mkdirSync(logsDir, { recursive: true });
}
// Simple security logger (production-ready alternative to winston)
class SecurityLogger {
    logToFile(level, message, data) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...data
        };
        const logFile = path_1.default.join(logsDir, 'security.log');
        const logLine = JSON.stringify(logEntry) + '\n';
        try {
            fs_1.default.appendFileSync(logFile, logLine);
        }
        catch (error) {
            console.error('Failed to write to security log:', error);
        }
    }
    info(message, data) {
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[SECURITY INFO] ${message}`, data || '');
        }
        this.logToFile('info', message, data);
    }
    warn(message, data) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[SECURITY WARN] ${message}`, data || '');
        }
        this.logToFile('warn', message, data);
    }
    error(message, data) {
        if (process.env.NODE_ENV !== 'production') {
            console.error(`[SECURITY ERROR] ${message}`, data || '');
        }
        this.logToFile('error', message, data);
    }
}
exports.securityLogger = new SecurityLogger();
// Security event logging functions
exports.logSecurityEvent = {
    // Authentication events
    loginSuccess: (data) => {
        exports.securityLogger.info('User login successful', {
            event: 'LOGIN_SUCCESS',
            ...data
        });
    },
    loginFailure: (data) => {
        exports.securityLogger.warn('Login attempt failed', {
            event: 'LOGIN_FAILURE',
            ...data
        });
    },
    accountLocked: (data) => {
        exports.securityLogger.warn('Account locked due to failed attempts', {
            event: 'ACCOUNT_LOCKED',
            ...data
        });
    },
    // Registration events
    registrationSuccess: (data) => {
        exports.securityLogger.info('User registration successful', {
            event: 'REGISTRATION_SUCCESS',
            ...data
        });
    },
    registrationFailure: (data) => {
        exports.securityLogger.warn('User registration failed', {
            event: 'REGISTRATION_FAILURE',
            ...data
        });
    },
    // Rate limiting events
    rateLimitExceeded: (data) => {
        exports.securityLogger.warn('Rate limit exceeded', {
            event: 'RATE_LIMIT_EXCEEDED',
            ...data
        });
    },
    // Suspicious activity
    suspiciousActivity: (data) => {
        exports.securityLogger.warn('Suspicious activity detected', {
            event: 'SUSPICIOUS_ACTIVITY',
            ...data
        });
    },
    // Admin operations
    adminAction: (data) => {
        exports.securityLogger.info('Admin action performed', {
            event: 'ADMIN_ACTION',
            ...data
        });
    }
};
//# sourceMappingURL=securityLogger.js.map