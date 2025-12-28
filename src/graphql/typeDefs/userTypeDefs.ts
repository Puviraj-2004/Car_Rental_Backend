// backend/src/graphql/typeDefs/userTypeDefs.ts
import { gql } from 'graphql-tag';

export const userTypeDefs = gql`
  # --- Enums ---
  enum Role {
    USER
    ADMIN
    SUPPORT
  }

  enum VerificationStatus {
    NOT_UPLOADED
    PENDING_REVIEW
    VERIFIED_BY_AI
    VERIFIED_BY_ADMIN
    REJECTED
  }

  # --- Types ---
  type DriverProfile {
    id: ID!
    userId: ID!
    licenseNumber: String
    licenseIssueDate: String
    licenseExpiry: String
    idProofNumber: String
    address: String
    dateOfBirth: String
    licenseFrontUrl: String
    licenseBackUrl: String
    idProofUrl: String
    addressProofUrl: String
    licenseFrontPublicId: String
    licenseBackPublicId: String
    idProofPublicId: String
    addressProofPublicId: String
    status: VerificationStatus!
    verificationNote: String
    createdAt: String!
    updatedAt: String!
  }

  type User {
    id: ID!
    username: String!      # ✅ Added username
    email: String!
    phoneNumber: String!   # ✅ Changed to Required (!)
    role: Role!
    isEmailVerified: Boolean!
    googleId: String
    createdAt: String!
    updatedAt: String!
    
    # Relations
    driverProfile: DriverProfile
    bookings: [Booking!]
  }

  type AuthPayload {
    token: String!
    user: User!
    message: String
  }

  type VerifyResponse {
    success: Boolean!
    message: String!
  }

  # --- Inputs ---
  # ✅ RegisterInput simplified as per your request
  input RegisterInput {
    username: String!      # ✅ Added
    email: String!
    password: String!
    phoneNumber: String!   # ✅ Required
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    username: String       # ✅ Updated
    phoneNumber: String
  }

  input DriverProfileInput {
    licenseNumber: String
    licenseIssueDate: String
    licenseExpiry: String
    idProofNumber: String
    address: String
    dateOfBirth: String
    licenseFrontUrl: String
    licenseFrontPublicId: String
    licenseBackUrl: String
    licenseBackPublicId: String
    idProofUrl: String
    idProofPublicId: String
    addressProofUrl: String
    addressProofPublicId: String
  }

  # --- Queries ---
  type Query {
    me: User
    user(id: ID!): User
    users: [User!]!
    myDriverProfile: DriverProfile
  }

  # --- Mutations ---
  type Mutation {
    # Authentication
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    
    # OTP Verification
    verifyOTP(email: String!, otp: String!): VerifyResponse!
    
    # Google Auth (NextAuth Bridge)
    googleLogin(idToken: String!): AuthPayload!
    # Facebook Login    
    # Facebook Auth (NextAuth Bridge)
    facebookLogin(accessToken: String!): AuthPayload!
    
    # User Management
    updateUser(input: UpdateUserInput!): User!
    updateUserRole(id: ID!, role: Role!): User!
    deleteUser(id: ID!): Boolean!
    
    # Driver Profile & KYC
    createOrUpdateDriverProfile(input: DriverProfileInput!): DriverProfile!
    verifyDriverProfile(userId: ID!, status: VerificationStatus!, note: String): DriverProfile!
  }
`;