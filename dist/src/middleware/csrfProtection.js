"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.csrfTokenHandler = exports.generateCSRFToken = exports.csrfProtection = void 0;
const crypto_1 = __importDefault(require("crypto"));
// CSRF Protection for GraphQL APIs
// Note: GraphQL APIs are less vulnerable to traditional CSRF, but we implement additional protections
const csrfProtection = (req, res, next) => {
    // Skip CSRF check for GET requests (queries)
    if (req.method === 'GET') {
        return next();
    }
    // Skip for GraphQL introspection in development
    if (process.env.NODE_ENV !== 'production' && req.body?.operationName === 'IntrospectionQuery') {
        return next();
    }
    // Check Origin header for GraphQL mutations
    const origin = req.headers.origin || req.headers.referer;
    const allowedOrigins = [
        process.env.FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
    ].filter(Boolean);
    if (origin && !allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        return res.status(403).json({
            error: 'Origin not allowed',
            code: 'CSRF_VIOLATION',
            message: 'Request origin is not permitted'
        });
    }
    // Check Content-Type for POST requests
    if (req.method === 'POST' && !req.is('application/json')) {
        return res.status(400).json({
            error: 'Invalid Content-Type',
            code: 'INVALID_CONTENT_TYPE',
            message: 'GraphQL requests must use application/json'
        });
    }
    // Additional CSRF token validation for sensitive operations
    const operationName = req.body?.operationName;
    const sensitiveOperations = [
        'login',
        'register',
        'createPayment',
        'updateUser',
        'deleteUser',
        'adminAction'
    ];
    if (operationName && sensitiveOperations.some(op => operationName.toLowerCase().includes(op))) {
        // Check for CSRF token in headers
        const csrfToken = req.headers['x-csrf-token'] || req.headers['csrf-token'];
        if (!csrfToken) {
            return res.status(403).json({
                error: 'CSRF token missing',
                code: 'CSRF_TOKEN_MISSING',
                message: 'CSRF token required for sensitive operations'
            });
        }
        // In production, validate token against session/user
        // For now, we just check if token exists and is valid format
        if (typeof csrfToken !== 'string' || csrfToken.length < 32) {
            return res.status(403).json({
                error: 'Invalid CSRF token',
                code: 'INVALID_CSRF_TOKEN',
                message: 'CSRF token format is invalid'
            });
        }
    }
    next();
};
exports.csrfProtection = csrfProtection;
// Generate CSRF token for clients
const generateCSRFToken = () => {
    return crypto_1.default.randomBytes(32).toString('hex');
};
exports.generateCSRFToken = generateCSRFToken;
// CSRF token endpoint
const csrfTokenHandler = (_req, res) => {
    const token = (0, exports.generateCSRFToken)();
    // In production, store token in session/redis
    // For now, just return it (client should store it securely)
    res.json({
        csrfToken: token,
        expiresIn: 3600000 // 1 hour in milliseconds
    });
};
exports.csrfTokenHandler = csrfTokenHandler;
//# sourceMappingURL=csrfProtection.js.map