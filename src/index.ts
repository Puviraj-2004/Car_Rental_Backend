import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { verifyToken } from './utils/auth';

async function startServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req }: any) => {
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
  });

  console.log(`🚀 Server ready at: ${url}`);
}

startServer().catch(error => {
  console.error('Error starting server:', error);
});