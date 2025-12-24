import { gql } from 'graphql-tag';

export const bookingTypeDefs = gql`
  # --- Enums ---
  enum RentalType {
    HOUR
    KM
    DAY
  }

  enum BookingStatus {
    PENDING
    CONFIRMED
    CANCELLED
    COMPLETED
  }

  # --- Types ---
  type Booking {
    id: ID!
    userId: ID!
    user: User!
    carId: ID!
    car: Car!
    startDate: String
    endDate: String
    totalPrice: Float!
    basePrice: Float!
    taxAmount: Float!
    rentalType: RentalType!
    rentalValue: Float! # Hours for HOUR, KM for KM, Days for DAY
    status: BookingStatus!
    pickupLocation: String
    dropoffLocation: String
    createdAt: String!
    updatedAt: String!
    payment: Payment
  }

  # --- Inputs ---
  input CreateBookingInput {
    userId: ID!      # User ID கட்டாயம் தேவை
    carId: ID!
    startDate: String
    endDate: String
    totalPrice: Float!
    basePrice: Float!
    taxAmount: Float!
    rentalType: RentalType!
    rentalValue: Float!
    pickupLocation: String
    dropoffLocation: String
  }

  input UpdateBookingStatusInput {
    id: ID!
    status: BookingStatus!
  }

  # --- Queries ---
  type Query {
    bookings: [Booking!]!
    booking(id: ID!): Booking
    userBookings(userId: ID!): [Booking!]!
    carBookings(carId: ID!): [Booking!]!
    # 🚀 Resolver-ல் இருந்த 'myBookings' இங்கே சேர்க்கப்பட்டுள்ளது
    myBookings: [Booking!]!
  }

  # --- Mutations ---
  type Mutation {
    createBooking(input: CreateBookingInput!): Booking!
    # Status அப்டேட் செய்ய input ஆப்ஜெக்ட் பயன்படுத்துமாறு மாற்றப்பட்டுள்ளது
    updateBookingStatus(id: ID!, status: BookingStatus!): Booking!
    cancelBooking(id: ID!): Boolean!
    deleteBooking(id: ID!): Boolean!
  }
`;