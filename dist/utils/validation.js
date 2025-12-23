"use strict";
// Validation utilities for the Car Rental API
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBookingInput = exports.validatePassword = exports.validateCarData = exports.validateRentalValue = exports.validateDateRange = exports.validatePostalCode = exports.validatePhoneNumber = exports.validateEmail = void 0;
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validatePhoneNumber = (phone) => {
    // French phone number validation (basic)
    const phoneRegex = /^(\+33|0)[1-9](\d{2}){4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};
exports.validatePhoneNumber = validatePhoneNumber;
const validatePostalCode = (postalCode) => {
    // French postal code validation (5 digits)
    const postalRegex = /^[0-9]{5}$/;
    return postalRegex.test(postalCode);
};
exports.validatePostalCode = validatePostalCode;
const validateDateRange = (startDate, endDate) => {
    const errors = [];
    if (startDate >= endDate) {
        errors.push('End date must be after start date');
    }
    const now = new Date();
    if (startDate < now) {
        errors.push('Start date cannot be in the past');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateDateRange = validateDateRange;
const validateRentalValue = (rentalType, rentalValue) => {
    const errors = [];
    if (rentalValue <= 0) {
        errors.push('Rental value must be positive');
    }
    switch (rentalType) {
        case 'HOUR':
            if (rentalValue > 720) { // Max 30 days in hours
                errors.push('Hourly rental cannot exceed 720 hours (30 days)');
            }
            break;
        case 'KM':
            if (rentalValue > 5000) { // Max reasonable distance
                errors.push('Kilometer rental cannot exceed 5000 km');
            }
            break;
        case 'DAY':
            if (rentalValue > 90) { // Max 90 days
                errors.push('Daily rental cannot exceed 90 days');
            }
            break;
        default:
            errors.push('Invalid rental type');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateRentalValue = validateRentalValue;
const validateCarData = (carData) => {
    const errors = [];
    if (!carData.brand?.trim())
        errors.push('Brand is required');
    if (!carData.model?.trim())
        errors.push('Model is required');
    if (!carData.plateNumber?.trim())
        errors.push('Plate number is required');
    if (!carData.fuelType)
        errors.push('Fuel type is required');
    if (!carData.transmission)
        errors.push('Transmission is required');
    if (carData.seats < 1 || carData.seats > 9)
        errors.push('Seats must be between 1 and 9');
    if (carData.doors < 1 || carData.doors > 5)
        errors.push('Doors must be between 1 and 5');
    if (carData.pricePerHour <= 0)
        errors.push('Price per hour must be positive');
    if (carData.pricePerKm <= 0)
        errors.push('Price per km must be positive');
    if (carData.pricePerDay <= 0)
        errors.push('Price per day must be positive');
    if (carData.year < 1900 || carData.year > new Date().getFullYear() + 1) {
        errors.push('Invalid year');
    }
    if (carData.critAirRating < 0 || carData.critAirRating > 5) {
        errors.push('CritAir rating must be between 0 and 5');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateCarData = validateCarData;
const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    if (password.length > 128) {
        errors.push('Password must not exceed 128 characters');
    }
    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }
    // Check for common passwords
    const commonPasswords = [
        'password', '12345678', 'qwerty123', 'password123',
        'admin123', 'letmein', 'welcome', 'monkey', '1234567890'
    ];
    const lowerPassword = password.toLowerCase();
    if (commonPasswords.some(common => lowerPassword.includes(common))) {
        errors.push('Password contains common password patterns');
    }
    // Check for repeated characters (more than 3 in a row)
    if (/(.)\1{3,}/.test(password)) {
        errors.push('Password must not contain more than 3 identical characters in a row');
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validatePassword = validatePassword;
const validateBookingInput = (input) => {
    const errors = [];
    if (!input.carId)
        errors.push('Car ID is required');
    if (!['HOUR', 'KM', 'DAY'].includes(input.rentalType)) {
        errors.push('Invalid rental type');
    }
    if (input.rentalType === 'DAY') {
        if (!input.startDate || !input.endDate) {
            errors.push('Start and end dates are required for daily rentals');
        }
        else {
            const dateValidation = (0, exports.validateDateRange)(new Date(input.startDate), new Date(input.endDate));
            if (!dateValidation.isValid) {
                errors.push(...dateValidation.errors);
            }
        }
    }
    if (input.rentalValue !== undefined) {
        const rentalValidation = (0, exports.validateRentalValue)(input.rentalType, input.rentalValue);
        if (!rentalValidation.isValid) {
            errors.push(...rentalValidation.errors);
        }
    }
    return {
        isValid: errors.length === 0,
        errors
    };
};
exports.validateBookingInput = validateBookingInput;
//# sourceMappingURL=validation.js.map