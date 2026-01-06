# 📚 Car Rental API Documentation

Complete API reference for the Car Rental GraphQL backend.

## 🎯 GraphQL Endpoint

```
URL: http://localhost:4000/graphql
Method: POST
Content-Type: application/json
```

## 🔐 Authentication

All requests require authentication except for registration and login. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Getting a Token

#### Register
```graphql
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
```

**Variables:**
```json
{
  "input": {
    "email": "user@example.com",
    "password": "securepassword123",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+33123456789"
  }
}
```

#### Login
```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      email
      firstName
      lastName
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "email": "user@example.com",
    "password": "securepassword123"
  }
}
```

## 👤 User Management

### Queries

#### Get Current User
```graphql
query GetCurrentUser {
  me {
    id
    email
    firstName
    lastName
    phoneNumber
    avatarUrl
    dateOfBirth
    fullAddress
    role
    createdAt
    updatedAt
    verification {
      status
      licenseFrontUrl
      licenseBackUrl
      idCardUrl
      addressProofUrl
    }
  }
}
```

#### Get User by ID (Admin Only)
```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    email
    firstName
    lastName
    role
    verification {
      status
    }
  }
}
```

#### List All Users (Admin Only)
```graphql
query GetUsers {
  users {
    id
    email
    firstName
    lastName
    role
    createdAt
  }
}
```

### Mutations

#### Update Current User
```graphql
mutation UpdateUser($input: UpdateUserInput!) {
  updateUser(input: $input) {
    id
    email
    firstName
    lastName
    phoneNumber
    fullAddress
  }
}
```

**Variables:**
```json
{
  "input": {
    "firstName": "John",
    "lastName": "Smith",
    "phoneNumber": "+33123456789",
    "address": "123 Main St",
    "city": "Paris",
    "postalCode": "75001",
    "country": "France"
  }
}
```

#### Delete User (Admin Only)
```graphql
mutation DeleteUser($id: ID!) {
  deleteUser(id: $id) {
    success
    message
  }
}
```

## 🚗 Car Management

### Queries

#### Get All Cars
```graphql
query GetCars($filter: CarFilterInput) {
  cars(filter: $filter) {
    id
    plateNumber
    year
    transmission
    fuelType
    seats
    pricePerDay
    depositAmount
    dailyKmLimit
    extraKmCharge
    currentOdometer
    critAirRating
    status
    model {
      name
      brand {
        name
        logoUrl
      }
    }
    images {
      url
      isPrimary
    }
    createdAt
  }
}
```

**Filter Options:**
```json
{
  "filter": {
    "brandIds": ["brand-uuid-1", "brand-uuid-2"],
    "modelIds": ["model-uuid-1"],
    "fuelTypes": ["PETROL", "DIESEL"],
    "transmissions": ["MANUAL", "AUTOMATIC"],
    "statuses": ["AVAILABLE", "RENTED"],
    "startDate": "2024-01-15",
    "endDate": "2024-01-20"
  }
}
```

#### Get Car by ID
```graphql
query GetCar($id: ID!) {
  car(id: $id) {
    id
    plateNumber
    year
    transmission
    fuelType
    seats
    pricePerDay
    status
    model {
      name
      brand {
        name
      }
    }
    images {
      url
      isPrimary
    }
  }
}
```

#### Check Car Availability
```graphql
query CheckAvailability($carId: ID!, $startDate: String!, $endDate: String!) {
  checkCarAvailability(carId: $carId, startDate: $startDate, endDate: $endDate) {
    available
    conflictingBookings {
      id
      startDate
      endDate
      userId
    }
  }
}
```

### Mutations (Admin Only)

#### Create Car
```graphql
mutation CreateCar($input: CreateCarInput!) {
  createCar(input: $input) {
    id
    plateNumber
    status
  }
}
```

**Variables:**
```json
{
  "input": {
    "modelId": "model-uuid",
    "year": 2023,
    "plateNumber": "AB-123-CD",
    "transmission": "MANUAL",
    "fuelType": "PETROL",
    "seats": 5,
    "pricePerDay": 45.00,
    "depositAmount": 500.00,
    "dailyKmLimit": 200,
    "extraKmCharge": 0.25,
    "critAirRating": "CRIT_AIR_1"
  }
}
```

