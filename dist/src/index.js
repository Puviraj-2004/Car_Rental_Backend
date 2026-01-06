"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const body_parser_1 = __importDefault(require("body-parser"));
const graphql_upload_ts_1 = require("graphql-upload-ts");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load env before imports
dotenv_1.default.config();
const database_1 = __importDefault(require("./utils/database"));
const typeDefs_1 = __importDefault(require("./graphql/typeDefs"));
const resolvers_1 = __importDefault(require("./graphql/resolvers"));
const auth_1 = require("./utils/auth");
const expirationService_1 = require("./services/expirationService");
const client_1 = require("@prisma/client");
const rateLimiter_1 = require("./middleware/rateLimiter");
const securityLogger_1 = require("./utils/securityLogger");
const csrfProtection_1 = require("./middleware/csrfProtection");
/**
 * Senior Architect Note: Server orchestration layer.
 * Strictly separates transport (Express) from logic (Resolvers/Services).
 */
async function startServer() {
    const app = (0, express_1.default)();
    const httpServer = http_1.default.createServer(app);
    const isMockStripe = (process.env.MOCK_STRIPE || '').toLowerCase() === 'true';
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    let stripe = null;
    if (!isMockStripe && stripeSecretKey) {
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const Stripe = require('stripe');
            stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
        }
        catch (e) {
            if (process.env.NODE_ENV === 'development') {
            }
            stripe = null;
        }
    }
    const server = new server_1.ApolloServer({
        typeDefs: typeDefs_1.default,
        resolvers: resolvers_1.default,
        plugins: [(0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
        introspection: true,
    });
    await server.start();
    // 1. SECURITY HEADERS (Production-ready protection)
    app.use((0, helmet_1.default)({
        // Content Security Policy - Strict XSS protection
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
                fontSrc: ["'self'"],
                connectSrc: ["'self'"],
                mediaSrc: ["'self'"],
                objectSrc: ["'none'"],
                frameSrc: ["'none'"],
                baseUri: ["'self'"],
                formAction: ["'self'"],
                frameAncestors: ["'none'"],
                ...(process.env.NODE_ENV === 'development' && {
                    // Relaxed CSP for GraphQL playground in development
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                })
            },
        },
        // Prevent clickjacking
        xFrameOptions: { action: 'deny' },
        // Prevent MIME type sniffing
        xContentTypeOptions: true,
        // XSS protection
        xXssProtection: true,
        // Referrer policy
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        // Feature policy (Permissions policy) - Note: This might need helmet version upgrade
        // permissionsPolicy: {
        //   camera: [],
        //   microphone: [],
        //   geolocation: [],
        //   payment: ['self'],
        // },
        // HSTS (HTTP Strict Transport Security)
        hsts: {
            maxAge: 31536000, // 1 year
            includeSubDomains: true,
            preload: true
        },
        // Cross-Origin policies
        crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
        crossOriginOpenerPolicy: { policy: 'same-origin' },
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        // Remove server header
        hidePoweredBy: true,
    }));
    // 2. GENERAL API RATE LIMITING (Applied to all requests)
    app.use('/graphql', rateLimiter_1.apiLimiter);
    // 4. REQUEST LOGGING & SECURITY MONITORING
    app.use((req, res, next) => {
        const start = Date.now();
        const originalSend = res.send;
        // Log security-relevant requests
        if (req.path === '/graphql' && (req.method === 'POST' || req.method === 'GET')) {
            securityLogger_1.securityLogger.info('GraphQL Request', {
                method: req.method,
                path: req.path,
                ip: req.ip,
                userAgent: req.get('User-Agent'),
                operation: req.body?.operationName || 'unknown'
            });
        }
        // Override response send to log completion
        res.send = function (data) {
            const duration = Date.now() - start;
            // Log rate limit violations
            if (res.statusCode === 429) {
                securityLogger_1.securityLogger.warn('Rate limit triggered', {
                    ip: req.ip,
                    path: req.path,
                    method: req.method,
                    userAgent: req.get('User-Agent')
                });
            }
            // Log slow requests (>5 seconds)
            if (duration > 5000) {
                securityLogger_1.securityLogger.warn('Slow request detected', {
                    method: req.method,
                    path: req.path,
                    duration,
                    ip: req.ip
                });
            }
            return originalSend.call(this, data);
        };
        next();
    });
    // 5. SECURITY & CORS CONFIGURATION
    app.use((0, cors_1.default)({
        origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            process.env.FRONTEND_URL || ''
        ].filter(Boolean),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Apollo-Require-Preflight']
    }));
    // 6. FILE UPLOAD HANDLING (With rate limiting)
    app.use('/graphql', (req, res, next) => {
        // Apply upload rate limiting for file operations
        if (req.body?.query?.includes('upload') || req.body?.query?.includes('Upload')) {
            return (0, rateLimiter_1.uploadLimiter)(req, res, next);
        }
        return next();
    });
    app.use((0, graphql_upload_ts_1.graphqlUploadExpress)({ maxFileSize: 10000000, maxFiles: 10 }));
    // 7. CSRF PROTECTION (For GraphQL mutations)
    app.use('/graphql', csrfProtection_1.csrfProtection);
    // 8. CSRF TOKEN ENDPOINT
    app.get('/csrf-token', csrfProtection_1.csrfTokenHandler);
    // 3. STRIPE WEBHOOK (Must be before JSON body-parser)
    app.post('/webhooks/stripe', express_1.default.raw({ type: 'application/json' }), async (req, res) => {
        try {
            if (isMockStripe)
                return res.status(204).send();
            if (!stripe || !stripeWebhookSecret)
                return res.status(500).json({ error: 'Stripe is not configured' });
            const sig = req.headers['stripe-signature'];
            if (!sig || Array.isArray(sig))
                return res.status(400).json({ error: 'Missing stripe-signature header' });
            const event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
            if (event.type === 'checkout.session.completed') {
                const session = event.data.object;
                const bookingId = session?.metadata?.bookingId;
                const amountTotal = typeof session?.amount_total === 'number' ? session.amount_total : undefined;
                if (bookingId) {
                    // Logic preservation: Payment Upsert & Booking Confirmation
                    await database_1.default.payment.upsert({
                        where: { bookingId },
                        update: {
                            status: 'SUCCEEDED',
                            stripeId: session.id,
                            amount: amountTotal !== undefined ? amountTotal / 100 : undefined,
                        },
                        create: {
                            bookingId,
                            amount: amountTotal !== undefined ? amountTotal / 100 : 0,
                            status: 'SUCCEEDED',
                            stripeId: session.id
                        },
                    });
                    await database_1.default.booking.update({
                        where: { id: bookingId },
                        data: { status: client_1.BookingStatus.CONFIRMED },
                    });
                }
            }
            return res.json({ received: true });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Webhook Error';
            return res.status(400).json({ error: message });
        }
    });
    // 4. GENERAL MIDDLEWARE
    app.use(body_parser_1.default.json());
    app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
    // 5. CLOUDINARY DIAGNOSTICS
    app.get('/diag/cloudinary', (_req, res) => {
        try {
            const raw = process.env.CLOUDINARY_CLOUD_NAME;
            const cloudLib = require('./utils/cloudinary');
            const effective = (cloudLib?.default?.config?.().cloud_name) || null;
            res.json({ rawCloudName: raw || null, effectiveCloudName: effective });
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: 'Failed to fetch cloudinary info', detail: message });
        }
    });
    app.get('/diag/cloudinary/full', (_req, res) => {
        try {
            const { getCloudinaryDiagnostics } = require('./utils/cloudinary');
            res.json(getCloudinaryDiagnostics());
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: 'Diagnostic failed', detail: message });
        }
    });
    app.post('/diag/cloudinary/validate', async (_req, res) => {
        try {
            const { revalidateCloudinaryCredentials } = require('./utils/cloudinary');
            res.json(await revalidateCloudinaryCredentials());
        }
        catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            res.status(500).json({ error: 'Validation failed', detail: message });
        }
    });
    // 7. GRAPHQL HANDLER
    app.use('/graphql', (0, express4_1.expressMiddleware)(server, {
        context: async ({ req }) => {
            const context = { prisma: database_1.default, req };
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                try {
                    const decoded = (0, auth_1.verifyToken)(token);
                    if (decoded) {
                        context.userId = decoded.userId;
                        context.role = decoded.role;
                    }
                }
                catch (error) {
                    // Context remains guest if token verification fails
                }
            }
            return context;
        },
    }));
    const PORT = process.env.PORT || 4000;
    await new Promise((resolve) => httpServer.listen({ port: Number(PORT) }, resolve));
    if (process.env.NODE_ENV === 'development') {
    }
    // 7. BACKGROUND SERVICES STARTUP
    expirationService_1.expirationService.startExpirationService();
}
startServer().catch(_error => {
    // Critical server startup error - always log
});
//# sourceMappingURL=index.js.map