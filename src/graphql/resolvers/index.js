"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merge_1 = require("@graphql-tools/merge");
const userResolvers_1 = require("./userResolvers");
const carResolvers_1 = require("./carResolvers");
const bookingResolvers_1 = require("./bookingResolvers");
const resolvers = (0, merge_1.mergeResolvers)([
    userResolvers_1.userResolvers,
    carResolvers_1.carResolvers,
    bookingResolvers_1.bookingResolvers
]);
exports.default = resolvers;
//# sourceMappingURL=index.js.map