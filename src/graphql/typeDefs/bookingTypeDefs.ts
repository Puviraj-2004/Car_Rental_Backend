import { gql } from 'graphql-tag';

export const bookingTypeDefs = gql`
  type Booking {
    id: ID!
    user: User!
    car: Car!
    startDate: String # Only required for DAY rentals
    endDate: String # Only required for DAY rentals
    totalPrice: Float!
    basePrice: Float!
    taxAmount: Float!
    rentalType: RentalType!
    rentalValue: Float! # Hours for HOUR, KM for KM, Days for DAY
    status: String!
    pickupLocation: String
    dropoffLocation: String
    createdAt: String!
    updatedAt: String!
    payment: Payment
  }

  enum RentalType {
    HOUR
    KM
    DAY
  }

  input CreateBookingInput {
    carId: ID!
    startDate: String # Only required for DAY rentals
    endDate: String # Only required for DAY rentals
    rentalType: RentalType!
    rentalValue: Float!
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