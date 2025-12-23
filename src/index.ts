import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import prisma from './utils/database';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { verifyToken } from './utils/auth';
import path from 'path';


async function startServer() {
  const app = express(); // 🚀 இந்த app-தான் சர்வரை இயக்குகிறது
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: true,
  });

  await server.start();
  app.use(cors<cors.CorsRequest>());
  app.use(bodyParser.json());
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // Middleware for File Uploads
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

  // GraphQL Middleware
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
            console.error('Token verification error:', error);
          }
        }
        return context;
      },
    }) as any
  );

  await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000/graphql`);
  console.log(`📂 Static files served at http://localhost:4000/uploads`);
}
startServer().catch(error => {
  console.error('Error starting server:', error);
});