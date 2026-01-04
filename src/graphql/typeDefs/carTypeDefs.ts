import { gql } from 'graphql-tag';

export const carTypeDefs = gql`
  # 🚀 முக்கியமான மாற்றம்: இமேஜ் அப்லோட் செய்ய இது தேவை
  scalar Upload

  # --- Enums ---
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
    LPG
    CNG
  }

  enum Transmission {
    MANUAL
    AUTOMATIC
    CVT
    DCT
  }
  enum CarStatus { 
    AVAILABLE 
    RENTED 
    MAINTENANCE 
    OUT_OF_SERVICE 
  }

  # --- Types ---
  type Brand {
    id: ID!
    name: String!
    logoUrl: String
    models: [VehicleModel!]
  }

  type VehicleModel {
    id: ID!
    name: String!
    brandId: ID!
    brand: Brand!
    cars: [Car!]
  }

  type CarImage {
    id: ID!
    carId: ID!
    car: Car!
    url: String!
    isPrimary: Boolean!
  }

  type Car {
    id: ID!
    modelId: ID!
    model: VehicleModel!
    brand: Brand!
    year: Int!
    plateNumber: String!
    transmission: Transmission!
    fuelType: FuelType
    seats: Int!
    requiredLicense: LicenseCategory!
    pricePerDay: Float!
    depositAmount: Float
    dailyKmLimit: Float
    extraKmCharge: Float!
    currentOdometer: Float!
    critAirRating: CritAirCategory!
    status: CarStatus!
    images: [CarImage!]!
    bookings: [Booking!]!
    createdAt: String!
    updatedAt: String!
  }

  # --- Inputs ---
  input CreateCarInput {
    modelId: ID!
    year: Int!
    plateNumber: String!
    transmission: Transmission!
    fuelType: FuelType
    seats: Int!
    requiredLicense: LicenseCategory
    pricePerDay: Float!
    depositAmount: Float
    dailyKmLimit: Float
    extraKmCharge: Float
    currentOdometer: Float
    critAirRating: CritAirCategory!
    status: CarStatus
  }

  input UpdateCarInput {
    modelId: ID
    year: Int
    plateNumber: String
    transmission: Transmission
    fuelType: FuelType
    seats: Int
    requiredLicense: LicenseCategory
    pricePerDay: Float
    depositAmount: Float
    dailyKmLimit: Float
    extraKmCharge: Float
    currentOdometer: Float
    critAirRating: CritAirCategory
    status: CarStatus
  }

  input CarFilterInput {
    brandIds: [ID!]
    modelIds: [ID!]
    fuelTypes: [FuelType!]
    transmissions: [Transmission!]
    statuses: [CarStatus!]
    critAirRatings: [CritAirCategory!]
    startDate: String  # Date only (YYYY-MM-DD format)
    endDate: String    # Date only (YYYY-MM-DD format)
    includeOutOfService: Boolean
  }

  # --- Queries ---
  type Query {
    cars(filter: CarFilterInput): [Car!]!
    car(id: ID!): Car
    brands: [Brand!]!
    models(brandId: ID!): [VehicleModel!]!
  }

  # --- Mutations ---
  type Mutation {
    createCar(input: CreateCarInput!): Car!
    updateCar(id: ID!, input: UpdateCarInput!): Car!
    deleteCar(id: ID!): Boolean!
    
    createBrand(name: String!, logoUrl: String): Brand!
    updateBrand(id: ID!, name: String!, logoUrl: String): Brand!
    deleteBrand(id: ID!): Boolean!
    
    createModel(name: String!, brandId: ID!): VehicleModel!
    updateModel(id: ID!, name: String!): VehicleModel!
    deleteModel(id: ID!): Boolean!
    
    addCarImage(carId: ID!, file: Upload!, isPrimary: Boolean): CarImage!
    
    deleteCarImage(imageId: ID!): Boolean!
    setPrimaryCarImage(carId: ID!, imageId: ID!): Boolean!
  }
`;