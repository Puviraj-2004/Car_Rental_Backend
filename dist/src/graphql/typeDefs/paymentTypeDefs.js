"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentTypeDefs = void 0;
const graphql_tag_1 = require("graphql-tag");
exports.paymentTypeDefs = (0, graphql_tag_1.gql) `
  scalar JSON 

  enum PaymentStatus {
    PENDING
    SUCCEEDED
    FAILED
    REFUNDED
  }

  type Payment {
    id: ID!
    bookingId: ID!
    booking: Booking!
    amount: Float!
    status: PaymentStatus!
    stripeId: String
    createdAt: String!
    updatedAt: String!
  }

  type StripeCheckoutSession {
    url: String!
    sessionId: String!
  }

  input CreatePaymentInput {
    bookingId: ID!
    amount: Float!
    status: PaymentStatus!
    stripeId: String
  }

  input UpdatePaymentInput {
    amount: Float
    status: PaymentStatus
    stripeId: String
  }

  type Query {
    payments: [Payment!]!
    payment(id: ID!): Payment
  }

  type Mutation {
    createPayment(input: CreatePaymentInput!): Payment!
    updatePayment(id: ID!, input: UpdatePaymentInput!): Payment!
    createStripeCheckoutSession(bookingId: ID!): StripeCheckoutSession!
    mockFinalizePayment(bookingId: ID!, success: Boolean!): Payment!
  }
`;
//# sourceMappingURL=paymentTypeDefs.js.map