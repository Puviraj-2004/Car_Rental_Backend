import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
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
import { BookingStatus } from '@prisma/client';
import {
  apiLimiter,
  uploadLimiter
} from './middleware/rateLimiter';
import { securityLogger } from './utils/securityLogger';
import { csrfProtection, csrfTokenHandler } from './middleware/csrfProtection';

/**
 * Senior Architect Note: Server orchestration layer.
 * Strictly separates transport (Express) from logic (Resolvers/Services).
 */
async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  const isMockStripe = (process.env.MOCK_STRIPE || '').toLowerCase() === 'true';
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
  const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  
  let stripe: any = null;

  if (!isMockStripe && stripeSecretKey) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const Stripe = require('stripe');
      stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' });
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
      }
      stripe = null;
    }
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers: resolvers as any,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: true,
  });

  await server.start();

  // 1. SECURITY HEADERS (Production-ready protection)
  app.use(helmet({
    // Content Security Policy - Strict XSS protection
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'"],
        connectSrc: ["'self'"],
        mediaSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        ...(process.env.NODE_ENV === 'development' && {
          // Relaxed CSP for GraphQL playground in development
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        })
      },
    },

    // Prevent clickjacking
    xFrameOptions: { action: 'deny' },

    // Prevent MIME type sniffing
    xContentTypeOptions: true,

    // XSS protection
    xXssProtection: true,

    // Referrer policy
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

    // Feature policy (Permissions policy) - Note: This might need helmet version upgrade
    // permissionsPolicy: {
    //   camera: [],
    //   microphone: [],
    //   geolocation: [],
    //   payment: ['self'],
    // },

    // HSTS (HTTP Strict Transport Security)
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },

    // Cross-Origin policies
    crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production',
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'cross-origin' },

    // Remove server header
    hidePoweredBy: true,
  }));

  // 2. GENERAL API RATE LIMITING (Applied to all requests)
  app.use('/graphql', apiLimiter);

  // 4. REQUEST LOGGING & SECURITY MONITORING
  app.use((req: Request, res: Response, next) => {
    const start = Date.now();
    const originalSend = res.send;

    // Log security-relevant requests
    if (req.path === '/graphql' && (req.method === 'POST' || req.method === 'GET')) {
      securityLogger.info('GraphQL Request', {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        operation: req.body?.operationName || 'unknown'
      });
    }

    // Override response send to log completion
    res.send = function(data) {
      const duration = Date.now() - start;

      // Log rate limit violations
      if (res.statusCode === 429) {
        securityLogger.warn('Rate limit triggered', {
          ip: req.ip,
          path: req.path,
          method: req.method,
          userAgent: req.get('User-Agent')
        });
      }

      // Log slow requests (>5 seconds)
      if (duration > 5000) {
        securityLogger.warn('Slow request detected', {
          method: req.method,
          path: req.path,
          duration,
          ip: req.ip
        });
      }

      return originalSend.call(this, data);
    };

    next();
  });

  // 5. SECURITY & CORS CONFIGURATION
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
  
  // 6. FILE UPLOAD HANDLING (With rate limiting)
  app.use('/graphql', (req, res, next) => {
    // Apply upload rate limiting for file operations
    if (req.body?.query?.includes('upload') || req.body?.query?.includes('Upload')) {
      return uploadLimiter(req, res, next);
    }
    return next();
  });
  app.use(graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }));

  // 7. CSRF PROTECTION (For GraphQL mutations)
  app.use('/graphql', csrfProtection);

  // 8. CSRF TOKEN ENDPOINT
  app.get('/csrf-token', csrfTokenHandler);

  // 3. STRIPE WEBHOOK (Must be before JSON body-parser)
  app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    try {
      if (isMockStripe) return res.status(204).send();
      if (!stripe || !stripeWebhookSecret) return res.status(500).json({ error: 'Stripe is not configured' });

      const sig = req.headers['stripe-signature'];
      if (!sig || Array.isArray(sig)) return res.status(400).json({ error: 'Missing stripe-signature header' });

      const event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const bookingId = session?.metadata?.bookingId;
        const amountTotal = typeof session?.amount_total === 'number' ? session.amount_total : undefined;

        if (bookingId) {
          // Logic preservation: Payment Upsert & Booking Confirmation
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
            data: { status: BookingStatus.CONFIRMED },
          });
        }
      }

      return res.json({ received: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Webhook Error';
      return res.status(400).json({ error: message });
    }
  });

  // 4. GENERAL MIDDLEWARE
  app.use(bodyParser.json());
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // 5. CLOUDINARY DIAGNOSTICS
  app.get('/diag/cloudinary', (_req, res) => {
    try {
      const raw = process.env.CLOUDINARY_CLOUD_NAME;
      const cloudLib = require('./utils/cloudinary');
      const effective = (cloudLib?.default?.config?.().cloud_name) || null;
      res.json({ rawCloudName: raw || null, effectiveCloudName: effective });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Failed to fetch cloudinary info', detail: message });
    }
  });

  app.get('/diag/cloudinary/full', (_req, res) => {
    try {
      const { getCloudinaryDiagnostics } = require('./utils/cloudinary');
      res.json(getCloudinaryDiagnostics());
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Diagnostic failed', detail: message });
    }
  });

  app.post('/diag/cloudinary/validate', async (_req, res) => {
    try {
      const { revalidateCloudinaryCredentials } = require('./utils/cloudinary');
      res.json(await revalidateCloudinaryCredentials());
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Validation failed', detail: message });
    }
  });

  // 7. GRAPHQL HANDLER
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
            // Context remains guest if token verification fails
          }
        }
        return context;
      },
    }) as any
  );

  const PORT = process.env.PORT || 4000;
  await new Promise<void>((resolve) => httpServer.listen({ port: Number(PORT) }, resolve));

  if (process.env.NODE_ENV === 'development') {
  }

  // 7. BACKGROUND SERVICES STARTUP
  expirationService.startExpirationService();
}

startServer().catch(_error => {
  // Critical server startup error - always log
});