#### Update Car
```graphql
mutation UpdateCar($id: ID!, $input: UpdateCarInput!) {
  updateCar(id: $id, input: $input) {
    id
    plateNumber
    pricePerDay
    status
  }
}
```

#### Delete Car
```graphql
mutation DeleteCar($id: ID!) {
  deleteCar(id: $id) {
    success
    message
  }
}
```

#### Add Car Image
```graphql
mutation AddCarImage($carId: ID!, $file: Upload!, $isPrimary: Boolean!) {
  addCarImage(carId: $carId, file: $file, isPrimary: $isPrimary) {
    id
    url
    isPrimary
  }
}
```

## 📅 Booking Management

### Queries

#### Get User Bookings
```graphql
query GetMyBookings {
  myBookings {
    id
    startDate
    endDate
    pickupTime
    returnTime
    status
    totalPrice
    basePrice
    taxAmount
    depositAmount
    car {
      id
      plateNumber
      model {
        name
        brand {
          name
        }
      }
      images {
        url
        isPrimary
      }
    }
    payment {
      id
      amount
      status
    }
    createdAt
  }
}
```

#### Get Booking by ID
```graphql
query GetBooking($id: ID!) {
  booking(id: $id) {
    id
    startDate
    endDate
    status
    totalPrice
    car {
      plateNumber
      model {
        name
        brand {
          name
        }
      }
    }
    user {
      id
      firstName
      lastName
      email
    }
  }
}
```

#### Get All Bookings (Admin Only)
```graphql
query GetBookings($filter: BookingFilterInput) {
  bookings(filter: $filter) {
    id
    startDate
    endDate
    status
    totalPrice
    user {
      email
      firstName
      lastName
    }
    car {
      plateNumber
      model {
        name
      }
    }
  }
}
```

### Mutations

#### Create Booking
```graphql
mutation CreateBooking($input: CreateBookingInput!) {
  createBooking(input: $input) {
    id
    status
    totalPrice
    startDate
    endDate
  }
}
```

**Variables:**
```json
{
  "input": {
    "carId": "car-uuid",
    "startDate": "2024-01-15",
    "endDate": "2024-01-18",
    "pickupTime": "10:00",
    "returnTime": "17:00",
    "bookingType": "RENTAL"
  }
}
```

#### Confirm Reservation (Admin Only)
```graphql
mutation ConfirmBooking($id: ID!) {
  confirmReservation(id: $id) {
    id
    status
  }
}
```

#### Start Trip
```graphql
mutation StartTrip($bookingId: ID!) {
  startTrip(bookingId: $bookingId) {
    success
    message
  }
}
```

#### Complete Trip
```graphql
mutation CompleteTrip($bookingId: ID!) {
  completeTrip(bookingId: $bookingId) {
    success
    message
  }
}
```

#### Cancel Booking
```graphql
mutation CancelBooking($id: ID!) {
  cancelBooking(id: $id) {
    success
    message
  }
}
```

#### Update Booking (Admin Only)
```graphql
mutation UpdateBooking($id: ID!, $input: UpdateBookingInput!) {
  updateBooking(id: $id, input: $input) {
    id
    status
    totalPrice
  }
}
```

## 💳 Payment Management

### Queries

#### Get Payment by Booking
```graphql
query GetBookingPayment($bookingId: ID!) {
  bookingPayment(bookingId: $bookingId) {
    id
    amount
    status
    stripeId
    createdAt
  }
}
```

### Mutations

#### Create Stripe Checkout Session
```graphql
mutation CreateCheckoutSession($bookingId: ID!) {
  createStripeCheckoutSession(bookingId: $bookingId) {
    sessionId
    url
  }
}
```

#### Mock Payment (Development Only)
```graphql
mutation MockPayment($bookingId: ID!, $success: Boolean!) {
  mockFinalizePayment(bookingId: $bookingId, success: $success) {
    success
    message
  }
}
```

