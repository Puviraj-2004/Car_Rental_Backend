import { gql } from 'graphql-tag';

export const platformTypeDefs = gql`
  # --- Types ---
  type PlatformSettings {
    id: ID!
    companyName: String!
    supportEmail: String
    supportPhone: String
    address: String
    taxPercentage: Float!
    currency: String!
    youngDriverMinAge: Int!
    youngDriverFee: Float!
    updatedAt: String!
  }

  # --- Inputs ---
  input UpdatePlatformSettingsInput {
    companyName: String
    supportEmail: String
    supportPhone: String
    address: String
    taxPercentage: Float
    currency: String
    youngDriverMinAge: Int
    youngDriverFee: Float
  }

  # --- Queries ---
  type Query {
    platformSettings: PlatformSettings!
    auditLogs(userId: ID, limit: Int, offset: Int): [JSON!]!
  }

  # --- Mutations ---
  type Mutation {
    updatePlatformSettings(input: UpdatePlatformSettingsInput!): PlatformSettings!

    # Admin Operations
    cleanupExpiredVerifications: Boolean!
    cleanupOldCompletedBookings: Boolean!
    getCleanupStats: JSON
    triggerExpirationCheck: Boolean!
    getExpirationStats: JSON
  }
`;