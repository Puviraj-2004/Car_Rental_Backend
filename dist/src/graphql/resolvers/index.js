"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merge_1 = require("@graphql-tools/merge");
const graphql_upload_ts_1 = require("graphql-upload-ts");
const userResolvers_1 = require("./userResolvers");
const carResolvers_1 = require("./carResolvers");
const bookingResolvers_1 = require("./bookingResolvers");
const paymentResolvers_1 = require("./paymentResolvers");
const platformResolvers_1 = require("./platformResolvers");
const scalarResolvers = {
    Upload: graphql_upload_ts_1.GraphQLUpload,
};
const resolvers = (0, merge_1.mergeResolvers)([
    scalarResolvers,
    userResolvers_1.userResolvers,
    carResolvers_1.carResolvers,
    bookingResolvers_1.bookingResolvers,
    paymentResolvers_1.paymentResolvers,
    platformResolvers_1.platformResolvers
]);
exports.default = resolvers;
//# sourceMappingURL=index.js.map