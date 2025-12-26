import { gql } from 'graphql-tag';

export const bookingTypeDefs = gql`
  # --- Enums ---
  enum RentalType {
    HOUR
    KM
    DAY
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
    
    # Financials
    totalPrice: Float!
    basePrice: Float!
    taxAmount: Float!
    depositAmount: Float!
    rentalType: RentalType!
    
    status: BookingStatus!
    pickupLocation: String
    dropoffLocation: String
    
    createdAt: String!
    updatedAt: String!
    
    payment: Payment
  }

  type BookingLinkResponse {
    success: Boolean!
    message: String!
    bookingId: ID!
  }

  # --- Inputs ---
  input CreateBookingInput {
    userId: ID! 
    carId: ID!
    startDate: String!
    endDate: String!
    
    totalPrice: Float!
    basePrice: Float!
    taxAmount: Float!
    depositAmount: Float!
    rentalType: RentalType!
    
    pickupLocation: String
    dropoffLocation: String
  }

  # --- Queries ---
  type Query {
    bookings: [Booking!]!
    booking(id: ID!): Booking
    userBookings(userId: ID!): [Booking!]!
    carBookings(carId: ID!): [Booking!]!
    myBookings: [Booking!]!
  }

  # --- Mutations ---
  type Mutation {
    # Step 1: User creates a draft booking
    createBooking(input: CreateBookingInput!): Booking!
    
    # Step 2: System sends the verification link (email)
    sendBookingVerificationLink(bookingId: ID!): BookingLinkResponse!
    
    # Step 3: Verify the token from email (User clicks the link)
    verifyBookingToken(token: String!): BookingLinkResponse!
    
    # Admin or System updates status
    updateBookingStatus(id: ID!, status: BookingStatus!): Booking!
    
    cancelBooking(id: ID!): Boolean!
    deleteBooking(id: ID!): Boolean!
  }
`;