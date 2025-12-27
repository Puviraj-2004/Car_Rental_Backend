import { gql } from 'graphql-tag';

export const carTypeDefs = gql`
  # 🚀 முக்கியமான மாற்றம்: இமேஜ் அப்லோட் செய்ய இது தேவை
  scalar Upload

  # --- Enums ---
  enum CritAirCategory { CRIT_AIR_0 CRIT_AIR_1 CRIT_AIR_2 CRIT_AIR_3 CRIT_AIR_4 CRIT_AIR_5 CRIT_AIR_6 NO_STICKER }
  enum FuelType { PETROL DIESEL ELECTRIC HYBRID }
  enum TransmissionType { MANUAL AUTOMATIC }
  enum CarStatus { AVAILABLE BOOKED MAINTENANCE OUT_OF_SERVICE }

  # --- Types ---
  type Brand {
    id: ID!
    name: String!
    logoUrl: String
    logoPublicId: String
    models: [Model!]
    cars: [Car!]
    createdAt: String!
  }

  type Model {
    id: ID!
    name: String!
    brandId: ID!
    brand: Brand!
    cars: [Car!]
    createdAt: String!
  }

  type CarImage {
    id: ID!
    carId: ID!
    imagePath: String!
    publicId: String
    altText: String
    isPrimary: Boolean!
    createdAt: String!
    updatedAt: String!
    car: Car!
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
    mileage: Float!
    pricePerHour: Float
    pricePerKm: Float
    pricePerDay: Float
    depositAmount: Float!
    critAirRating: CritAirCategory!
    status: CarStatus!
    descriptionEn: String
    descriptionFr: String
    createdAt: String!
    updatedAt: String!
    images: [CarImage!]!    
    bookings: [Booking!]!
  }

  # --- Inputs ---
  input CreateCarInput {
    brandId: ID!
    modelId: ID!
    year: Int!
    plateNumber: String!
    fuelType: FuelType!
    transmission: TransmissionType!
    seats: Int!
    mileage: Float
    pricePerHour: Float
    pricePerKm: Float
    pricePerDay: Float
    depositAmount: Float!
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
    mileage: Float
    pricePerHour: Float
    pricePerKm: Float
    pricePerDay: Float
    depositAmount: Float
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
    minPrice: Float
    maxPrice: Float
    startDate: String
    endDate: String
    includeOutOfService: Boolean
  }

  # --- Queries ---
  type Query {
    cars(filter: CarFilterInput): [Car!]!
    car(id: ID!): Car
    brands: [Brand!]!
    models(brandId: ID!): [Model!]!
    availableCars(startDate: String!, endDate: String!): [Car!]!
  }

  # --- Mutations ---
  type Mutation {
    createCar(input: CreateCarInput!): Car!
    updateCar(id: ID!, input: UpdateCarInput!): Car!
    deleteCar(id: ID!): Boolean!
    
    createBrand(name: String!, logoUrl: String, logoPublicId: String): Brand!
    updateBrand(id: ID!, name: String!, logoUrl: String, logoPublicId: String): Brand!
    deleteBrand(id: ID!): Boolean!
    
    createModel(name: String!, brandId: ID!): Model!
    updateModel(id: ID!, name: String!): Model!
    deleteModel(id: ID!): Boolean!
    
    # ✅ திருத்தப்பட்டது: 'input' நீக்கப்பட்டு நேரடியாக ஆர்குமெண்ட்கள் சேர்க்கப்பட்டுள்ளன
    # இது உன் 'carResolvers.ts' உடன் மேட்ச் ஆகும்
    addCarImage(carId: ID!, file: Upload!, isPrimary: Boolean): CarImage!
    
    deleteCarImage(imageId: ID!): Boolean!
    setPrimaryCarImage(carId: ID!, imageId: ID!): Boolean!
  }
`;