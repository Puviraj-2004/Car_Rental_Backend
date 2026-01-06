import fs from 'fs';
import path from 'path';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Simple security logger (production-ready alternative to winston)
class SecurityLogger {
  private logToFile(level: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...data
    };

    const logFile = path.join(logsDir, 'security.log');
    const logLine = JSON.stringify(logEntry) + '\n';

    try {
      fs.appendFileSync(logFile, logLine);
    } catch (error) {
      console.error('Failed to write to security log:', error);
    }
  }

  info(message: string, data?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[SECURITY INFO] ${message}`, data || '');
    }
    this.logToFile('info', message, data);
  }

  warn(message: string, data?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[SECURITY WARN] ${message}`, data || '');
    }
    this.logToFile('warn', message, data);
  }

  error(message: string, data?: any) {
    if (process.env.NODE_ENV !== 'production') {
      console.error(`[SECURITY ERROR] ${message}`, data || '');
    }
    this.logToFile('error', message, data);
  }
}

export const securityLogger = new SecurityLogger();

// Security event logging functions
export const logSecurityEvent = {
  // Authentication events
  loginSuccess: (data: { userId: string; email: string; ip?: string; userAgent?: string }) => {
    securityLogger.info('User login successful', {
      event: 'LOGIN_SUCCESS',
      ...data
    });
  },

  loginFailure: (data: { email: string; attemptCount: number; ip?: string; userAgent?: string }) => {
    securityLogger.warn('Login attempt failed', {
      event: 'LOGIN_FAILURE',
      ...data
    });
  },

  accountLocked: (data: { email: string; ip?: string; lockoutDuration: number }) => {
    securityLogger.warn('Account locked due to failed attempts', {
      event: 'ACCOUNT_LOCKED',
      ...data
    });
  },

  // Registration events
  registrationSuccess: (data: { userId: string; email: string; ip?: string }) => {
    securityLogger.info('User registration successful', {
      event: 'REGISTRATION_SUCCESS',
      ...data
    });
  },

  registrationFailure: (data: { email?: string; reason: string; ip?: string }) => {
    securityLogger.warn('User registration failed', {
      event: 'REGISTRATION_FAILURE',
      ...data
    });
  },

  // Rate limiting events
  rateLimitExceeded: (data: { endpoint: string; ip: string; userAgent?: string; limit: number; windowMs: number }) => {
    securityLogger.warn('Rate limit exceeded', {
      event: 'RATE_LIMIT_EXCEEDED',
      ...data
    });
  },

  // Suspicious activity
  suspiciousActivity: (data: { type: string; ip: string; details: any }) => {
    securityLogger.warn('Suspicious activity detected', {
      event: 'SUSPICIOUS_ACTIVITY',
      ...data
    });
  },

  // Admin operations
  adminAction: (data: { action: string; adminId: string; targetId?: string; ip?: string }) => {
    securityLogger.info('Admin action performed', {
      event: 'ADMIN_ACTION',
      ...data
    });
  }
};
