import { gql } from 'graphql-tag';

export const userTypeDefs = gql`
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    phoneNumber: String
    dateOfBirth: String
    address: String
    city: String
    country: String
    postalCode: String
    language: String!
    gdprConsent: Boolean!
    consentDate: String
    createdAt: String!
    updatedAt: String!
    bookings: [Booking!]!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input RegisterInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    phoneNumber: String
    dateOfBirth: String
    address: String
    city: String
    country: String
    postalCode: String
    language: String
    gdprConsent: Boolean!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UpdateUserInput {
    firstName: String
    lastName: String
    phoneNumber: String
    dateOfBirth: String
    address: String
    city: String
    country: String
    postalCode: String
    language: String
  }

  type Query {
    me: User
    user(id: ID!): User
    users: [User!]!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updateUser(input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
  }
`;