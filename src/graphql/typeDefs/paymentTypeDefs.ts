import { gql } from 'graphql-tag';

export const paymentTypeDefs = gql`
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
    amount: Float!
    baseAmount: Float!
    taxAmount: Float!
    currency: String!
    status: PaymentStatus!
    paymentMethod: PaymentMethod
    transactionId: String
    createdAt: String!
    updatedAt: String!
    booking: Booking!
  }

  input CreatePaymentInput {
    bookingId: ID!
    amount: Float!
    baseAmount: Float!
    taxAmount: Float!
    currency: String
    paymentMethod: PaymentMethod
    transactionId: String
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
