"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userTypeDefs = void 0;
// backend/src/graphql/typeDefs/userTypeDefs.ts
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
    A
    B
    C
    D
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
    userId: ID!
    user: User!

    # Documents
    licenseFrontUrl: String
    licenseBackUrl: String
    idCardUrl: String
    addressProofUrl: String

    # Extracted Data
    licenseNumber: String
    licenseExpiry: String
    licenseCategory: LicenseCategory
    idNumber: String
    idExpiry: String

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
    verification: DocumentVerification
    bookings: [Booking!]
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
    message: String
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
    licenseFrontUrl: String
    licenseBackUrl: String
    idCardUrl: String
    addressProofUrl: String
    
    licenseNumber: String
    licenseExpiry: String
    licenseCategory: LicenseCategory
    idNumber: String
    idExpiry: String
  }

  # --- Queries ---
  type Query {
    me: User
    user(id: ID!): User
    users: [User!]!
    myVerification: DocumentVerification
    availableCars(startDate: String!, endDate: String!): [Car!]!
    checkCarAvailability(carId: ID!, startDate: String!, endDate: String!): CarAvailability!
    bookingPayment(bookingId: ID!): JSON
  }

  # --- Mutations ---
  type Mutation {
    # Authentication
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    googleLogin(idToken: String!): AuthPayload!
    
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
    updatePaymentStatus(bookingId: ID!, status: String!): JSON
  }
`;
//# sourceMappingURL=userTypeDefs.js.map