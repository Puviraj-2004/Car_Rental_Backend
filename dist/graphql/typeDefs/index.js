"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merge_1 = require("@graphql-tools/merge");
const userTypeDefs_1 = require("./userTypeDefs");
const carTypeDefs_1 = require("./carTypeDefs");
const bookingTypeDefs_1 = require("./bookingTypeDefs");
const paymentTypeDefs_1 = require("./paymentTypeDefs");
const typeDefs = (0, merge_1.mergeTypeDefs)([
    userTypeDefs_1.userTypeDefs,
    carTypeDefs_1.carTypeDefs,
    bookingTypeDefs_1.bookingTypeDefs,
    paymentTypeDefs_1.paymentTypeDefs
]);
exports.default = typeDefs;
//# sourceMappingURL=index.js.map