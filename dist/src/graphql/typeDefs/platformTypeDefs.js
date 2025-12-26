"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformTypeDefs = void 0;
const graphql_tag_1 = require("graphql-tag");
exports.platformTypeDefs = (0, graphql_tag_1.gql) `
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
  }
`;
//# sourceMappingURL=platformTypeDefs.js.map