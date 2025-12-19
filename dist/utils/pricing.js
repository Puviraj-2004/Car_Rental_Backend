"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateRentalCost = exports.validatePricing = exports.calculateBasePriceFromTotal = exports.calculateTotalPrice = exports.calculateTax = exports.FRENCH_TVA_RATE = void 0;
// French TVA (VAT) rate - 20%
exports.FRENCH_TVA_RATE = 0.20;
// Calculate TVA (20% tax) for French bookings
const calculateTax = (amount) => {
    if (amount < 0) {
        throw new Error('Amount cannot be negative');
    }
    return Math.round((amount * exports.FRENCH_TVA_RATE) * 100) / 100; // Round to 2 decimal places
};
exports.calculateTax = calculateTax;
// Calculate total price including tax
const calculateTotalPrice = (basePrice, taxAmount) => {
    if (basePrice < 0 || taxAmount < 0) {
        throw new Error('Prices cannot be negative');
    }
    return Math.round((basePrice + taxAmount) * 100) / 100; // Round to 2 decimal places
};
exports.calculateTotalPrice = calculateTotalPrice;
// Calculate base price from total price (reverse calculation)
const calculateBasePriceFromTotal = (totalPrice) => {
    if (totalPrice < 0) {
        throw new Error('Total price cannot be negative');
    }
    // totalPrice = basePrice + (basePrice * TVA_RATE)
    // totalPrice = basePrice * (1 + TVA_RATE)
    // basePrice = totalPrice / (1 + TVA_RATE)
    const basePrice = Math.round((totalPrice / (1 + exports.FRENCH_TVA_RATE)) * 100) / 100;
    const taxAmount = Math.round((basePrice * exports.FRENCH_TVA_RATE) * 100) / 100;
    return { basePrice, taxAmount };
};
exports.calculateBasePriceFromTotal = calculateBasePriceFromTotal;
// Validate rental pricing
const validatePricing = (pricePerHour, pricePerKm, pricePerDay) => {
    return pricePerHour > 0 && pricePerKm > 0 && pricePerDay > 0;
};
exports.validatePricing = validatePricing;
// Calculate rental cost based on type
const calculateRentalCost = (rentalType, rentalValue, pricePerHour, pricePerKm, pricePerDay) => {
    switch (rentalType) {
        case 'HOUR':
            return Math.round((rentalValue * pricePerHour) * 100) / 100;
        case 'KM':
            return Math.round((rentalValue * pricePerKm) * 100) / 100;
        case 'DAY':
            return Math.round((rentalValue * pricePerDay) * 100) / 100;
        default:
            throw new Error('Invalid rental type');
    }
};
exports.calculateRentalCost = calculateRentalCost;
//# sourceMappingURL=pricing.js.map