import { gql } from 'graphql-tag';

export const paymentTypeDefs = gql`
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
    createStripeCheckoutSession(bookingId: String!): StripeCheckoutSession!
    mockFinalizePayment(bookingId: String!, success: Boolean!): Payment!
    refundPayment(paymentId: ID!): Payment!
  }
`;