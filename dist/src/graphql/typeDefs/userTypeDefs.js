"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userTypeDefs = void 0;
const graphql_tag_1 = require("graphql-tag");
exports.userTypeDefs = (0, graphql_tag_1.gql) `
  # --- Enums ---
  enum Role {
    USER
    ADMIN
  }

  enum VerificationStatus {
    NOT_UPLOADED
    PENDING
    APPROVED
    REJECTED
  }

  enum LicenseCategory {
    AM
    A1
    A2
    A
    B1
    B
    BE
    C1
    C
    C1E
    CE
    D1
    D
    D1E
    DE
  }

  enum DocumentType {
    LICENSE
    ID_CARD
    ADDRESS_PROOF
  }

  enum DocumentSide {
    FRONT
    BACK
  }

  # --- Types ---
  type CarAvailability {
    available: Boolean!
    conflictingBookings: [Booking!]
  }
  type DocumentVerification {
    id: ID!
    bookingId: ID!
    booking: Booking!

    # Documents
    licenseFrontUrl: String
    licenseBackUrl: String
    idCardUrl: String
    idCardBackUrl: String
    addressProofUrl: String

    # Extracted Data
    licenseNumber: String
    licenseExpiry: String
    licenseIssueDate: String
    driverDob: String
    licenseCategories: [LicenseCategory!]
    idNumber: String
    idExpiry: String
    verifiedAddress: String

    status: VerificationStatus!
    aiMetadata: JSON
    rejectionReason: String
    verifiedAt: String
    createdAt: String!
    updatedAt: String!
  }

  type OCRResult {
    firstName: String
    lastName: String
    fullName: String
    documentId: String
    licenseNumber: String
    expiryDate: String
    documentDate: String
    issueDate: String
    birthDate: String
    address: String
    licenseCategory: LicenseCategory
    licenseCategories: [LicenseCategory!]
    restrictsToAutomatic: Boolean
    fallbackUsed: Boolean
    isQuotaExceeded: Boolean
  }

  type User {
    id: ID!
    email: String!
    fullName: String
    password: String
    phoneNumber: String
    avatarUrl: String
    
    # Personal Info
    dateOfBirth: String
    fullAddress: String

    role: Role!
    facebookId: String
    appleId: String
    googleId: String
    bookings: [Booking!]
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
    message: String
  }

  type RegisterPayload {
    message: String!
    email: String!
  }

  # --- Inputs ---
  input RegisterInput {
    email: String!
    fullName: String
    password: String!
    phoneNumber: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    fullName: String
    phoneNumber: String
    avatarUrl: String
    dateOfBirth: String
    fullAddress: String
  }

  input DocumentVerificationInput {
    bookingToken: String
    bookingId: String
    licenseFrontUrl: String
    licenseBackUrl: String
    idCardUrl: String
    idCardBackUrl: String
    addressProofUrl: String

    licenseFrontFile: Upload
    licenseBackFile: Upload
    idCardFile: Upload
    idCardBackFile: Upload
    addressProofFile: Upload
    
    licenseNumber: String
    licenseExpiry: String
    licenseIssueDate: String
    driverDob: String
    licenseCategories: [LicenseCategory]
    idNumber: String
    idExpiry: String
    verifiedAddress: String
  }

  # --- Queries ---
  type Query {
    me: User
    user(id: ID!): User
    users: [User!]!
    myVerification: DocumentVerification
    availableCars(startDate: String!, endDate: String!): [Car!]!
    checkCarAvailability(carId: ID!, startDate: String!, endDate: String!, excludeBookingId: ID): CarAvailability!
    isEmailAvailable(email: String!): Boolean!
    bookingPayment(bookingId: ID!): JSON
  }

  type ResendOTPPayload {
    success: Boolean!
    message: String!
    expiresAt: String
  }

  type VerifyOTPPayload {
    success: Boolean!
    message: String!
  }

  # --- Mutations ---
  type Mutation {
    # Authentication
    register(input: RegisterInput!): RegisterPayload!
    login(input: LoginInput!): AuthPayload!
    googleLogin(idToken: String!): AuthPayload!
    verifyOTP(email: String!, otp: String!): VerifyOTPPayload!
    resendOTP(email: String!): ResendOTPPayload!
    
    # User Management
    updateUser(input: UpdateUserInput!): User!
    updateUserRole(id: ID!, role: Role!): User!
    deleteUser(id: ID!): Boolean!
    
    # Document Verification
    createOrUpdateVerification(input: DocumentVerificationInput!): DocumentVerification!
    verifyDocument(userId: ID!, status: VerificationStatus!, reason: String): DocumentVerification!

    # OCR Processing
    processDocumentOCR(file: Upload!, documentType: DocumentType, side: DocumentSide): OCRResult!

    # Payment Processing
    updatePaymentStatus(bookingId: String!, status: String!): JSON

    
  }
`;
//# sourceMappingURL=userTypeDefs.js.map