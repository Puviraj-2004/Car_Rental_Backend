export declare const FRENCH_TVA_RATE = 0.2;
export declare const calculateTax: (amount: number) => number;
export declare const calculateTotalPrice: (basePrice: number, taxAmount: number) => number;
export declare const calculateBasePriceFromTotal: (totalPrice: number) => {
    basePrice: number;
    taxAmount: number;
};
export declare const validatePricing: (pricePerHour: number, pricePerKm: number, pricePerDay: number) => boolean;
export declare const calculateRentalCost: (rentalType: "HOUR" | "KM" | "DAY", rentalValue: number, pricePerHour: number, pricePerKm: number, pricePerDay: number) => number;
//# sourceMappingURL=pricing.d.ts.map