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
const database_1 = __importDefault(require("./utils/database"));
const typeDefs_1 = __importDefault(require("./graphql/typeDefs"));
const resolvers_1 = __importDefault(require("./graphql/resolvers"));
const auth_1 = require("./utils/auth");
const path_1 = __importDefault(require("path"));
async function startServer() {
    const app = (0, express_1.default)(); // 🚀 இந்த app-தான் சர்வரை இயக்குகிறது
    const httpServer = http_1.default.createServer(app);
    const server = new server_1.ApolloServer({
        typeDefs: typeDefs_1.default,
        resolvers: resolvers_1.default,
        plugins: [(0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
        introspection: true,
    });
    await server.start();
    app.use((0, cors_1.default)());
    app.use(body_parser_1.default.json());
    app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
    // Middleware for File Uploads
    app.use((0, graphql_upload_ts_1.graphqlUploadExpress)({ maxFileSize: 10000000, maxFiles: 10 }));
    // GraphQL Middleware
    app.use('/graphql', (0, express4_1.expressMiddleware)(server, {
        context: async ({ req }) => {
            const context = { prisma: database_1.default };
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
    await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
    console.log(`🚀 Server ready at http://localhost:4000/graphql`);
    console.log(`📂 Static files served at http://localhost:4000/uploads`);
}
startServer().catch(error => {
    console.error('Error starting server:', error);
});
//# sourceMappingURL=index.js.map