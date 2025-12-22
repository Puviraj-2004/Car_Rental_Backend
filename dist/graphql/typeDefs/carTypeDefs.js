"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.carTypeDefs = void 0;
const graphql_tag_1 = require("graphql-tag");
exports.carTypeDefs = (0, graphql_tag_1.gql) `
  scalar Upload


  enum CritAirCategory {
    CRIT_AIR_0
    CRIT_AIR_1
    CRIT_AIR_2
    CRIT_AIR_3
    CRIT_AIR_4
    CRIT_AIR_5
    NO_STICKER
  }

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
  critAirRating: CritAirCategory!
  availability: Boolean!
  descriptionEn: String
  descriptionFr: String
  createdAt: String!
  updatedAt: String!
  images: [CarImage!]!    
  bookings: [Booking!]!
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
    critAirRating: CritAirCategory
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
    critAirRating: CritAirCategory!
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
    critAirRating: CritAirCategory
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
//# sourceMappingURL=carTypeDefs.js.map