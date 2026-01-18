"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformTypeDefs = void 0;
const graphql_tag_1 = require("graphql-tag");
exports.platformTypeDefs = (0, graphql_tag_1.gql) `
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
//# sourceMappingURL=platformTypeDefs.js.map