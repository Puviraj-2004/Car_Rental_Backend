import { gql } from 'graphql-tag';

export const paymentTypeDefs = gql`
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