import { gql } from 'graphql-tag';

export const carTypeDefs = gql`
  scalar Upload

  type Brand {
    id: ID!
    name: String!
    models: [Model!]
    createdAt: String!
  }

  type Model {
    id: ID!
    name: String!
    brandId: ID!
    brand: Brand!
    createdAt: String!
  }

  type Car {
    id: ID!
    brandId: ID!
    brand: Brand!
    modelId: ID!
    model: Model!
    year: Int!
    plateNumber: String!
    fuelType: FuelType!
    transmission: TransmissionType!
    seats: Int!
    pricePerHour: Float
    pricePerKm: Float
    pricePerDay: Float
    critAirRating: CritAirCategory!
    status: CarStatus!
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
  }

  input UploadCarImagesInput {
    carId: ID!
    images: [Upload!]!
    altTexts: [String]
    primaryIndex: Int
  }

  input CreateCarInput {
    brandId: ID!
    modelId: ID!
    year: Int!
    plateNumber: String!
    fuelType: FuelType!
    transmission: TransmissionType!
    seats: Int!
    pricePerHour: Float
    pricePerKm: Float
    pricePerDay: Float
    critAirRating: CritAirCategory!
    status: CarStatus
    descriptionEn: String
    descriptionFr: String
  }

  input UpdateCarInput {
    brandId: ID
    modelId: ID
    year: Int
    plateNumber: String
    fuelType: FuelType
    transmission: TransmissionType
    seats: Int
    pricePerHour: Float
    pricePerKm: Float
    pricePerDay: Float
    critAirRating: CritAirCategory
    status: CarStatus
    descriptionEn: String
    descriptionFr: String
  }

  input CarFilterInput {
    brandId: ID
    modelId: ID
    fuelType: FuelType
    transmission: TransmissionType
    status: CarStatus
    critAirRating: CritAirCategory
  }

  type Query {
    cars(filter: CarFilterInput): [Car!]!
    car(id: ID!): Car
    brands: [Brand!]!
    models(brandId: ID!): [Model!]!
    availableCars(startDate: String!, endDate: String!): [Car!]!
  }

  type Mutation {
    createCar(input: CreateCarInput!): Car!
    updateCar(id: ID!, input: UpdateCarInput!): Car!
    deleteCar(id: ID!): Boolean!
    createBrand(name: String!): Brand!
    updateBrand(id: ID!, name: String!): Brand!
    deleteBrand(id: ID!): Boolean!
    createModel(name: String!, brandId: ID!): Model!
    updateModel(id: ID!, name: String!): Model!
    deleteModel(id: ID!): Boolean!
    uploadCarImages(input: UploadCarImagesInput!): [CarImage!]!
    deleteCarImage(imageId: ID!): Boolean!
    setPrimaryCarImage(carId: ID!, imageId: ID!): Boolean!
  }

  enum CritAirCategory { CRIT_AIR_0 CRIT_AIR_1 CRIT_AIR_2 CRIT_AIR_3 CRIT_AIR_4 CRIT_AIR_5 CRIT_AIR_6 NO_STICKER }
  enum FuelType { PETROL DIESEL ELECTRIC HYBRID }
  enum TransmissionType { MANUAL AUTOMATIC }
  enum CarStatus { AVAILABLE BOOKED MAINTENANCE }
`;