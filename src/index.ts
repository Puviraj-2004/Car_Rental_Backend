// backend/src/index.ts
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import prisma from './utils/database';
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
    introspection: true,
  });

  await server.start();

  // ✅ முக்கியமான வரிசை: CORS மற்றும் Upload முதலில் வர வேண்டும்
  app.use(cors<cors.CorsRequest>());
  
  // 📸 இமேஜ் அப்லோடுக்கு இது மிக அவசியம்
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

  app.use(bodyParser.json());
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        const context: any = { prisma };
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          try {
            const decoded: any = verifyToken(token);
            context.userId = decoded.userId;
            context.role = decoded.role;
          } catch (error) {
            // Token verification failed
          }
        }
        return context;
      },
    }) as any
  );

  const PORT = process.env.PORT || 4000;
  await new Promise<void>((resolve) => httpServer.listen({ port: parseInt(PORT.toString()) }, resolve));
  
  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
}

startServer().catch(error => {
  console.error('Error starting server:', error);
});