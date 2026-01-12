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
const graphql_scalars_1 = require("graphql-scalars");
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load env before any other imports
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
 * Senior Architect Note:
 * To fix "Unknown type DateTime", we must explicitly define the scalar
 * in the typeDefs array passed to Apollo Server.
 */
async function startServer() {
    console.log('🚀 INITIALIZING: Car Rental Backend...');
    const app = (0, express_1.default)();
    const httpServer = http_1.default.createServer(app);
    // --- STRIPE CONFIGURATION ---
    const isMockStripe = (process.env.MOCK_STRIPE || '').toLowerCase() === 'true';
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    let stripe = null;
    if (!isMockStripe && stripeSecretKey) {
        try {
            const Stripe = require('stripe');
            stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
        }
        catch (e) {
            console.warn('⚠️ Stripe module initialization failed.');
        }
    }
    // --- APOLLO SERVER SETUP ---
    const server = new server_1.ApolloServer({
        csrfPrevention: false,
        // 🔥 FIXED: Explicitly injecting "scalar DateTime" into the schema
        typeDefs: [
            `scalar DateTime`,
            ...(Array.isArray(typeDefs_1.default) ? typeDefs_1.default : [typeDefs_1.default])
        ],
        resolvers: {
            DateTime: graphql_scalars_1.DateTimeResolver,
            ...resolvers_1.default,
        },
        plugins: [(0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
        introspection: true,
    });
    await server.start();
    console.log('✅ Apollo Server: Ready');
    // 1. SECURITY HEADERS
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                fontSrc: ["'self'"],
                connectSrc: ["'self'"],
                mediaSrc: ["'self'"],
                objectSrc: ["'none'"],
                frameSrc: ["'none'"],
                baseUri: ["'self'"],
                formAction: ["'self'"],
                frameAncestors: ["'none'"],
            },
        },
        xFrameOptions: { action: 'deny' },
        xContentTypeOptions: true,
        hidePoweredBy: true,
    }));
    // 2. RATE LIMITING
    app.use('/graphql', rateLimiter_1.apiLimiter);
    // 3. LOGGING
    app.use((req, _res, next) => {
        if (req.path === '/graphql') {
            securityLogger_1.securityLogger.info('Incoming GraphQL Request', {
                method: req.method,
                ip: req.ip,
                operation: req.body?.operationName || 'unknown'
            });
        }
        next();
    });
    // 4. CORS
    app.use((0, cors_1.default)({
        origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            process.env.FRONTEND_URL || ''
        ].filter(Boolean),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Apollo-Require-Preflight', 'x-csrf-token']
    }));
    // 5. UPLOADS
    app.use((0, graphql_upload_ts_1.graphqlUploadExpress)({ maxFileSize: 10000000, maxFiles: 10 }));
    // 6. CSRF
    // app.use('/graphql', csrfProtection);
    app.get('/csrf-token', csrfProtection_1.csrfTokenHandler);
    // 7. STRIPE WEBHOOK
    app.post('/webhooks/stripe', express_1.default.raw({ type: 'application/json' }), async (req, res) => {
        try {
            if (isMockStripe)
                return res.status(204).send();
            if (!stripe || !stripeWebhookSecret)
                throw new Error('Stripe not configured');
            const sig = req.headers['stripe-signature'];
            const event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
            if (event.type === 'checkout.session.completed') {
                const session = event.data.object;
                const bookingId = session?.metadata?.bookingId;
                if (bookingId) {
                    await database_1.default.payment.upsert({
                        where: { bookingId },
                        update: { status: 'SUCCEEDED', stripeId: session.id },
                        create: {
                            bookingId,
                            amount: session.amount_total / 100,
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
            return res.status(400).json({ error: error.message });
        }
    });
    // 8. GENERAL MIDDLEWARE
    app.use(body_parser_1.default.json());
    app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
    // 9. DIAGNOSTICS
    app.get('/diag/cloudinary', (_req, res) => {
        try {
            const raw = process.env.CLOUDINARY_CLOUD_NAME;
            const cloudLib = require('./utils/cloudinary');
            const effective = (cloudLib?.default?.config?.().cloud_name) || null;
            res.json({ rawCloudName: raw || null, effectiveCloudName: effective });
        }
        catch (e) {
            res.status(500).json({ error: 'Cloudinary diagnostic failed' });
        }
    });
    // 10. GRAPHQL HANDLER
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
                    // Context remains Guest
                }
            }
            return context;
        },
    }));
    const PORT = process.env.PORT || 4000;
    console.log(`🔌 Attempting to listen on port: ${PORT}...`);
    await new Promise((resolve) => httpServer.listen({ port: Number(PORT) }, resolve));
    console.log(`🚀 SUCCESS: Server ready at http://localhost:${PORT}/graphql`);
    // START BACKGROUND SERVICES
    expirationService_1.expirationService.startExpirationService();
}
startServer().catch(error => {
    console.error('❌ CRITICAL ERROR DURING STARTUP:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map