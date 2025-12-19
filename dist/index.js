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
const typeDefs_1 = __importDefault(require("./graphql/typeDefs"));
const resolvers_1 = __importDefault(require("./graphql/resolvers"));
const auth_1 = require("./utils/auth");
async function startServer() {
    const app = (0, express_1.default)();
    const httpServer = http_1.default.createServer(app);
    const server = new server_1.ApolloServer({
        typeDefs: typeDefs_1.default,
        resolvers: resolvers_1.default,
        plugins: [(0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
    });
    await server.start();
    app.use('/', (0, cors_1.default)(), body_parser_1.default.json(), (0, express4_1.expressMiddleware)(server, {
        context: async ({ req }) => {
            // Apply auth middleware to extract userId from token
            const context = {};
            // Extract authorization header
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                try {
                    const decoded = (0, auth_1.verifyToken)(token);
                    context.userId = decoded.userId;
                }
                catch (error) {
                    console.error('Token verification error:', error);
                }
            }
            return context;
        },
    }));
    // Add file upload middleware
    app.use(graphqlUploadExpress({ maxFileSize: 5 * 1024 * 1024, maxFiles: 10 }));
    const PORT = process.env.PORT || 4000;
    httpServer.listen({ port: PORT }, () => {
        console.log(`🚀 Server ready at http://localhost:${PORT}/`);
    });
}
startServer().catch(error => {
    console.error('Error starting server:', error);
});
//# sourceMappingURL=index.js.map