#### Create Payment
```graphql
mutation CreatePayment($input: CreatePaymentInput!) {
  createPayment(input: $input) {
    id
    amount
    status
  }
}
```

#### Update Payment Status (Admin Only)
```graphql
mutation UpdatePaymentStatus($input: UpdatePaymentInput!) {
  updatePaymentStatus(input: $input) {
    id
    status
  }
}
```

## 🏢 Platform Management (Admin Only)

### Queries

#### Get Platform Settings
```graphql
query GetPlatformSettings {
  platformSettings {
    id
    companyName
    supportEmail
    supportPhone
    address
    taxPercentage
    currency
    youngDriverMinAge
    youngDriverFee
    facebookUrl
    twitterUrl
    instagramUrl
    linkedinUrl
  }
}
```

#### Get Platform Statistics
```graphql
query GetPlatformStats {
  platformStats {
    totalUsers
    totalBookings
    totalRevenue
    activeBookings
    availableCars
  }
}
```

#### Get Audit Logs
```graphql
query GetAuditLogs {
  auditLogs {
    id
    action
    details
    adminId
    createdAt
  }
}
```

### Mutations

#### Update Platform Settings
```graphql
mutation UpdateSettings($input: PlatformSettingsInput!) {
  updatePlatformSettings(input: $input) {
    id
    companyName
    taxPercentage
    currency
  }
}
```

#### Run Cleanup Operations
```graphql
mutation CleanupExpiredVerifications {
  cleanupExpiredVerifications {
    deletedCount
  }
}

mutation CleanupOldBookings($daysOld: Int!) {
  cleanupOldCompletedBookings(daysOld: $daysOld) {
    deletedCount
  }
}
```

#### Trigger Expiration Check
```graphql
mutation TriggerExpiration {
  triggerExpirationCheck {
    processedCount
    expiredCount
  }
}
```

## 📄 Document Verification

### Queries

#### Get User Verification Status
```graphql
query GetVerification {
  myVerification {
    id
    status
    licenseFrontUrl
    licenseBackUrl
    idCardUrl
    addressProofUrl
    licenseNumber
    licenseExpiry
    licenseCategory
    idNumber
    idExpiry
    rejectionReason
    verifiedAt
  }
}
```

### Mutations

#### Upload Verification Documents
```graphql
mutation UploadVerification($input: CreateVerificationInput!) {
  createOrUpdateVerification(input: $input) {
    id
    status
  }
}
```

**Variables:**
```json
{
  "input": {
    "licenseFrontFile": null,
    "licenseBackFile": null,
    "idCardFile": null,
    "addressProofFile": null,
    "licenseCategory": "B",
    "licenseNumber": "123456789",
    "licenseExpiry": "2025-12-31",
    "idNumber": "123456789012",
    "idExpiry": "2030-12-31"
  }
}
```

#### Process OCR (Admin Only)
```graphql
mutation ProcessOCR($file: Upload!, $documentType: String!, $side: String!) {
  processDocumentOCR(file: $file, documentType: $documentType, side: $side) {
    text
    extractedData {
      firstName
      lastName
      documentId
      licenseNumber
    }
  }
}
```

#### Verify Document (Admin Only)
```graphql
mutation VerifyDocument($userId: ID!, $status: VerificationStatus!) {
  verifyDocument(userId: $userId, status: $status) {
    success
    message
  }
}
```

## 🚗 Car Brand & Model Management (Admin Only)

### Queries

#### Get All Brands
```graphql
query GetBrands {
  brands {
    id
    name
    logoUrl
    models {
      id
      name
    }
  }
}
```

#### Get All Models
```graphql
query GetModels {
  models {
    id
    name
    brand {
      name
    }
  }
}
```

#### Get Models by Brand
```graphql
query GetModelsByBrand($brandId: ID!) {
  modelsByBrand(brandId: $brandId) {
    id
    name
  }
}
```

### Mutations

#### Create Brand
```graphql
mutation CreateBrand($input: CreateBrandInput!) {
  createBrand(input: $input) {
    id
    name
  }
}
```

#### Update Brand
```graphql
mutation UpdateBrand($id: ID!, $input: UpdateBrandInput!) {
  updateBrand(id: $id, input: $input) {
    id
    name
    logoUrl
  }
}
```

