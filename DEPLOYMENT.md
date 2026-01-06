# 🚢 Deployment Guide - Car Rental Backend

Complete production deployment guide for the Car Rental GraphQL API.

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.0 or higher
- **PostgreSQL**: 13.0 or higher
- **Redis**: 6.0 or higher (optional for development)
- **Memory**: 512MB minimum, 1GB recommended
- **Disk**: 1GB free space

### Network Requirements
- **Inbound**: Port 4000 (configurable)
- **Outbound**: HTTPS access to external services
- **Database**: PostgreSQL connection
- **Redis**: Redis connection (if used)

## 🏗️ Infrastructure Setup

### 1. Server Provisioning

#### AWS EC2 Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install Redis (optional)
sudo apt install redis-server

# Install PM2 for process management
sudo npm install -g pm2
```

#### Docker Setup
```dockerfile
FROM node:18-alpine

# Install system dependencies
RUN apk add --no-cache postgresql-client redis

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Build application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 4000

CMD ["npm", "start"]
```

### 2. Database Setup

#### PostgreSQL Configuration
```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE car_rental_prod;
CREATE USER car_rental_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE car_rental_prod TO car_rental_user;
ALTER USER car_rental_user CREATEDB;

# Exit PostgreSQL
\q
```

#### Database URL Format
```bash
# For production
DATABASE_URL="postgresql://car_rental_user:secure_password_here@localhost:5432/car_rental_prod?schema=public"

# For connection pooling (recommended)
DATABASE_URL="postgresql://car_rental_user:secure_password_here@localhost:5432/car_rental_prod?schema=public&connection_limit=5&pool_timeout=0"
```

### 3. Redis Setup (Production)

```bash
# Configure Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Secure Redis (optional)
sudo nano /etc/redis/redis.conf
# Set: bind 127.0.0.1
# Set: requirepass your_secure_password

sudo systemctl restart redis-server
```

## ⚙️ Application Configuration

### Environment Variables

Create `.env.production` file:

```bash
# ===========================================
# CAR RENTAL BACKEND - PRODUCTION CONFIG
# ===========================================

# Application
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://yourdomain.com

# Database
DATABASE_URL=postgresql://car_rental_user:secure_password_here@localhost:5432/car_rental_prod?schema=public

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_64_chars_minimum_here
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret

# Payments - Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key_here

# File Storage - Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email - SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com

# Redis (for production scaling)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password_if_set

# OCR - Google Cloud Vision
GOOGLE_APPLICATION_CREDENTIALS=/path/to/google-service-account.json

# Security
LOG_LEVEL=warn
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=5

# Monitoring (optional)
SENTRY_DSN=https://your_sentry_dsn_here
DATADOG_API_KEY=your_datadog_api_key
```

### Security Checklist

- [ ] JWT secret is 64+ characters
- [ ] Database password is strong
- [ ] Stripe keys are production keys (not test)
- [ ] Cloudinary credentials are valid
- [ ] Google credentials are properly configured
- [ ] Redis is secured with password
- [ ] No sensitive data in logs

## 🚀 Deployment Process

### 1. Pre-deployment

```bash
# Clone repository
git clone your-repo-url
cd Car_Rental_Backend

# Install dependencies
npm ci --only=production

# Copy environment file
cp .env.production .env

# Build application
npm run build

# Generate Prisma client
npm run generate
```

### 2. Database Migration

```bash
# Run migrations
npm run migrate

# Seed initial data (if needed)
npm run seed

# Verify database connection
npm run prisma:studio # Check data in browser
```

### 3. Application Startup

#### Using PM2 (Recommended)
```bash
# Create PM2 ecosystem file
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'car-rental-api',
    script: 'dist/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_log: './logs/pm2-error.log',
    out_log: './logs/pm2-out.log',
    log_log: './logs/pm2-combined.log',
    time: true
  }]
};
```

```bash
# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

# Check status
pm2 status
pm2 logs car-rental-api
```

#### Using Docker
```bash
# Build Docker image
docker build -t car-rental-api .

# Run container
docker run -d \
  --name car-rental-api \
  -p 4000:4000 \
  --env-file .env \
  -v /path/to/uploads:/app/uploads \
  car-rental-api

# Check logs
docker logs car-rental-api
```

### 4. Reverse Proxy Setup (Nginx)

```bash
# Install Nginx
sudo apt install nginx

