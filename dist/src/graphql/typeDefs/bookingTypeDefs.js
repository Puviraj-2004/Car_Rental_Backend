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
  }

  # --- Types ---
  type Booking {
    id: ID!
    userId: ID
    user: User
    carId: ID!
    car: Car!
    startDate: DateTime!
    endDate: DateTime!
    pickupTime: String
    returnTime: String
    basePrice: Float
    taxAmount: Float
    depositAmount: Float
    startOdometer: Float
    endOdometer: Float
    pickupNotes: String
    damageFee: Float
    extraKmFee: Float
    returnNotes: String
    totalPrice: Float
    bookingType: BookingType!
    repairOrderId: String
    createdByAdmin: Boolean!
    isWalkIn: Boolean!
    guestName: String
    guestPhone: String
    guestEmail: String
    status: BookingStatus!
    createdAt: String!
    updatedAt: String!
    payment: Payment
    verification: BookingVerification
    documentVerification: DocumentVerification
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
    startDate: DateTime!
    endDate: DateTime!
    pickupTime: String
    returnTime: String
    basePrice: Float
    taxAmount: Float
    depositAmount: Float
    startOdometer: Float
    damageFee: Float
    extraKmFee: Float
    returnNotes: String
    totalPrice: Float
    bookingType: BookingType
    repairOrderId: String
    isWalkIn: Boolean
    guestName: String
    guestPhone: String
    guestEmail: String
  }

  input UpdateBookingInput {
    startDate: DateTime
    endDate: DateTime
    pickupTime: String
    returnTime: String
    basePrice: Float
    taxAmount: Float
    depositAmount: Float
    startOdometer: Float
    endOdometer: Float
    damageFee: Float
    extraKmFee: Float
    returnNotes: String
    totalPrice: Float
    bookingType: BookingType
    repairOrderId: String
    isWalkIn: Boolean
    guestName: String
    guestPhone: String
    guestEmail: String
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
    checkCarAvailability(carId: ID!, startDate: String!, endDate: String!, excludeBookingId: ID): CarAvailability
  }

  # --- Mutations ---
  type Mutation {
    createBooking(input: CreateBookingInput!): Booking!
    updateBooking(id: ID!, input: UpdateBookingInput!): Booking!
    updateBookingStatus(id: ID!, status: BookingStatus!): Booking!
    confirmReservation(id: ID!): Booking!
    cancelBooking(id: ID!, reason: String): Boolean!
    deleteBooking(id: ID!): Boolean!
    
    # New Industrial Flow Mutations
    startTrip(bookingId: String!, startOdometer: Float, pickupNotes: String): Booking!
    completeTrip(bookingId: String!): Booking!
    finishCarMaintenance(carId: ID!): Car!
  }
`;
//# sourceMappingURL=bookingTypeDefs.js.map