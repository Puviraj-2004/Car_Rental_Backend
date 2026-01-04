"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingTypeDefs = void 0;
const graphql_tag_1 = require("graphql-tag");
exports.bookingTypeDefs = (0, graphql_tag_1.gql) `
  # --- Enums ---
  enum BookingType {
    RENTAL
    REPLACEMENT
  }

  enum BookingStatus {
    DRAFT
    PENDING
    VERIFIED
    CONFIRMED
    ONGOING
    COMPLETED
    CANCELLED
    RESERVED
    EXPIRED
  }

  # --- Types ---
  type Booking {
    id: ID!
    userId: ID!
    user: User!
    carId: ID!
    car: Car!
    startDate: String!
    endDate: String!
    pickupTime: String
    returnTime: String
    basePrice: Float
    taxAmount: Float
    surchargeAmount: Float
    depositAmount: Float
    startOdometer: Float
    endOdometer: Float
    damageFee: Float
    extraKmFee: Float
    returnNotes: String
    totalPrice: Float
    bookingType: BookingType!
    repairOrderId: String
    status: BookingStatus!
    createdAt: String!
    updatedAt: String!
    payment: Payment
    verification: BookingVerification
  }

  type BookingVerification {
    id: ID!
    token: String!
    expiresAt: String!
    isVerified: Boolean!
    verifiedAt: String
    createdAt: String!
    updatedAt: String!
  }

  # --- Inputs ---
  input CreateBookingInput {
    carId: ID!
    startDate: String!
    endDate: String!
    pickupTime: String
    returnTime: String
    basePrice: Float
    taxAmount: Float
    surchargeAmount: Float
    depositAmount: Float
    startOdometer: Float
    damageFee: Float
    extraKmFee: Float
    returnNotes: String
    totalPrice: Float
    bookingType: BookingType
    repairOrderId: String
  }

  input UpdateBookingInput {
    startDate: String
    endDate: String
    pickupTime: String
    returnTime: String
    basePrice: Float
    taxAmount: Float
    surchargeAmount: Float
    depositAmount: Float
    startOdometer: Float
    endOdometer: Float
    damageFee: Float
    extraKmFee: Float
    returnNotes: String
    totalPrice: Float
    bookingType: BookingType
    repairOrderId: String
    status: BookingStatus
  }

  # --- Queries ---
  type Query {
    bookings: [Booking!]!
    booking(id: ID!): Booking
    bookingByToken(token: String!): Booking
    userBookings(userId: ID!): [Booking!]!
    carBookings(carId: ID!): [Booking!]!
    myBookings: [Booking!]!
    checkCarAvailability(carId: ID!, startDate: String!, endDate: String!): CarAvailability
  }

  # --- Mutations ---
  type Mutation {
    createBooking(input: CreateBookingInput!): Booking!
    updateBooking(id: ID!, input: UpdateBookingInput!): Booking!
    updateBookingStatus(id: ID!, status: BookingStatus!): Booking!
    confirmReservation(id: ID!): Booking!
    cancelBooking(id: ID!): Boolean!
    deleteBooking(id: ID!): Boolean!
    
    # New Industrial Flow Mutations
    startTrip(bookingId: ID!): Booking!
    completeTrip(bookingId: ID!): Booking!
    finishCarMaintenance(carId: ID!): Car!
  }
`;
//# sourceMappingURL=bookingTypeDefs.js.map