# Create site configuration
sudo nano /etc/nginx/sites-available/car-rental-api
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;

    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Rate limiting
    limit_req zone=api burst=20 nodelay;
    limit_req_status 429;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static file caching
    location /uploads/ {
        proxy_pass http://localhost:4000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Rate limiting zone
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/car-rental-api /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 🔍 Post-deployment Verification

### Health Checks

```bash
# Test API endpoint
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'

# Test through Nginx
curl -X POST https://api.yourdomain.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'

# Check PM2 status
pm2 status

# Check application logs
pm2 logs car-rental-api --lines 50
```

### Database Verification

```bash
# Check database connection
npm run prisma:studio

# Verify migrations
npm run prisma:migrate:status

# Check data integrity
# Run some GraphQL queries to verify data
```

### Security Verification

```bash
# Test security headers
curl -I https://api.yourdomain.com/graphql

# Run security tests
npm run test:rate-limiting
npm run test:security

# Check SSL certificate
openssl s_client -connect api.yourdomain.com:443 -servername api.yourdomain.com
```

## 📊 Monitoring & Maintenance

### Application Monitoring

#### PM2 Monitoring
```bash
# Monitor application
pm2 monit

# Check resource usage
pm2 show car-rental-api

# Restart application
pm2 restart car-rental-api

# Reload with zero downtime
pm2 reload car-rental-api
```

#### Log Management
```bash
# View logs
pm2 logs car-rental-api

# Log rotation (configure in ecosystem.config.js)
log_file: './logs/pm2-out.log',
out_file: './logs/pm2-out.log',
error_file: './logs/pm2-error.log',
log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
```

### Database Maintenance

```bash
# Regular backups
pg_dump car_rental_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Optimize database
vacuumdb --analyze car_rental_prod

# Monitor database performance
# Check PostgreSQL logs: /var/log/postgresql/
```

### SSL Certificate Renewal

```bash
# Using Let's Encrypt
sudo certbot --nginx -d api.yourdomain.com

# Manual renewal
sudo certbot renew
```

## 🚨 Troubleshooting

### Common Issues

#### Application Won't Start
```bash
# Check PM2 logs
pm2 logs car-rental-api

# Check environment variables
cat .env | grep -v PASSWORD

# Test database connection
npm run prisma:studio

# Check port availability
netstat -tulpn | grep :4000
```

#### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL

# Check PostgreSQL service
sudo systemctl status postgresql

# Check connection limits
psql -c "SELECT * FROM pg_stat_activity;"
```

#### High Memory Usage
```bash
# Check memory usage
pm2 monit

# Restart application
pm2 restart car-rental-api

# Check for memory leaks
npm install -g clinic
clinic heapprofiler -- node dist/index.js
```

#### Rate Limiting Issues
```bash
# Check Redis connection
redis-cli ping

# Clear rate limit data (development only)
redis-cli FLUSHALL

# Monitor rate limits
redis-cli KEYS "rl:*"
```

### Performance Optimization

#### Database Optimization
```sql
-- Create indexes for common queries
CREATE INDEX CONCURRENTLY idx_bookings_status_date ON bookings(status, start_date);
CREATE INDEX CONCURRENTLY idx_cars_status ON cars(status);
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM bookings WHERE status = 'CONFIRMED';
```

#### Application Optimization
```javascript
// Enable clustering for multi-core systems
// In ecosystem.config.js
instances: 'max', // Use all CPU cores
exec_mode: 'cluster', // Cluster mode
```

## 🔄 Updates & Rollbacks

### Zero-downtime Updates
```bash
# Build new version
git pull origin main
npm run build

# Reload with PM2 (zero downtime)
pm2 reload ecosystem.config.js

# Verify new version
curl -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"query { __typename }"}'
```

### Rollback Procedure
```bash
# Revert code changes
git checkout previous-commit-hash
npm run build

# Reload application
pm2 reload ecosystem.config.js

# Verify rollback
pm2 logs car-rental-api --lines 20
```

## 📞 Support & Monitoring

### Health Check Endpoint
```javascript
// Add to your application
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version
  });
});
```

### Monitoring Tools
- **PM2**: Process monitoring
- **Nginx**: Access logs and error logs
- **PostgreSQL**: Query logs and performance
- **Redis**: Connection and memory monitoring

### Alert Configuration
```bash
# Set up alerts for:
# - Application crashes
# - High memory usage
# - Database connection issues
# - SSL certificate expiration
# - Disk space warnings
```

## 🎯 Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database backups configured
- [ ] Monitoring tools set up
- [ ] Log rotation configured
- [ ] Firewall rules applied
- [ ] Security headers verified
- [ ] Rate limiting tested
- [ ] Health checks passing
- [ ] Backup strategy implemented
- [ ] Rollback procedure tested

---

**Deployment completed successfully!** 🎉

*Monitor your application closely for the first 24-48 hours after deployment.*

---

*Last updated: January 2026*
*Deployment Version: 1.0.0*
