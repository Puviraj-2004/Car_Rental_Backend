import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import bodyParser from 'body-parser';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { DateTimeResolver } from 'graphql-scalars';
import dotenv from 'dotenv';
import path from 'path';

// Load env before any other imports
dotenv.config();

import prisma from './utils/database';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { verifyToken } from './utils/auth';
import { expirationService } from './services/expirationService';
import { BookingStatus } from '@prisma/client';
import { apiLimiter } from './middleware/rateLimiter';
import { securityLogger } from './utils/securityLogger';
import {  csrfTokenHandler } from './middleware/csrfProtection';

/**
 * Senior Architect Note: 
 * To fix "Unknown type DateTime", we must explicitly define the scalar 
 * in the typeDefs array passed to Apollo Server.
 */
async function startServer() {
  console.log('🚀 INITIALIZING: Car Rental Backend...');

  const app = express();
  const httpServer = http.createServer(app);

  // --- STRIPE CONFIGURATION ---
  const isMockStripe = (process.env.MOCK_STRIPE || '').toLowerCase() === 'true';
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  
  let stripe: any = null;
  if (!isMockStripe && stripeSecretKey) {
    try {
      const Stripe = require('stripe');
      stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
    } catch (e) {
      console.warn('⚠️ Stripe module initialization failed.');
    }
  }

  // 🚀 STRIPE WEBHOOK - MUST BE FIRST BEFORE ALL MIDDLEWARE
  app.post('/webhook', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    console.log('💰 Webhook hit!');
    try {
      if (isMockStripe) {
        console.log('🔧 Mock Stripe mode - returning 204');
        return res.status(204).send();
      }
      if (!stripe || !stripeWebhookSecret) throw new Error('Stripe not configured');

      const sig = req.headers['stripe-signature'];
      if (!sig) throw new Error('No Stripe signature');
      
      const event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
      console.log('📝 Webhook event type:', event.type);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const bookingId = session?.metadata?.bookingId;
        console.log('✅ Payment completed for booking:', bookingId);

        if (bookingId) {
          // Use payment_intent id when available (so later refunds reference it)
          const paymentIdentifier = session.payment_intent || session.id;

          await prisma.payment.upsert({
            where: { bookingId },
            update: { status: 'SUCCEEDED', stripeId: paymentIdentifier },
            create: {
              bookingId,
              amount: session.amount_total / 100,
              status: 'SUCCEEDED',
              stripeId: paymentIdentifier
            },
          });
          console.log('💳 Payment record created/updated');

          await prisma.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.CONFIRMED },
          });
          console.log('🎫 Booking status updated to CONFIRMED');
        }
      }

      // Handle refunds coming from Stripe (charge refunded / refund updated)
      if (event.type === 'charge.refunded' || event.type === 'charge.refund.updated') {
        const charge = event.data.object as any;
        const bookingId = charge?.metadata?.bookingId;
        const paymentIntentId = charge?.payment_intent;

        console.log('♻️ Refund event detected', { bookingId, paymentIntentId });

        // Try to resolve payment by bookingId (preferred) or by payment_intent
        let payment: any = null;
        if (bookingId) {
          payment = await prisma.payment.findUnique({ where: { bookingId } });
        }
        if (!payment && paymentIntentId) {
          payment = await prisma.payment.findFirst({ where: { stripeId: paymentIntentId } });
        }

        if (payment) {
          await prisma.payment.update({ where: { id: payment.id }, data: { status: 'REFUNDED' } });
          console.log('💳 Payment marked REFUNDED:', payment.id);

          // Optionally set booking to CANCELLED when fully refunded
          try {
            await prisma.booking.update({ where: { id: payment.bookingId }, data: { status: BookingStatus.CANCELLED } });
            console.log('🎫 Booking status set to CANCELLED for refunded payment');
          } catch (e) {
            const errMsg = e && typeof e === 'object' && 'message' in e ? (e as any).message : String(e);
            console.warn('Could not update booking on refund:', errMsg);
          }
        } else {
          console.warn('Refund event received but payment not found for charge:', charge.id);
        }
      }
      
      console.log('✅ Webhook processed successfully');
      return res.json({ received: true });
    } catch (error: unknown) {
      const msg = error && typeof error === 'object' && 'message' in error ? (error as any).message : String(error);
      console.error('❌ Webhook error:', msg);
      return res.status(400).json({ error: msg });
    }
  });

  // --- APOLLO SERVER SETUP ---
  const server = new ApolloServer({
    csrfPrevention: false, 

    // 🔥 FIXED: Explicitly injecting "scalar DateTime" into the schema
    typeDefs: [
      `scalar DateTime`, 
      ...(Array.isArray(typeDefs) ? typeDefs : [typeDefs])
    ],
    resolvers: {
      DateTime: DateTimeResolver, 
      ...(resolvers as any),
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: true,
  });

  await server.start();
  console.log('✅ Apollo Server: Ready');

  // 1. SECURITY HEADERS
  app.use(helmet({
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
  app.use('/graphql', apiLimiter);

  // 3. LOGGING
  app.use((req: Request, _res: Response, next) => {
    if (req.path === '/graphql') {
      securityLogger.info('Incoming GraphQL Request', {
        method: req.method,
        ip: req.ip,
        operation: req.body?.operationName || 'unknown'
      });
    }
    next();
  });

  // 4. CORS
  app.use(cors<cors.CorsRequest>({
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
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

  // 6. CSRF
  // app.use('/graphql', csrfProtection);
  app.get('/csrf-token', csrfTokenHandler);

  // 7. GENERAL MIDDLEWARE
  app.use(bodyParser.json());
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // 9. DIAGNOSTICS
  app.get('/diag/cloudinary', (_req, res) => {
    try {
      const raw = process.env.CLOUDINARY_CLOUD_NAME;
      const cloudLib = require('./utils/cloudinary');
      const effective = (cloudLib?.default?.config?.().cloud_name) || null;
      res.json({ rawCloudName: raw || null, effectiveCloudName: effective });
    } catch (e: any) {
      res.status(500).json({ error: 'Cloudinary diagnostic failed' });
    }
  });

  // 10. GRAPHQL HANDLER
  app.use('/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        const context: any = { prisma, req };
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          try {
            const decoded: any = verifyToken(token);
            if (decoded) {
              context.userId = decoded.userId;
              context.role = decoded.role;
            }
          } catch (error) {
            // Context remains Guest
          }
        }
        return context;
      },
    }) as any
  );

  const PORT = process.env.PORT || 4000;
  console.log(`🔌 Attempting to listen on port: ${PORT}...`);

  await new Promise<void>((resolve) => httpServer.listen({ port: Number(PORT) }, resolve));

  console.log(`🚀 SUCCESS: Server ready at http://localhost:${PORT}/graphql`);

  // START BACKGROUND SERVICES
  expirationService.startExpirationService();
}

startServer().catch(error => {
  console.error('❌ CRITICAL ERROR DURING STARTUP:', error);
  process.exit(1);
});