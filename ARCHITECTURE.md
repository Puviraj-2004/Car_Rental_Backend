# 🏗️ System Architecture - Car Rental Backend

Comprehensive technical architecture documentation for the Car Rental GraphQL API.

## 📋 Table of Contents

- [System Overview](#-system-overview)
- [Architecture Patterns](#-architecture-patterns)
- [Component Architecture](#-component-architecture)
- [Data Architecture](#-data-architecture)
- [Security Architecture](#-security-architecture)
- [Performance Architecture](#-performance-architecture)
- [Deployment Architecture](#-deployment-architecture)
- [Monitoring Architecture](#-monitoring-architecture)

## 🌐 System Overview

### Business Context
The Car Rental Backend is a comprehensive GraphQL API that powers a modern car rental platform. It handles user management, vehicle inventory, booking lifecycle, payment processing, and administrative operations.

### Technical Vision
A scalable, secure, and maintainable GraphQL API built with modern JavaScript/TypeScript technologies, following domain-driven design principles and enterprise-grade security practices.

## 🏛️ Architecture Patterns

### 1. Layered Architecture

```
┌─────────────────────────────────────┐
│           PRESENTATION LAYER        │
│  • GraphQL API (Apollo Server)      │
│  • HTTP Middleware                  │
│  • Request/Response Handling        │
└─────────────────────────────────────┘
                   │
┌─────────────────────────────────────┐
│          BUSINESS LOGIC LAYER       │
│  • Services (Business Rules)        │
│  • Domain Models                    │
│  • Business Validation              │
└─────────────────────────────────────┘
                   │
┌─────────────────────────────────────┐
│            DATA ACCESS LAYER        │
│  • Repositories (Data Operations)   │
│  • Database ORM (Prisma)            │
│  • External API Clients             │
└─────────────────────────────────────┘
                   │
┌─────────────────────────────────────┐
│           INFRASTRUCTURE LAYER      │
│  • Database (PostgreSQL)            │
│  • Cache (Redis)                    │
│  • File Storage (Cloudinary)        │
│  • Payment Gateway (Stripe)         │
└─────────────────────────────────────┘
```

### 2. Domain-Driven Design (DDD)

#### Bounded Contexts
- **User Management**: Authentication, profiles, verification
- **Vehicle Management**: Inventory, maintenance, specifications
- **Booking Management**: Reservations, lifecycle, availability
- **Payment Processing**: Transactions, refunds, reconciliation
- **Platform Administration**: Settings, analytics, user management

#### Domain Entities
- **User**: Core identity with roles and verification
- **Car**: Vehicle with specifications and status
- **Booking**: Reservation with lifecycle states
- **Payment**: Financial transactions
- **Document**: Verification and compliance

### 3. CQRS Pattern (Partial Implementation)

#### Command Side (Mutations)
- **CreateBooking**: Business logic validation
- **UpdatePayment**: Payment processing
- **VerifyUser**: Document verification
- **AdminActions**: Administrative operations

#### Query Side (Queries)
- **GetBookings**: Optimized read operations
- **SearchCars**: Filtered vehicle queries
- **UserDashboard**: Aggregated user data
- **AdminReports**: Business intelligence

### 4. Repository Pattern

```typescript
interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findMany(filter: any): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}
```

## 🧩 Component Architecture

### Core Components

#### 1. GraphQL Layer
```
📁 graphql/
├── 📁 resolvers/
│   ├── userResolvers.ts      # User operations
│   ├── carResolvers.ts       # Vehicle operations
│   ├── bookingResolvers.ts   # Reservation operations
│   ├── paymentResolvers.ts   # Payment operations
│   └── platformResolvers.ts  # Admin operations
├── 📁 typeDefs/
│   ├── userTypeDefs.ts       # User GraphQL schema
│   ├── carTypeDefs.ts        # Vehicle GraphQL schema
│   ├── bookingTypeDefs.ts    # Booking GraphQL schema
│   ├── paymentTypeDefs.ts    # Payment GraphQL schema
│   └── platformTypeDefs.ts   # Platform GraphQL schema
└── 📄 index.ts               # Schema composition
```

#### 2. Service Layer
```
📁 services/
├── userService.ts         # User business logic
├── carService.ts          # Vehicle business logic
├── bookingService.ts      # Reservation business logic
├── paymentService.ts      # Payment business logic
├── platformService.ts     # Platform business logic
├── expirationService.ts   # Background job processing
├── cleanupService.ts      # Data maintenance
├── ocrService.ts          # Document processing
└── notificationService.ts # Communication services
```

#### 3. Repository Layer
```
📁 repositories/
├── userRepository.ts      # User data operations
├── carRepository.ts       # Vehicle data operations
├── bookingRepository.ts   # Reservation data operations
├── paymentRepository.ts   # Payment data operations
└── platformRepository.ts  # Platform data operations
```

#### 4. Infrastructure Layer
```
📁 utils/
├── database.ts           # Database connection
├── auth.ts              # Authentication utilities
├── cloudinary.ts        # File storage client
├── sendEmail.ts         # Email service
├── validation.ts        # Data validation
├── securityLogger.ts    # Security event logging
└── pricing.ts           # Business calculations
```

### Cross-Cutting Concerns

#### Middleware Architecture
```typescript
📁 middleware/
├── rateLimiter.ts        # Rate limiting
├── csrfProtection.ts     # CSRF protection
├── authMiddleware.ts     # Authentication guards
├── roleMiddleware.ts     # Authorization guards
└── validation.ts         # Input validation
```

#### Error Handling
```typescript
📁 errors/
└── AppError.ts          # Centralized error handling
```

## 💾 Data Architecture

### Database Schema Design

#### Core Tables
```sql
-- Users and Authentication
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  password_hash VARCHAR,
  role user_role,
  email_verified_at TIMESTAMP,
  created_at TIMESTAMP
)

-- Vehicle Inventory
cars (
  id UUID PRIMARY KEY,
  model_id UUID REFERENCES vehicle_models(id),
  plate_number VARCHAR UNIQUE,
  status car_status,
  price_per_day DECIMAL,
  deposit_amount DECIMAL,
  created_at TIMESTAMP
)

-- Bookings and Reservations
bookings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  car_id UUID REFERENCES cars(id),
  start_date DATE,
  end_date DATE,
  status booking_status,
  total_price DECIMAL,
  created_at TIMESTAMP
)

-- Payment Transactions
payments (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  amount DECIMAL,
  status payment_status,
  stripe_id VARCHAR,
  created_at TIMESTAMP
)
```

### Indexing Strategy

#### Performance Indexes
```sql
-- Query optimization indexes
CREATE INDEX idx_bookings_status_dates ON bookings(status, start_date, end_date);
CREATE INDEX idx_bookings_user_status ON bookings(user_id, status);
CREATE INDEX idx_cars_status ON cars(status);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Foreign key indexes
CREATE INDEX idx_bookings_car_id ON bookings(car_id);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);
```

### Data Relationships

#### Entity Relationships
```
User (1) ──── (N) Booking
User (1) ──── (1) DocumentVerification
Car (1) ──── (N) Booking
Car (1) ──── (N) CarImage
Booking (1) ──── (1) Payment
Booking (1) ──── (1) BookingVerification
Brand (1) ──── (N) VehicleModel
VehicleModel (1) ──── (N) Car
```

### Data Flow Architecture

#### Write Operations (Mutations)
```
Client Request → GraphQL Resolver → Service Layer → Repository → Database
                                      ↓
                               Validation & Business Logic
```

#### Read Operations (Queries)
```
Client Request → GraphQL Resolver → Repository → Database → Response
                                      ↓
                               Data Transformation & Filtering
```

## 🔒 Security Architecture

### Authentication Flow
```
1. Client sends JWT token
2. Middleware validates token
3. User context attached to request
4. Resolver checks permissions
5. Service executes business logic
6. Repository accesses data
```

### Authorization Matrix
```typescript
const PERMISSIONS = {
  USER: ['read_own_profile', 'create_booking', 'read_own_bookings'],
  ADMIN: ['*', 'manage_users', 'manage_cars', 'manage_bookings']
};
```

### Security Layers
1. **Network Layer**: HTTPS, SSL/TLS
2. **Transport Layer**: Rate limiting, request validation
3. **Application Layer**: Authentication, authorization, input validation
4. **Data Layer**: Parameterized queries, access controls
5. **Monitoring Layer**: Security event logging, anomaly detection

## ⚡ Performance Architecture

### Caching Strategy

#### Redis Cache Layers
```typescript
// Session caching
user_sessions: { userId: string, sessionData: object }

// Rate limiting
rate_limits: { ip: string, requests: number, resetTime: number }

// Application cache
car_availability: { carId: string, availableDates: Date[] }
user_bookings: { userId: string, bookings: Booking[] }
```

### Database Optimization

#### Connection Pooling
```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Connection pool configuration
  connection: {
    pool: {
      max: 20,
      min: 5,
      idle: 30000
    }
  }
});
```

#### Query Optimization
- **N+1 Query Prevention**: Prisma `include` for relations
- **Pagination**: Cursor-based pagination for large datasets
- **Selective Loading**: Only load required fields
- **Index Usage**: Strategic indexing for common queries

### API Performance

#### Response Optimization
```typescript
// GraphQL query optimization
const GET_BOOKINGS = gql`
  query GetBookings($userId: ID!, $first: Int) {
    bookings(userId: $userId, first: $first) {
      edges {
        node {
          id
          startDate
          endDate
          car {
            id
            model
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
```

## 🚀 Deployment Architecture

### Infrastructure Components

#### Production Stack
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   API Gateway    │    │   Application   │
│     (Nginx)     │────│   (Apollo)       │────│   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                    ┌─────────────────┐
                    │   Database      │
                    │  (PostgreSQL)   │
                    └─────────────────┘
```

#### Scaling Strategy
- **Horizontal Scaling**: Multiple application instances
- **Database Sharding**: Data partitioning for growth
- **CDN Integration**: Static asset delivery
- **Microservices Ready**: Modular architecture for future splitting

### Containerization
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build

EXPOSE 4000
CMD ["npm", "start"]
```

## 📊 Monitoring Architecture

### Observability Stack

#### Application Metrics
```typescript
// Key performance indicators
const METRICS = {
  requestDuration: new Histogram(),
  requestCount: new Counter(),
  errorCount: new Counter(),
  activeConnections: new Gauge(),
  databaseQueryDuration: new Histogram()
};
```

#### Health Checks
```typescript
// Application health endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: checkDatabaseHealth(),
      redis: checkRedisHealth(),
      externalAPIs: checkExternalAPIs()
    },
    metrics: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    }
  };

  res.json(health);
});
```

### Logging Architecture

#### Structured Logging
```typescript
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

#### Log Categories
- **Application Logs**: Business logic events
- **Security Logs**: Authentication, authorization events
- **Error Logs**: Application errors and exceptions
- **Performance Logs**: Slow queries, high memory usage
- **Audit Logs**: Administrative actions

## 🔧 Development Architecture

### Code Organization
```
📁 src/
├── 📁 graphql/           # GraphQL schema and resolvers
├── 📁 services/          # Business logic layer
├── 📁 repositories/      # Data access layer
├── 📁 middleware/        # Cross-cutting concerns
├── 📁 utils/            # Shared utilities
├── 📁 types/            # TypeScript type definitions
├── 📁 scripts/          # Development and testing scripts
└── 📄 index.ts          # Application entry point
```

### Testing Strategy

#### Test Pyramid
```
┌─────────────┐  End-to-End Tests (5%)
│   E2E       │  • Full user workflows
│   Tests     │  • API integration
└─────────────┘

┌─────────────┐  Integration Tests (20%)
│Integration │  • Service layer testing
│   Tests    │  • Database operations
└─────────────┘

┌─────────────┐  Unit Tests (75%)
│   Unit     │  • Individual functions
│   Tests    │  • Utility functions
│            │  • Business logic
└─────────────┘
```

#### Test Categories
- **Security Tests**: Rate limiting, XSS, CSRF protection
- **Business Logic Tests**: Service layer validation
- **Data Access Tests**: Repository layer operations
- **Integration Tests**: End-to-end API workflows
- **Performance Tests**: Load testing and benchmarking

## 📈 Scalability Architecture

### Horizontal Scaling
```javascript
// PM2 cluster configuration
module.exports = {
  apps: [{
    name: 'car-rental-api',
    script: 'dist/index.js',
    instances: 'max', // Use all CPU cores
    exec_mode: 'cluster',
    env: { NODE_ENV: 'production' }
  }]
};
```

### Database Scaling
- **Read Replicas**: Separate read and write workloads
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Index usage and query planning
- **Caching Strategy**: Redis for frequently accessed data

### API Scaling
- **Rate Limiting**: Protect against abuse
- **Request Batching**: GraphQL query batching
- **Response Compression**: Gzip compression
- **CDN Integration**: Static asset delivery

## 🔄 Evolution Architecture

### Future Considerations

#### Microservices Migration Path
```
Current: Monolithic GraphQL API
Phase 1: Extract services to separate modules
Phase 2: API Gateway + Service Registry
Phase 3: Independent service deployment
Phase 4: Event-driven architecture
```

#### API Versioning Strategy
```typescript
// URL-based versioning
app.use('/v1/graphql', v1Router);
app.use('/v2/graphql', v2Router);

// Header-based versioning
const apiVersion = req.headers['api-version'] || 'v1';
```

#### Feature Flags
```typescript
const FEATURES = {
  NEW_BOOKING_FLOW: process.env.ENABLE_NEW_BOOKING_FLOW === 'true',
  ADVANCED_SEARCH: process.env.ENABLE_ADVANCED_SEARCH === 'true',
  PREMIUM_FEATURES: process.env.ENABLE_PREMIUM_FEATURES === 'true'
};
```

## 📚 Documentation Architecture

### Living Documentation
- **README.md**: Project overview and setup
- **API.md**: Complete API reference
- **SECURITY.md**: Security features and practices
- **DEPLOYMENT.md**: Production deployment guide
- **ARCHITECTURE.md**: Technical architecture (this file)

### Code Documentation
- **JSDoc Comments**: Function and class documentation
- **TypeScript Types**: Self-documenting type definitions
- **Inline Comments**: Complex business logic explanations
- **Architecture Decision Records**: Major design decisions

---

## 🎯 Architecture Principles

### SOLID Principles
- **Single Responsibility**: Each layer has one concern
- **Open/Closed**: Extensible without modification
- **Liskov Substitution**: Interface compatibility
- **Interface Segregation**: Minimal interfaces
- **Dependency Inversion**: Abstractions over concretions

### Clean Architecture
- **Independent of Frameworks**: Business logic isolated
- **Testable**: Dependencies easily mockable
- **Independent of UI**: No presentation logic in business layer
- **Independent of Database**: Data access abstracted
- **Independent of External Agencies**: External services abstracted

### Security by Design
- **Defense in Depth**: Multiple security layers
- **Fail-Safe Defaults**: Secure defaults over convenience
- **Least Privilege**: Minimum required permissions
- **Zero Trust**: Every request validated
- **Audit Trail**: All actions logged

---

*This architecture provides a solid foundation for a scalable, secure, and maintainable car rental platform.*

*Last updated: January 2026*
*Architecture Version: 2.0*
