export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Accepts International format (+33...) or standard 10 digits
  const phoneRegex = /^(\+|0)[0-9]{9,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];

  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (password.length > 128) errors.push('Password too long');
  if (!/[A-Z]/.test(password)) errors.push('Must contain uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Must contain lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Must contain number');
  
  return { isValid: errors.length === 0, errors };
};

export const validateCarData = (carData: any): ValidationResult => {
  const errors: string[] = [];

  // Required Fields
  if (!carData.brandId) errors.push('Brand is required');
  if (!carData.modelId) errors.push('Model is required');
  if (!carData.plateNumber?.trim()) errors.push('Plate number is required');
  if (!carData.fuelType) errors.push('Fuel type is required');
  if (!carData.transmission) errors.push('Transmission is required');
  if (!carData.critAirRating) errors.push('CritAir rating is required');

  // Numeric Checks
  if (carData.seats < 1 || carData.seats > 60) errors.push('Invalid seats count');
  if (carData.year < 1900 || carData.year > new Date().getFullYear() + 1) errors.push('Invalid year');
  
  // New Fields check
  if (carData.mileage < 0) errors.push('Mileage cannot be negative');
  if (carData.depositAmount < 0) errors.push('Deposit cannot be negative');

  // Ensure at least one price is set
  if (!carData.pricePerDay && !carData.pricePerHour && !carData.pricePerKm) {
    errors.push('Set at least one pricing (Day, Hour, or KM)');
  }

  return { isValid: errors.length === 0, errors };
};

export const validateBookingInput = (input: any): ValidationResult => {
  const errors: string[] = [];

  if (!input.carId) errors.push('Car ID is required');
  if (!['HOUR', 'KM', 'DAY'].includes(input.rentalType)) errors.push('Invalid rental type');

  // Date Logic
  if (input.rentalType === 'DAY' || input.rentalType === 'HOUR') {
    if (!input.startDate || !input.endDate) {
      errors.push('Start and End dates are required');
    } else {
      const start = new Date(input.startDate);
      const end = new Date(input.endDate);
      const now = new Date();

      if (start >= end) errors.push('End date must be after start date');
      if (start < now) errors.push('Start date cannot be in the past');
    }
  }

  return { isValid: errors.length === 0, errors };
};