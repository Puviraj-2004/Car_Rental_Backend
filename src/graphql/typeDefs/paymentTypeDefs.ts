import { gql } from 'graphql-tag';

export const paymentTypeDefs = gql`
  type Payment {
    id: ID!
    bookingId: ID!
    amount: Float!
    baseAmount: Float!
    taxAmount: Float!
    currency: String!
    status: String!
    paymentMethod: String
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
    paymentMethod: String
    transactionId: String
  }

  input UpdatePaymentStatusInput {
    id: ID!
    status: String!
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
