"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCarFilterInput = exports.validateBookingInput = exports.validateCarData = exports.validatePassword = void 0;
const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8)
        errors.push('Password must be at least 8 characters');
    if (password.length > 128)
        errors.push('Password too long');
    if (!/[A-Z]/.test(password))
        errors.push('Must contain uppercase letter');
    if (!/[a-z]/.test(password))
        errors.push('Must contain lowercase letter');
    if (!/[0-9]/.test(password))
        errors.push('Must contain number');
    return { isValid: errors.length === 0, errors };
};
exports.validatePassword = validatePassword;
const validateCarData = (carData) => {
    const errors = [];
    // Required Fields
    if (!carData.brandId)
        errors.push('Brand is required');
    if (!carData.modelId)
        errors.push('Model is required');
    if (!carData.plateNumber?.trim())
        errors.push('Plate number is required');
    if (!carData.fuelType)
        errors.push('Fuel type is required');
    if (!carData.transmission)
        errors.push('Transmission is required');
    if (!carData.critAirRating)
        errors.push('CritAir rating is required');
    // Numeric Checks
    if (carData.seats < 1 || carData.seats > 60)
        errors.push('Invalid seats count');
    if (carData.year < 1900 || carData.year > new Date().getFullYear() + 1)
        errors.push('Invalid year');
    // New Fields check
    if (carData.mileage < 0)
        errors.push('Mileage cannot be negative');
    if (carData.depositAmount < 0)
        errors.push('Deposit cannot be negative');
    // Ensure at least one price is set
    if (!carData.pricePerDay && !carData.pricePerHour && !carData.pricePerKm) {
        errors.push('Set at least one pricing (Day, Hour, or KM)');
    }
    return { isValid: errors.length === 0, errors };
};
exports.validateCarData = validateCarData;
const validateBookingInput = (input) => {
    const errors = [];
    // Required field validation
    if (!input.carId)
        errors.push('Car ID is required');
    // Since we only support daily pricing currently, enforce DAY rental type
    if (input.rentalType && input.rentalType !== 'DAY') {
        errors.push('Only daily rentals are currently supported');
    }
    // Date validation - always required for bookings
    if (!input.startDate || !input.endDate) {
        errors.push('Both pickup and return dates are required');
    }
    else {
        const start = new Date(input.startDate);
        const end = new Date(input.endDate);
        const now = new Date();
        // Check if dates are valid
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            errors.push('Invalid date format');
        }
        else {
            // Return date must be after pickup date
            if (start >= end) {
                errors.push('Return date must be after pickup date');
            }
            // Pickup date cannot be in the past (allow some buffer for immediate bookings)
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
            if (start < fiveMinutesAgo) {
                errors.push('Pickup date cannot be in the past');
            }
            // Minimum booking duration (2 hours)
            const durationMs = end.getTime() - start.getTime();
            const durationHours = durationMs / (1000 * 60 * 60);
            if (durationHours < 2) {
                errors.push('Minimum booking duration is 2 hours');
            }
            // Maximum booking duration (30 days)
            const durationDays = durationMs / (1000 * 60 * 60 * 24);
            if (durationDays > 30) {
                errors.push('Maximum booking duration is 30 days');
            }
            // Prevent bookings too far in the future (6 months)
            const sixMonthsFromNow = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
            if (start > sixMonthsFromNow) {
                errors.push('Bookings cannot be made more than 6 months in advance');
            }
        }
    }
    return { isValid: errors.length === 0, errors };
};
exports.validateBookingInput = validateBookingInput;
const validateCarFilterInput = (filter) => {
    const errors = [];
    // If dates are provided, validate them
    if (filter.startDate || filter.endDate) {
        if (!filter.startDate || !filter.endDate) {
            errors.push('Both start date and end date must be provided when filtering by dates');
        }
        else {
            // Handle date-only strings (YYYY-MM-DD) by adding default times
            let start, end;
            try {
                // For date-only strings, add default times: 10 AM pickup, 10 AM return
                if (filter.startDate.includes('T') || filter.startDate.includes(' ')) {
                    start = new Date(filter.startDate);
                }
                else {
                    start = new Date(`${filter.startDate}T10:00:00`);
                }
                if (filter.endDate.includes('T') || filter.endDate.includes(' ')) {
                    end = new Date(filter.endDate);
                }
                else {
                    end = new Date(`${filter.endDate}T10:00:00`);
                }
                const now = new Date();
                // Check if dates are valid
                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    errors.push('Invalid date format. Use YYYY-MM-DD format');
                }
                else {
                    // Return date must be after pickup date
                    if (start >= end) {
                        errors.push('Return date must be after pickup date');
                    }
                    // Minimum booking duration (2 hours)
                    const durationMs = end.getTime() - start.getTime();
                    const durationHours = durationMs / (1000 * 60 * 60);
                    if (durationHours < 2) {
                        errors.push('Minimum booking duration is 2 hours');
                    }
                    // Maximum booking duration (30 days)
                    const durationDays = durationMs / (1000 * 60 * 60 * 24);
                    if (durationDays > 30) {
                        errors.push('Maximum booking duration is 30 days');
                    }
                    // Prevent filtering too far in the future (6 months)
                    const sixMonthsFromNow = new Date(now.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
                    if (start > sixMonthsFromNow) {
                        errors.push('Cannot filter cars more than 6 months in advance');
                    }
                }
            }
            catch (error) {
                errors.push('Invalid date format. Use YYYY-MM-DD format');
            }
        }
    }
    return { isValid: errors.length === 0, errors };
};
exports.validateCarFilterInput = validateCarFilterInput;
//# sourceMappingURL=validation.js.map