# ⚙️ Configuration Guide - Car Rental Backend

Complete configuration reference for environment variables and settings.

## 📋 Environment Variables

### Required Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` | ✅ |
| `JWT_SECRET` | JWT signing secret (64+ chars) | `openssl rand -base64 64` | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | `your-cloud` | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | `123456789` | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | `your-secret` | ✅ |

### Application Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `4000` | Server port |
| `FRONTEND_URL` | `http://localhost:3000` | Frontend URL for CORS |

### Authentication & Security

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | JWT signing secret | 64+ character random string |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | From Google Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | From Google Console |

### Payment Processing (Stripe)

| Variable | Environment | Description |
|----------|-------------|-------------|
| `STRIPE_SECRET_KEY` | Both | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Both | Stripe webhook secret |
| `STRIPE_PUBLISHABLE_KEY` | Both | Stripe publishable key |

### File Storage (Cloudinary)

| Variable | Description |
|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

### Email Service (SendGrid)

| Variable | Description |
|----------|-------------|
| `SENDGRID_API_KEY` | SendGrid API key |
| `FROM_EMAIL` | Default sender email |

### OCR Service (Google Cloud Vision)

| Variable | Description |
|----------|-------------|
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON |

### Redis (Optional - Production)

| Variable | Default | Description |
|----------|---------|-------------|
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `REDIS_PASSWORD` | `""` | Redis password |

### Logging & Monitoring

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `info` | Log level (error/warn/info/debug) |

### Security Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `RATE_LIMIT_MAX` | `100` | General API rate limit |
| `AUTH_RATE_LIMIT_MAX` | `5` | Authentication rate limit |
| `UPLOAD_RATE_LIMIT_MAX` | `20` | File upload rate limit |

## 🔧 Configuration Files

### package.json Scripts

```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "npm run build && node dist/index.js",
    "test:security": "ts-node src/scripts/testSecurity.ts",
    "test:rate-limiting": "ts-node src/scripts/testRateLimiting.ts",
    "test:xss": "ts-node src/scripts/testXSS.ts",
    "test:csrf": "ts-node src/scripts/testCSRF.ts"
  }
}
```

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Prisma Configuration

```javascript
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## 🚀 Setup Instructions

### 1. Environment Setup

```bash
# Copy template
cp .env.template .env

# Edit with your values
nano .env
```

### 2. Database Setup

```bash
# Generate Prisma client
npm run generate

# Run migrations
npm run migrate

# Seed database
npm run seed
```

### 3. External Services Setup

#### Stripe Setup
1. Create Stripe account
2. Get API keys from dashboard
3. Configure webhooks for `POST /webhooks/stripe`

#### Cloudinary Setup
1. Create Cloudinary account
2. Get cloud name, API key, and secret
3. Configure upload presets

#### Google Cloud Vision Setup
1. Create Google Cloud project
2. Enable Vision API
3. Create service account and download JSON key
4. Set `GOOGLE_APPLICATION_CREDENTIALS` path

### 4. Development vs Production

#### Development Configuration
```bash
NODE_ENV=development
LOG_LEVEL=debug
MOCK_STRIPE=true
```

#### Production Configuration
```bash
NODE_ENV=production
LOG_LEVEL=warn
REDIS_HOST=your-redis-host
REDIS_PASSWORD=your-secure-password
```

## 🔍 Validation

### Environment Validation

The application validates required environment variables on startup:

```typescript
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'STRIPE_SECRET_KEY',
  'CLOUDINARY_CLOUD_NAME'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}
```

### Configuration Validation

```typescript
// JWT Secret strength validation
if (process.env.JWT_SECRET!.length < 64) {
  throw new Error('JWT_SECRET must be at least 64 characters long');
}

// Database URL validation
const dbUrl = new URL(process.env.DATABASE_URL!);
if (dbUrl.protocol !== 'postgresql:') {
  throw new Error('DATABASE_URL must use PostgreSQL protocol');
}
```

## 🔐 Security Considerations

### Secret Management

- **Never commit secrets** to version control
- **Use environment variables** for all sensitive data
- **Rotate secrets regularly** in production
- **Use different secrets** for different environments

### Database Security

```sql
-- Create separate database user
CREATE USER car_rental_app WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE car_rental_prod TO car_rental_app;
GRANT USAGE ON SCHEMA public TO car_rental_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO car_rental_app;
```

### Network Security

- **Use HTTPS** in production
- **Restrict database access** to application servers only
- **Configure firewall rules** for Redis access
- **Use VPC/security groups** in cloud environments

## 📊 Monitoring Configuration

### Health Checks

```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  });
});
```

### Performance Monitoring

```typescript
// Response time logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) { // Log slow requests
      console.log(`${req.method} ${req.path} took ${duration}ms`);
    }
  });
  next();
});
```

## 🔄 Configuration Management

### Configuration Patterns

```typescript
// Centralized configuration
export const config = {
  app: {
    port: parseInt(process.env.PORT || '4000'),
    env: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production'
  },
  database: {
    url: process.env.DATABASE_URL!,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX || '20'),
      min: parseInt(process.env.DB_POOL_MIN || '5')
    }
  },
  security: {
    jwtSecret: process.env.JWT_SECRET!,
    rateLimits: {
      general: parseInt(process.env.RATE_LIMIT_MAX || '100'),
      auth: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5')
    }
  }
};
```

### Feature Flags

```typescript
export const features = {
  advancedSearch: process.env.ENABLE_ADVANCED_SEARCH === 'true',
  premiumFeatures: process.env.ENABLE_PREMIUM_FEATURES === 'true',
  maintenanceMode: process.env.ENABLE_MAINTENANCE_MODE === 'true'
};
```

## 🚨 Troubleshooting

### Common Configuration Issues

#### Database Connection Failed
```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Test database connection
psql $DATABASE_URL -c "SELECT 1"

# Check PostgreSQL service
sudo systemctl status postgresql
```

#### JWT Secret Issues
```bash
# Check JWT secret length
echo $JWT_SECRET | wc -c

# Generate new secret
openssl rand -base64 64
```

#### Stripe Webhook Issues
```bash
# Test webhook endpoint
curl -X POST http://localhost:4000/webhooks/stripe \
  -H "Content-Type: application/json" \
  -d '{"type":"test"}'

# Check webhook secret
echo $STRIPE_WEBHOOK_SECRET
```

### Environment-Specific Issues

#### Development Issues
- Check if all services are running locally
- Verify mock settings: `MOCK_STRIPE=true`
- Check CORS settings for frontend

#### Production Issues
- Verify all secrets are set correctly
- Check Redis connectivity
- Verify SSL certificates
- Check reverse proxy configuration

---

*Configuration last updated: January 2026*
