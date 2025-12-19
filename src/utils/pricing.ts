// French TVA (VAT) rate - 20%
export const FRENCH_TVA_RATE = 0.20;

// Calculate TVA (20% tax) for French bookings
export const calculateTax = (amount: number): number => {
  if (amount < 0) {
    throw new Error('Amount cannot be negative');
  }
  return Math.round((amount * FRENCH_TVA_RATE) * 100) / 100; // Round to 2 decimal places
};

// Calculate total price including tax
export const calculateTotalPrice = (basePrice: number, taxAmount: number): number => {
  if (basePrice < 0 || taxAmount < 0) {
    throw new Error('Prices cannot be negative');
  }
  return Math.round((basePrice + taxAmount) * 100) / 100; // Round to 2 decimal places
};

// Calculate base price from total price (reverse calculation)
export const calculateBasePriceFromTotal = (totalPrice: number): { basePrice: number; taxAmount: number } => {
  if (totalPrice < 0) {
    throw new Error('Total price cannot be negative');
  }

  // totalPrice = basePrice + (basePrice * TVA_RATE)
  // totalPrice = basePrice * (1 + TVA_RATE)
  // basePrice = totalPrice / (1 + TVA_RATE)
  const basePrice = Math.round((totalPrice / (1 + FRENCH_TVA_RATE)) * 100) / 100;
  const taxAmount = Math.round((basePrice * FRENCH_TVA_RATE) * 100) / 100;

  return { basePrice, taxAmount };
};

// Validate rental pricing
export const validatePricing = (pricePerHour: number, pricePerKm: number, pricePerDay: number): boolean => {
  return pricePerHour > 0 && pricePerKm > 0 && pricePerDay > 0;
};

// Calculate rental cost based on type
export const calculateRentalCost = (
  rentalType: 'HOUR' | 'KM' | 'DAY',
  rentalValue: number,
  pricePerHour: number,
  pricePerKm: number,
  pricePerDay: number
): number => {
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
