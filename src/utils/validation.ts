// Validation utilities for the Car Rental API

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // French phone number validation (basic)
  const phoneRegex = /^(\+33|0)[1-9](\d{2}){4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePostalCode = (postalCode: string): boolean => {
  // French postal code validation (5 digits)
  const postalRegex = /^[0-9]{5}$/;
  return postalRegex.test(postalCode);
};

export const validateDateRange = (startDate: Date, endDate: Date): ValidationResult => {
  const errors: string[] = [];

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

export const validateRentalValue = (rentalType: string, rentalValue: number): ValidationResult => {
  const errors: string[] = [];

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

export const validateCarData = (carData: any): ValidationResult => {
  const errors: string[] = [];

  if (!carData.brand?.trim()) errors.push('Brand is required');
  if (!carData.model?.trim()) errors.push('Model is required');
  if (!carData.plateNumber?.trim()) errors.push('Plate number is required');
  if (!carData.fuelType) errors.push('Fuel type is required');
  if (!carData.transmission) errors.push('Transmission is required');
  if (carData.seats < 1 || carData.seats > 9) errors.push('Seats must be between 1 and 9');
  if (carData.doors < 1 || carData.doors > 5) errors.push('Doors must be between 1 and 5');
  if (carData.pricePerHour <= 0) errors.push('Price per hour must be positive');
  if (carData.pricePerKm <= 0) errors.push('Price per km must be positive');
  if (carData.pricePerDay <= 0) errors.push('Price per day must be positive');
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

export const validateBookingInput = (input: any): ValidationResult => {
  const errors: string[] = [];

  if (!input.carId) errors.push('Car ID is required');
  if (!['HOUR', 'KM', 'DAY'].includes(input.rentalType)) {
    errors.push('Invalid rental type');
  }

  if (input.rentalType === 'DAY') {
    if (!input.startDate || !input.endDate) {
      errors.push('Start and end dates are required for daily rentals');
    } else {
      const dateValidation = validateDateRange(new Date(input.startDate), new Date(input.endDate));
      if (!dateValidation.isValid) {
        errors.push(...dateValidation.errors);
      }
    }
  }

  if (input.rentalValue !== undefined) {
    const rentalValidation = validateRentalValue(input.rentalType, input.rentalValue);
    if (!rentalValidation.isValid) {
      errors.push(...rentalValidation.errors);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
