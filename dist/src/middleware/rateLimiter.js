"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminLimiter = exports.uploadLimiter = exports.registrationLimiter = exports.passwordResetLimiter = exports.authLimiter = exports.apiLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rate_limit_redis_1 = __importDefault(require("rate-limit-redis"));
// Environment-aware configuration
const isProduction = process.env.NODE_ENV === 'production';
// Redis store configuration for production scaling
const createStore = () => {
    if (isProduction && process.env.REDIS_HOST) {
        try {
            return new rate_limit_redis_1.default({
                // @ts-ignore - Redis store has different typing than expected
                host: process.env.REDIS_HOST,
                port: parseInt(process.env.REDIS_PORT || '6379'),
                password: process.env.REDIS_PASSWORD,
                retryDelay: 500,
                maxRetries: 3
            });
        }
        catch (error) {
            if (process.env.NODE_ENV === 'development') {
            }
            return undefined;
        }
    }
    return undefined; // Use memory store in development
};
// General API rate limiting (applied to all GraphQL requests)
exports.apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProduction ? 100 : 500, // Stricter in production
    message: {
        error: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: '900' // 15 minutes in seconds
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable deprecated `X-RateLimit-*` headers
    store: createStore(),
    keyGenerator: (req) => {
        // Use IP address for rate limiting
        return req.ip || req.connection.remoteAddress || 'unknown';
    }
});
// Strict limiting for authentication operations (login, register)
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProduction ? 5 : 10, // Very strict in production
    message: {
        error: 'Too many authentication attempts from this IP, please try again later.',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        retryAfter: '900'
    },
    standardHeaders: true,
    store: createStore(),
    skip: (_req, res) => {
        // Skip rate limiting for successful requests (200 status)
        return res.statusCode === 200;
    }
});
// Password reset rate limiting (more restrictive)
exports.passwordResetLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: isProduction ? 3 : 5, // Very limited
    message: {
        error: 'Too many password reset requests, please try again later.',
        code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
        retryAfter: '3600'
    },
    standardHeaders: true,
    store: createStore()
});
// User registration rate limiting
exports.registrationLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: isProduction ? 5 : 10, // Limited but reasonable
    message: {
        error: 'Too many registration attempts from this IP, please try again later.',
        code: 'REGISTRATION_RATE_LIMIT_EXCEEDED',
        retryAfter: '3600'
    },
    standardHeaders: true,
    store: createStore()
});
// File upload rate limiting (to prevent abuse)
exports.uploadLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: isProduction ? 20 : 50, // Reasonable upload limits
    message: {
        error: 'Too many file uploads, please try again later.',
        code: 'UPLOAD_RATE_LIMIT_EXCEEDED',
        retryAfter: '3600'
    },
    standardHeaders: true,
    store: createStore()
});
// Admin operations rate limiting (stricter)
exports.adminLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isProduction ? 50 : 100, // Moderate for admin operations
    message: {
        error: 'Too many admin operations, please try again later.',
        code: 'ADMIN_RATE_LIMIT_EXCEEDED',
        retryAfter: '900'
    },
    standardHeaders: true,
    store: createStore()
});
//# sourceMappingURL=rateLimiter.js.map