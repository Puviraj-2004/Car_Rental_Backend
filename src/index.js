"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("@apollo/server");
const standalone_1 = require("@apollo/server/standalone");
const client_1 = require("@prisma/client");
const typeDefs_1 = __importDefault(require("./graphql/typeDefs"));
const resolvers_1 = __importDefault(require("./graphql/resolvers"));
const authMiddleware_1 = require("./middleware/authMiddleware");
const prisma = new client_1.PrismaClient();
async function startServer() {
    const server = new server_1.ApolloServer({
        typeDefs: typeDefs_1.default,
        resolvers: resolvers_1.default,
    });
    const { url } = await (0, standalone_1.startStandaloneServer)(server, {
        listen: { port: 4000 },
        context: async ({ req }) => {
            // Apply auth middleware to extract userId from token
            const context = {};
            // Extract authorization header
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                try {
                    const decoded = require('./utils/auth').verifyToken(token);
                    context.userId = decoded.userId;
                }
                catch (error) {
                    console.error('Token verification error:', error);
                }
            }
            return context;
        },
    });
    console.log(`🚀 Server ready at: ${url}`);
}
startServer().catch(error => {
    console.error('Error starting server:', error);
});
//# sourceMappingURL=index.js.map