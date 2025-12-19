"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.carTypeDefs = void 0;
const graphql_tag_1 = require("graphql-tag");
exports.carTypeDefs = (0, graphql_tag_1.gql) `
  type Car {
    id: ID!
    brand: String!
    model: String!
    year: Int!
    plateNumber: String!
    fuelType: String!
    transmission: String!
    seats: Int!
    doors: Int!
    pricePerDay: Float!
    critAirRating: Int!
    availability: Boolean!
    imageUrl: String
    descriptionEn: String
    descriptionFr: String
    createdAt: String!
    updatedAt: String!
    bookings: [Booking!]!
  }

  input CarFilterInput {
    brand: String
    model: String
    fuelType: String
    transmission: String
    minPrice: Float
    maxPrice: Float
    critAirRating: Int
    availability: Boolean
  }

  input CreateCarInput {
    brand: String!
    model: String!
    year: Int!
    plateNumber: String!
    fuelType: String!
    transmission: String!
    seats: Int!
    doors: Int!
    pricePerDay: Float!
    critAirRating: Int!
    availability: Boolean
    imageUrl: String
    descriptionEn: String
    descriptionFr: String
  }

  input UpdateCarInput {
    brand: String
    model: String
    year: Int
    plateNumber: String
    fuelType: String
    transmission: String
    seats: Int
    doors: Int
    pricePerDay: Float
    critAirRating: Int
    availability: Boolean
    imageUrl: String
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
  }
`;
//# sourceMappingURL=carTypeDefs.js.map