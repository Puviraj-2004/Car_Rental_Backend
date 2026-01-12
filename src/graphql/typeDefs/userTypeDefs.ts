import { gql } from 'graphql-tag';

export const userTypeDefs = gql`
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
    bookingToken: String
    licenseFrontUrl: String
    licenseBackUrl: String
    idCardUrl: String
    addressProofUrl: String

    licenseFrontFile: Upload
    licenseBackFile: Upload
    idCardFile: Upload
    addressProofFile: Upload
    
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
    checkCarAvailability(carId: ID!, startDate: String!, endDate: String!, excludeBookingId: ID): CarAvailability!
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
    updatePaymentStatus(bookingId: String!, status: String!): JSON

    
  }
`;