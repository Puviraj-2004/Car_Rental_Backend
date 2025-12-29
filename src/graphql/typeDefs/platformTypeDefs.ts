import { gql } from 'graphql-tag';

export const platformTypeDefs = gql`
  scalar JSON

  # --- Types ---
  type PlatformSettings {
    id: ID!
    companyName: String!
    description: String

    # Visuals
    logoUrl: String
    logoPublicId: String

    # Contact Info
    supportEmail: String
    supportPhone: String
    address: String         # ✅ Added

    # Social Media Links    # ✅ Added
    facebookUrl: String
    twitterUrl: String
    instagramUrl: String
    linkedinUrl: String

    # Driver Policies
    youngDriverMinAge: Int
    youngDriverFee: Float
    noviceLicenseYears: Int

    # Legal & Finance
    termsAndConditions: String
    privacyPolicy: String
    currency: String!
    taxPercentage: Float!

    updatedAt: String!
  }

  type AuditLog {
    id: ID!
    userId: ID!
    user: User
    action: String!
    details: JSON
    createdAt: String!
  }

  type CleanupResult {
    success: Boolean!
    message: String!
    deletedCount: Int!
  }

  type CleanupStats {
    expiredVerificationTokens: Int!
    bookingsWithoutValidVerification: Int!
    oldCompletedBookings: Int!
    totalPendingCleanup: Int!
  }

  type ExpirationStats {
    expiredAwaitingVerification: Int!
    expiredAwaitingPayment: Int!
    totalExpired: Int!
    nextCheckIn: String!
  }

  type ExpirationCheckResult {
    success: Boolean!
    message: String!
    details: JSON
  }

  # --- Inputs ---
  input UpdatePlatformSettingsInput {
    companyName: String
    description: String
    logoUrl: String
    logoPublicId: String

    supportEmail: String
    supportPhone: String
    address: String         # ✅ Added

    facebookUrl: String     # ✅ Added
    twitterUrl: String      # ✅ Added
    instagramUrl: String    # ✅ Added
    linkedinUrl: String     # ✅ Added

    youngDriverMinAge: Int
    youngDriverFee: Float
    noviceLicenseYears: Int

    termsAndConditions: String
    privacyPolicy: String
    currency: String
    taxPercentage: Float
  }

  # --- Queries ---
  type Query {
    # Public: Anyone can fetch settings (Footer/Header)
    platformSettings: PlatformSettings!
    
    # Admin Only: View history
    auditLogs(limit: Int, offset: Int): [AuditLog!]! 
  }

  # --- Mutations ---
  type Mutation {
    # Admin Only: Update settings
    updatePlatformSettings(input: UpdatePlatformSettingsInput!): PlatformSettings!

    # Admin Only: Database cleanup operations
    cleanupExpiredVerifications: CleanupResult!
    cleanupOldCompletedBookings(daysOld: Int): CleanupResult!
    getCleanupStats: CleanupStats!

    # Admin Only: Booking expiration management
    triggerExpirationCheck: ExpirationCheckResult!
    getExpirationStats: ExpirationStats!
  }
`;