#### Delete Brand
```graphql
mutation DeleteBrand($id: ID!) {
  deleteBrand(id: $id) {
    success
    message
  }
}
```

#### Create Model
```graphql
mutation CreateModel($input: CreateModelInput!) {
  createModel(input: $input) {
    id
    name
  }
}
```

#### Update Model
```graphql
mutation UpdateModel($id: ID!, $input: UpdateModelInput!) {
  updateModel(id: $id, input: $input) {
    id
    name
  }
}
```

#### Delete Model
```graphql
mutation DeleteModel($id: ID!) {
  deleteModel(id: $id) {
    success
    message
  }
}
```

## 📊 Data Types

### Enums

#### Role
- `USER`
- `ADMIN`

#### CarStatus
- `AVAILABLE`
- `RENTED`
- `MAINTENANCE`
- `OUT_OF_SERVICE`

#### BookingStatus
- `DRAFT`
- `PENDING`
- `VERIFIED`
- `CONFIRMED`
- `ONGOING`
- `COMPLETED`
- `CANCELLED`

#### PaymentStatus
- `PENDING`
- `SUCCEEDED`
- `FAILED`
- `REFUNDED`

#### VerificationStatus
- `NOT_UPLOADED`
- `PENDING`
- `APPROVED`
- `REJECTED`

#### FuelType
- `PETROL`
- `DIESEL`
- `ELECTRIC`
- `HYBRID`
- `LPG`
- `CNG`

#### Transmission
- `MANUAL`
- `AUTOMATIC`
- `CVT`
- `DCT`

#### LicenseCategory
- `AM`, `A1`, `A2`, `A`, `B1`, `B`, `BE`, `C1`, `C`, `C1E`, `CE`, `D1`, `D`, `D1E`, `DE`

#### CritAirCategory
- `CRIT_AIR_0`, `CRIT_AIR_1`, `CRIT_AIR_2`, `CRIT_AIR_3`, `CRIT_AIR_4`, `CRIT_AIR_5`, `NO_STICKER`

### Input Types

#### RegisterInput
```typescript
{
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}
```

#### LoginInput
```typescript
{
  email: string;
  password: string;
}
```

#### UpdateUserInput
```typescript
{
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}
```

#### CreateCarInput
```typescript
{
  modelId: string;
  year: number;
  plateNumber: string;
  transmission: Transmission;
  fuelType?: FuelType;
  seats: number;
  requiredLicense?: LicenseCategory;
  pricePerDay: number;
  depositAmount?: number;
  dailyKmLimit?: number;
  extraKmCharge?: number;
  currentOdometer?: number;
  critAirRating: CritAirCategory;
}
```

#### CreateBookingInput
```typescript
{
  carId: string;
  startDate: string;
  endDate: string;
  pickupTime?: string;
  returnTime?: string;
  bookingType?: BookingType;
}
```

## 🚨 Error Handling

The API uses standardized error responses:

```json
{
  "errors": [
    {
      "message": "Error description",
      "extensions": {
        "code": "ERROR_CODE",
        "details": "Additional error information"
      }
    }
  ]
}
```

### Common Error Codes
- `BAD_USER_INPUT` - Invalid input data
- `UNAUTHENTICATED` - Missing or invalid authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Server error

## 🔒 Rate Limiting

The API implements rate limiting to prevent abuse:

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Registration**: 5 attempts per hour
- **File uploads**: 20 uploads per hour

Rate limited requests return HTTP 429 with:
```json
{
  "error": "Too many requests from this IP, please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": "900"
}
```

## 🧪 Testing

Use the provided test scripts to validate API functionality:

```bash
# Test rate limiting
npm run test:rate-limiting

# Test security features
npm run test:security

# Test XSS protection
npm run test:xss

# Test CSRF protection
npm run test:csrf
```

## 📞 Support

For API support:
- Check the [README.md](README.md) for setup instructions
- Review [SECURITY.md](SECURITY.md) for security features
- Test with the GraphQL Playground at `/graphql`

---

*Last updated: January 2026*
*API Version: 1.0.0*
