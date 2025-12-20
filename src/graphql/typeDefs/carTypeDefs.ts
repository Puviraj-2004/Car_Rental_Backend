import { gql } from 'graphql-tag';

export const carTypeDefs = gql`
  scalar Upload

  enum FuelType {
    PETROL
    DIESEL
    ELECTRIC
    HYBRID
  }

  enum TransmissionType {
    MANUAL
    AUTOMATIC
  }

  type Car {
    id: ID!
    brand: String!
    model: String!
    year: Int!
    plateNumber: String!
    fuelType: FuelType!
    transmission: TransmissionType!
    seats: Int!
    doors: Int!
    pricePerHour: Float!
    pricePerKm: Float!
    pricePerDay: Float!
    critAirRating: Int!
    availability: Boolean!
    descriptionEn: String
    descriptionFr: String
    createdAt: String!
    updatedAt: String!
    bookings: [Booking!]!
    images: [CarImage!]!
  }

  type CarImage {
    id: ID!
    carId: ID!
    imagePath: String!
    altText: String
    isPrimary: Boolean!
    createdAt: String!
    updatedAt: String!
    car: Car!
  }

  input CarFilterInput {
    brand: String
    model: String
    fuelType: FuelType
    transmission: TransmissionType
    minPricePerDay: Float
    maxPricePerDay: Float
    minPricePerHour: Float
    maxPricePerHour: Float
    critAirRating: Int
    availability: Boolean
  }

  input UploadCarImagesInput {
    carId: ID!
    images: [Upload!]!
    altTexts: [String]
    primaryIndex: Int
  }

  input CreateCarInput {
    brand: String!
    model: String!
    year: Int!
    plateNumber: String!
    fuelType: FuelType!
    transmission: TransmissionType!
    seats: Int!
    doors: Int!
    pricePerHour: Float!
    pricePerKm: Float!
    pricePerDay: Float!
    critAirRating: Int!
    availability: Boolean
    descriptionEn: String
    descriptionFr: String
  }

  input UpdateCarInput {
    brand: String
    model: String
    year: Int
    plateNumber: String
    fuelType: FuelType
    transmission: TransmissionType
    seats: Int
    doors: Int
    pricePerHour: Float
    pricePerKm: Float
    pricePerDay: Float
    critAirRating: Int
    availability: Boolean
    descriptionEn: String
    descriptionFr: String
  }

  type Query {
    cars(filter: CarFilterInput): [Car!]!
    car(id: ID!): Car
    availableCars(startDate: String!, endDate: String!): [Car!]!
  }

  type Mutation {
    createCar(input: CreateCarInput!): Car!
    updateCar(id: ID!, input: UpdateCarInput!): Car!
    deleteCar(id: ID!): Boolean!
    uploadCarImages(input: UploadCarImagesInput!): [CarImage!]!
    deleteCarImage(imageId: ID!): Boolean!
    setPrimaryCarImage(carId: ID!, imageId: ID!): Boolean!
  }
`;