"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentTypeDefs = void 0;
const graphql_tag_1 = require("graphql-tag");
exports.paymentTypeDefs = (0, graphql_tag_1.gql) `
  scalar JSON 

  enum PaymentStatus {
    PENDING
    COMPLETED
    FAILED
    REFUNDED
  }

  enum PaymentMethod {
    CREDIT_CARD
    DEBIT_CARD
    PAYPAL
    STRIPE
    BANK_TRANSFER
  }

  type Payment {
    id: ID!
    bookingId: ID!
    booking: Booking!
    
    amount: Float!
    currency: String!
    status: PaymentStatus!
    paymentMethod: PaymentMethod
    transactionId: String
    metadata: JSON # Stores extra response data from Stripe/Paypal
    
    createdAt: String!
    updatedAt: String!
  }

  input CreatePaymentInput {
    bookingId: ID!
    amount: Float!
    currency: String
    paymentMethod: PaymentMethod
    transactionId: String
    metadata: JSON
  }

  input UpdatePaymentStatusInput {
    id: ID!
    status: PaymentStatus!
    transactionId: String
  }

  type Query {
    payments: [Payment!]!
    payment(id: ID!): Payment
    bookingPayment(bookingId: ID!): Payment
  }

  type Mutation {
    createPayment(input: CreatePaymentInput!): Payment!
    updatePaymentStatus(input: UpdatePaymentStatusInput!): Payment!
  }
`;
//# sourceMappingURL=paymentTypeDefs.js.map