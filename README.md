# 🚗 Car Rental Backend

A production-ready GraphQL API for car rental services built with Node.js, Apollo Server, Prisma, and PostgreSQL.

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- **Complete Car Rental System**: Bookings, payments, user management, document verification
- **Advanced Security**: Rate limiting, XSS/CSRF protection, account lockout
- **GraphQL API**: Type-safe queries and mutations with Apollo Server
- **OCR Integration**: Automatic document processing for license verification
- **Payment Processing**: Stripe integration with webhook handling
- **File Management**: Cloudinary integration for image uploads
- **Background Services**: Automated booking expiration and cleanup
- **Comprehensive Testing**: Security, rate limiting, and integration tests

## 🏗️ Architecture

### Layered Architecture
```
┌─────────────────┐
│   GraphQL API   │ ← Resolvers (Orchestration Layer)
├─────────────────┤
│  Business Logic │ ← Services (Validation & Business Rules)
├─────────────────┤
│   Data Access   │ ← Repositories (Database Operations)
├─────────────────┤
│    Database     │ ← Prisma ORM + PostgreSQL
└─────────────────┘
```

### Key Components
- **Authentication**: JWT-based with role-based access control
- **Authorization**: Admin/User roles with fine-grained permissions
- **Rate Limiting**: Distributed Redis-based protection
- **Security**: Helmet, CSRF tokens, input sanitization
- **Monitoring**: Structured logging with security event tracking

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **TypeScript** - Type-safe development
- **Apollo Server** - GraphQL server
- **Prisma** - Database ORM
- **PostgreSQL** - Primary database
- **Redis** - Caching & rate limiting

### Security & Quality
- **Helmet** - Security headers
- **express-rate-limit** - Rate limiting
- **bcrypt** - Password hashing
- **JWT** - Token authentication
- **Winston** - Structured logging

### External Services
- **Stripe** - Payment processing
- **Cloudinary** - Image storage
- **Google OCR** - Document processing
- **SendGrid** - Email notifications

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Redis (optional, for production)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Car_Rental_Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run migrate
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:4000/graphql`

## 📚 API Documentation

### GraphQL Playground
Access the interactive GraphQL playground at `http://localhost:4000/graphql`

### Core Operations

#### Authentication
```graphql
# Register new user
mutation Register($input: RegisterInput!) {
  register(input: $input) {
    token
    user {
      id
      email
      firstName
      lastName
    }
  }
}

# Login
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      email
    }
  }
}
```

#### Car Management (Admin)
```graphql
# Get all cars with filtering
query GetCars($filter: CarFilterInput) {
  cars(filter: $filter) {
    id
    model {
      name
      brand {
        name
      }
    }
    pricePerDay
    status
  }
}

# Create new car
mutation CreateCar($input: CreateCarInput!) {
  createCar(input: $input) {
    id
    plateNumber
    status
  }
}
```

#### Bookings
```graphql
# Check car availability
query CheckAvailability($carId: ID!, $startDate: String!, $endDate: String!) {
  checkCarAvailability(carId: $carId, startDate: $startDate, endDate: $endDate) {
    available
    conflictingBookings {
      id
      startDate
      endDate
    }
  }
}

# Create booking
mutation CreateBooking($input: CreateBookingInput!) {
  createBooking(input: $input) {
    id
    status
    totalPrice
  }
}
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server

# Database
npm run generate         # Generate Prisma client
npm run migrate          # Run database migrations
npm run seed             # Seed database with test data

# Testing
npm run test:rate-limiting  # Test rate limiting
npm run test:security       # Test security features
npm run test:xss           # Test XSS protection
npm run test:csrf          # Test CSRF protection

# Utilities
npm run migrate:uploads   # Migrate local uploads to cloud
```

## 🔒 Security

This application implements enterprise-grade security measures. See [SECURITY.md](./SECURITY.md) for comprehensive security documentation.

### Key Security Features
- **Rate Limiting**: Protects against brute force attacks
- **XSS Protection**: Content Security Policy and input sanitization
- **CSRF Protection**: Token-based CSRF prevention
- **Account Lockout**: Progressive lockout for failed attempts
- **Security Headers**: Helmet.js comprehensive protection
- **Input Validation**: Type-safe GraphQL with custom validation

### Security Testing
```bash
# Run all security tests
npm run test:rate-limiting && npm run test:security && npm run test:xss && npm run test:csrf
```

## 🧪 Testing

### Test Categories
- **Security Tests**: Rate limiting, XSS, CSRF protection
- **Integration Tests**: API endpoints and database operations
- **Performance Tests**: Load testing and optimization

### Running Tests
```bash
# Security testing
npm run test:rate-limiting    # Rate limiting functionality
npm run test:security         # Comprehensive security audit
npm run test:xss             # XSS protection validation
npm run test:csrf            # CSRF protection testing

# Individual test execution
npm run dev                   # Start server in background
# Then run tests in another terminal
```

## 🚢 Deployment

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/car_rental"

# Authentication
JWT_SECRET="your-super-secure-jwt-secret-here"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"

# Payments
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# File Storage
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Email
SENDGRID_API_KEY="your-sendgrid-api-key"
FROM_EMAIL="noreply@yourdomain.com"

# Redis (Production)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""

# Application
NODE_ENV="production"
PORT="4000"
FRONTEND_URL="https://yourdomain.com"
```

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set environment variables**
   ```bash
   export NODE_ENV=production
   export DATABASE_URL="postgresql://..."
   # ... other environment variables
   ```

3. **Run database migrations**
   ```bash
   npm run migrate
   ```

4. **Start the production server**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 4000

CMD ["npm", "start"]
```

## 🤝 Contributing

### Development Setup

1. **Fork and clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up local database**: `npm run migrate && npm run seed`
4. **Start development server**: `npm run dev`

### Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Pre-commit hooks**: Automated testing and linting

### Pull Request Process

1. Create a feature branch from `main`
2. Write tests for new functionality
3. Ensure all tests pass: `npm run test:security`
4. Update documentation if needed
5. Submit PR with detailed description

### Commit Convention

```
feat: add new booking cancellation feature
fix: resolve payment webhook timeout issue
docs: update API documentation for car endpoints
security: implement CSRF token validation
```

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@yourdomain.com

## 🙏 Acknowledgments

- Apollo Server for GraphQL implementation
- Prisma for database ORM
- Stripe for payment processing
- Cloudinary for media management
- Google Cloud Vision for OCR capabilities

---

**Built with ❤️ for reliable car rental operations**
