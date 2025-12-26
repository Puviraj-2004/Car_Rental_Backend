// Calculation Utilities

// 1. Calculate Tax Amount
// Note: We now pass the taxPercentage dynamically from PlatformSettings
export const calculateTax = (amount: number, taxPercentage: number): number => {
  if (amount < 0) {
    throw new Error('Amount cannot be negative');
  }
  // Formula: Amount * (Tax% / 100)
  return Math.round((amount * (taxPercentage / 100)) * 100) / 100; 
};

// 2. Calculate Total Price (Base + Tax)
export const calculateTotalPrice = (basePrice: number, taxAmount: number): number => {
  if (basePrice < 0 || taxAmount < 0) {
    throw new Error('Prices cannot be negative');
  }
  return Math.round((basePrice + taxAmount) * 100) / 100;
};

// 3. Calculate Base Price from Total (Reverse Calculation)
export const calculateBasePriceFromTotal = (totalPrice: number, taxPercentage: number): { basePrice: number; taxAmount: number } => {
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

// 4. Calculate Rental Cost based on Type (Hour/Km/Day)
export const calculateRentalCost = (
  rentalType: 'HOUR' | 'KM' | 'DAY',
  rentalValue: number,
  pricePerHour: number | null,
  pricePerKm: number | null,
  pricePerDay: number | null
): number => {
  let cost = 0;

  if (rentalValue <= 0) throw new Error('Rental value must be positive');

  switch (rentalType) {
    case 'HOUR':
      if (!pricePerHour) throw new Error('Hourly rental not available for this car');
      cost = rentalValue * pricePerHour;
      break;
    case 'KM':
      if (!pricePerKm) throw new Error('KM rental not available for this car');
      cost = rentalValue * pricePerKm;
      break;
    case 'DAY':
      if (!pricePerDay) throw new Error('Daily rental not available for this car');
      cost = rentalValue * pricePerDay;
      break;
    default:
      throw new Error('Invalid rental type');
  }

  return Math.round(cost * 100) / 100;
};