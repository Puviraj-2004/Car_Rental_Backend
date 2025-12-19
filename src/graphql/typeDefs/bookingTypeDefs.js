"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingTypeDefs = void 0;
const graphql_tag_1 = require("graphql-tag");
exports.bookingTypeDefs = (0, graphql_tag_1.gql) `
  type Booking {
    id: ID!
    user: User!
    car: Car!
    startDate: String!
    endDate: String!
    totalPrice: Float!
    basePrice: Float!
    taxAmount: Float!
    status: String!
    pickupLocation: String
    dropoffLocation: String
    createdAt: String!
    updatedAt: String!
  }

  input CreateBookingInput {
    carId: ID!
    startDate: String!
    endDate: String!
    pickupLocation: String
    dropoffLocation: String
  }

  input UpdateBookingStatusInput {
    id: ID!
    status: String!
  }

  type Query {
    bookings: [Booking!]!
    booking(id: ID!): Booking
    userBookings(userId: ID!): [Booking!]!
    carBookings(carId: ID!): [Booking!]!
  }

  type Mutation {
    createBooking(input: CreateBookingInput!): Booking!
    updateBookingStatus(input: UpdateBookingStatusInput!): Booking!
    cancelBooking(id: ID!): Boolean!
  }
`;
//# sourceMappingURL=bookingTypeDefs.js.map