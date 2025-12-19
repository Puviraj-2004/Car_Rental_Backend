import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { verifyToken } from './utils/auth';

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    '/',
    cors(),
    bodyParser.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        // Apply auth middleware to extract userId from token
        const context: any = {};

        // Extract authorization header
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          try {
            const decoded: any = verifyToken(token);
            context.userId = decoded.userId;
          } catch (error) {
            console.error('Token verification error:', error);
          }
        }

        return context;
      },
    }),
  );

  // Note: File upload middleware can be added later if needed

  const PORT = process.env.PORT || 4000;

  httpServer.listen({ port: PORT }, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/`);
  });
}

startServer().catch(error => {
  console.error('Error starting server:', error);
});