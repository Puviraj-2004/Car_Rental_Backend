"use strict";
// Calculation Utilities
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRentalCost = exports.calculateBasePriceFromTotal = exports.calculateTotalPrice = exports.calculateTax = void 0;
// 1. Calculate Tax Amount
// Note: We now pass the taxPercentage dynamically from PlatformSettings
const calculateTax = (amount, taxPercentage) => {
    if (amount < 0) {
        throw new Error('Amount cannot be negative');
    }
    // Formula: Amount * (Tax% / 100)
    return Math.round((amount * (taxPercentage / 100)) * 100) / 100;
};
exports.calculateTax = calculateTax;
// 2. Calculate Total Price (Base + Tax)
const calculateTotalPrice = (basePrice, taxAmount) => {
    if (basePrice < 0 || taxAmount < 0) {
        throw new Error('Prices cannot be negative');
    }
    return Math.round((basePrice + taxAmount) * 100) / 100;
};
exports.calculateTotalPrice = calculateTotalPrice;
// 3. Calculate Base Price from Total (Reverse Calculation)
const calculateBasePriceFromTotal = (totalPrice, taxPercentage) => {
    if (totalPrice < 0) {
        throw new Error('Total price cannot be negative');
    }
    const taxRate = taxPercentage / 100;
    // totalPrice = basePrice * (1 + taxRate)
    // basePrice = totalPrice / (1 + taxRate)
    const basePrice = Math.round((totalPrice / (1 + taxRate)) * 100) / 100;
    const taxAmount = Math.round((basePrice * taxRate) * 100) / 100;
    return { basePrice, taxAmount };
};
exports.calculateBasePriceFromTotal = calculateBasePriceFromTotal;
// 4. Calculate Rental Cost based on Type (Hour/Km/Day)
const calculateRentalCost = (rentalType, rentalValue, pricePerHour, pricePerKm, pricePerDay) => {
    let cost = 0;
    if (rentalValue <= 0)
        throw new Error('Rental value must be positive');
    switch (rentalType) {
        case 'HOUR':
            if (!pricePerHour)
                throw new Error('Hourly rental not available for this car');
            cost = rentalValue * pricePerHour;
            break;
        case 'KM':
            if (!pricePerKm)
                throw new Error('KM rental not available for this car');
            cost = rentalValue * pricePerKm;
            break;
        case 'DAY':
            if (!pricePerDay)
                throw new Error('Daily rental not available for this car');
            cost = rentalValue * pricePerDay;
            break;
        default:
            throw new Error('Invalid rental type');
    }
    return Math.round(cost * 100) / 100;
};
exports.calculateRentalCost = calculateRentalCost;
//# sourceMappingURL=calculation.js.map