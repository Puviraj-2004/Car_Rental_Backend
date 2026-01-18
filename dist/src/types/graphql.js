"use strict";
// GraphQL Type Definitions for Type Safety
// Manually maintained - Keep in sync with GraphQL schemas in typeDefs/
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingStatus = exports.PaymentStatus = exports.LicenseCategory = exports.CarStatus = exports.Transmission = exports.FuelType = exports.CritAirCategory = void 0;
// Enums
var CritAirCategory;
(function (CritAirCategory) {
    CritAirCategory["CRIT_AIR_0"] = "CRIT_AIR_0";
    CritAirCategory["CRIT_AIR_1"] = "CRIT_AIR_1";
    CritAirCategory["CRIT_AIR_2"] = "CRIT_AIR_2";
    CritAirCategory["CRIT_AIR_3"] = "CRIT_AIR_3";
    CritAirCategory["CRIT_AIR_4"] = "CRIT_AIR_4";
    CritAirCategory["CRIT_AIR_5"] = "CRIT_AIR_5";
    CritAirCategory["NO_STICKER"] = "NO_STICKER";
})(CritAirCategory || (exports.CritAirCategory = CritAirCategory = {}));
var FuelType;
(function (FuelType) {
    FuelType["PETROL"] = "PETROL";
    FuelType["DIESEL"] = "DIESEL";
    FuelType["ELECTRIC"] = "ELECTRIC";
    FuelType["HYBRID"] = "HYBRID";
    FuelType["LPG"] = "LPG";
    FuelType["CNG"] = "CNG";
})(FuelType || (exports.FuelType = FuelType = {}));
var Transmission;
(function (Transmission) {
    Transmission["MANUAL"] = "MANUAL";
    Transmission["AUTOMATIC"] = "AUTOMATIC";
    Transmission["CVT"] = "CVT";
    Transmission["DCT"] = "DCT";
})(Transmission || (exports.Transmission = Transmission = {}));
var CarStatus;
(function (CarStatus) {
    CarStatus["AVAILABLE"] = "AVAILABLE";
    CarStatus["RENTED"] = "RENTED";
    CarStatus["MAINTENANCE"] = "MAINTENANCE";
    CarStatus["OUT_OF_SERVICE"] = "OUT_OF_SERVICE";
})(CarStatus || (exports.CarStatus = CarStatus = {}));
var LicenseCategory;
(function (LicenseCategory) {
    LicenseCategory["A"] = "A";
    LicenseCategory["A1"] = "A1";
    LicenseCategory["A2"] = "A2";
    LicenseCategory["B"] = "B";
    LicenseCategory["C"] = "C";
    LicenseCategory["D"] = "D";
    LicenseCategory["BE"] = "BE";
    LicenseCategory["CE"] = "CE";
    LicenseCategory["DE"] = "DE";
})(LicenseCategory || (exports.LicenseCategory = LicenseCategory = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["SUCCEEDED"] = "SUCCEEDED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["DRAFT"] = "DRAFT";
    BookingStatus["PENDING"] = "PENDING";
    BookingStatus["VERIFIED"] = "VERIFIED";
    BookingStatus["CONFIRMED"] = "CONFIRMED";
    BookingStatus["ONGOING"] = "ONGOING";
    BookingStatus["COMPLETED"] = "COMPLETED";
    BookingStatus["CANCELLED"] = "CANCELLED";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
//# sourceMappingURL=graphql.js.map