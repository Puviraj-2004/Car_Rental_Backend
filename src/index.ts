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

// Load env before imports
dotenv.config();

import prisma from './utils/database';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { verifyToken } from './utils/auth';
import { expirationService } from './services/expirationService';

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const isMockStripe = (process.env.MOCK_STRIPE || '').toLowerCase() === 'true';
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  let stripe: any = null;
  if (!isMockStripe && stripeSecretKey) {
    try {
      // Lazy require so MOCK_STRIPE=true works without installing stripe
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Stripe = require('stripe');
      stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
    } catch (e) {
      stripe = null;
    }
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: true,
  });

  await server.start();

  // 1. Middleware Order: CORS & Uploads first
  app.use(cors<cors.CorsRequest>({
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
  
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

  app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
      if (isMockStripe) {
        return res.status(204).send();
      }

      if (!stripe || !stripeWebhookSecret) {
        return res.status(500).json({ error: 'Stripe is not configured' });
      }

      const sig = req.headers['stripe-signature'];
      if (!sig || Array.isArray(sig)) {
        return res.status(400).json({ error: 'Missing stripe-signature header' });
      }

      const event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const bookingId = session?.metadata?.bookingId;
        const amountTotal = typeof session?.amount_total === 'number' ? session.amount_total : undefined;

        if (bookingId) {
          await prisma.payment.upsert({
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

          await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'CONFIRMED' },
          });
        }
      }

      return res.json({ received: true });
    } catch (e: any) {
      return res.status(400).json({ error: e.message || 'Webhook Error' });
    }
  });

  // 2. Body Parsing & Static Files
  app.use(bodyParser.json());
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // 3. Diagnostics (Cloudinary)
  app.get('/diag/cloudinary', (_req, res) => {
    try {
      const raw = process.env.CLOUDINARY_CLOUD_NAME;
      const cloudLib = require('./utils/cloudinary');
      const effective = (cloudLib?.default?.config?.().cloud_name) || null;
      res.json({ rawCloudName: raw || null, effectiveCloudName: effective });
    } catch (e: any) {
      res.status(500).json({ error: 'Failed to fetch cloudinary info', detail: e.message });
    }
  });

  app.get('/diag/cloudinary/full', (_req, res) => {
    try {
      const { getCloudinaryDiagnostics } = require('./utils/cloudinary');
      res.json(getCloudinaryDiagnostics());
    } catch (e: any) {
      res.status(500).json({ error: 'Diagnostic failed', detail: e.message });
    }
  });

  app.post('/diag/cloudinary/validate', async (_req, res) => {
    try {
      const { revalidateCloudinaryCredentials } = require('./utils/cloudinary');
      res.json(await revalidateCloudinaryCredentials());
    } catch (e: any) {
      res.status(500).json({ error: 'Validation failed', detail: e.message });
    }
  });

  // 4. GraphQL Endpoint
  app.use('/graphql',
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
          }
        }
        return context;
      },
    }) as any
  );

  const PORT = process.env.PORT || 4000;
  await new Promise<void>((resolve) => httpServer.listen({ port: parseInt(PORT.toString()) }, resolve));

  console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);

  // 5. Start Background Services
  expirationService.startExpirationService();
}

startServer().catch(error => {
  console.error('❌ Error starting server:', error);
});