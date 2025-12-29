import { gql } from 'graphql-tag';

export const bookingTypeDefs = gql`
  # --- Enums ---
  enum RentalType {
    HOUR
    DAY
  }

  enum BookingType {
    RENTAL
    REPLACEMENT
  }

  enum BookingStatus {
    DRAFT
    AWAITING_VERIFICATION
    AWAITING_PAYMENT
    CONFIRMED
    ONGOING
    COMPLETED
    CANCELLED
    REJECTED
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

    pickupLocation: String
    dropoffLocation: String

    # Meter Tracking & KM Management
    startMeter: Float
    endMeter: Float
    allowedKm: Float
    extraKmUsed: Float!
    extraKmCharge: Float!

    # Financials
    totalPrice: Float!
    totalFinalPrice: Float
    basePrice: Float!
    taxAmount: Float!
    depositAmount: Float!
    surchargeAmount: Float!
    rentalType: RentalType!
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
    bookingId: ID!
    booking: Booking!
    token: String!
    expiresAt: String!
    isVerified: Boolean!
    verifiedAt: String
    createdAt: String!
  }

  type BookingLinkResponse {
    success: Boolean!
    message: String!
    bookingId: ID!
  }

  type ConfirmBookingResponse {
    success: Boolean!
    message: String!
    booking: Booking!
  }

  type ResendVerificationResponse {
    success: Boolean!
    message: String!
    expiresAt: String!
  }

  # --- Inputs ---
  input CreateBookingInput {
    carId: ID!
    startDate: String!
    endDate: String!

    # KM Management
    allowedKm: Float

    totalPrice: Float!
    basePrice: Float!
    taxAmount: Float!
    depositAmount: Float!
    surchargeAmount: Float!
    rentalType: RentalType!
    bookingType: BookingType
    repairOrderId: String

    pickupLocation: String
    dropoffLocation: String
  }

  # --- Additional Types ---
  type CarAvailabilityCheck {
    available: Boolean!
    conflictingBookings: [Booking!]!
  }

  # --- Queries ---
  type Query {
    bookings: [Booking!]!
    booking(id: ID!): Booking
    userBookings(userId: ID!): [Booking!]!
    carBookings(carId: ID!): [Booking!]!
    myBookings: [Booking!]!
    checkCarAvailability(carId: ID!, startDate: String!, endDate: String!): CarAvailabilityCheck!
  }

  # --- Inputs ---
  input UpdateMeterReadingInput {
    startMeter: Float
    endMeter: Float
  }

  # --- Mutations ---
  type Mutation {
    # Step 1: User creates a draft booking
    createBooking(input: CreateBookingInput!): Booking!

    # Step 2: Confirm DRAFT booking and send verification
    confirmBooking(bookingId: ID!): ConfirmBookingResponse!

    # Resend verification link if previous one expired
    resendVerificationLink(bookingId: ID!): ResendVerificationResponse!

    # Legacy: System sends the verification link (email) for existing bookings
    sendBookingVerificationLink(bookingId: ID!): BookingLinkResponse!

    # Step 3: Verify the token from email (User clicks the link)
    verifyBookingToken(token: String!): BookingLinkResponse!

    # Meter Tracking & KM Management
    updateMeterReadings(bookingId: ID!, input: UpdateMeterReadingInput!): Booking!
    finalizeBookingReturn(bookingId: ID!): Booking!

    # Admin or System updates status
    updateBookingStatus(id: ID!, status: BookingStatus!): Booking!

    cancelBooking(id: ID!): Boolean!
    deleteBooking(id: ID!): Boolean!
  }
`;