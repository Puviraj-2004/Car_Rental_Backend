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
async function startServer() {
    const app = (0, express_1.default)();
    const httpServer = http_1.default.createServer(app);
    const server = new server_1.ApolloServer({
        typeDefs: typeDefs_1.default,
        resolvers: resolvers_1.default,
        plugins: [(0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
        introspection: true,
    });
    await server.start();
    // 1. Middleware Order: CORS & Uploads first
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
    app.use((0, graphql_upload_ts_1.graphqlUploadExpress)({ maxFileSize: 10000000, maxFiles: 10 }));
    // 2. Body Parsing & Static Files
    app.use(body_parser_1.default.json());
    app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
    // 3. Diagnostics (Cloudinary)
    app.get('/diag/cloudinary', (_req, res) => {
        try {
            const raw = process.env.CLOUDINARY_CLOUD_NAME;
            const cloudLib = require('./utils/cloudinary');
            const effective = (cloudLib?.default?.config?.().cloud_name) || null;
            res.json({ rawCloudName: raw || null, effectiveCloudName: effective });
        }
        catch (e) {
            res.status(500).json({ error: 'Failed to fetch cloudinary info', detail: e.message });
        }
    });
    app.get('/diag/cloudinary/full', (_req, res) => {
        try {
            const { getCloudinaryDiagnostics } = require('./utils/cloudinary');
            res.json(getCloudinaryDiagnostics());
        }
        catch (e) {
            res.status(500).json({ error: 'Diagnostic failed', detail: e.message });
        }
    });
    app.post('/diag/cloudinary/validate', async (_req, res) => {
        try {
            const { revalidateCloudinaryCredentials } = require('./utils/cloudinary');
            res.json(await revalidateCloudinaryCredentials());
        }
        catch (e) {
            res.status(500).json({ error: 'Validation failed', detail: e.message });
        }
    });
    // 4. GraphQL Endpoint
    app.use('/graphql', (0, express4_1.expressMiddleware)(server, {
        context: async ({ req }) => {
            const context = { prisma: database_1.default };
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                try {
                    const decoded = (0, auth_1.verifyToken)(token);
                    context.userId = decoded.userId;
                    context.role = decoded.role;
                }
                catch (error) {
                }
            }
            return context;
        },
    }));
    const PORT = process.env.PORT || 4000;
    await new Promise((resolve) => httpServer.listen({ port: parseInt(PORT.toString()) }, resolve));
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
    // 5. Start Background Services
    expirationService_1.expirationService.startExpirationService();
}
startServer().catch(error => {
    console.error('❌ Error starting server:', error);
});
//# sourceMappingURL=index.js.map