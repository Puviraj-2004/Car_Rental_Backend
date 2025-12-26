export declare const calculateTax: (amount: number, taxPercentage: number) => number;
export declare const calculateTotalPrice: (basePrice: number, taxAmount: number) => number;
export declare const calculateBasePriceFromTotal: (totalPrice: number, taxPercentage: number) => {
    basePrice: number;
    taxAmount: number;
};
export declare const calculateRentalCost: (rentalType: "HOUR" | "KM" | "DAY", rentalValue: number, pricePerHour: number | null, pricePerKm: number | null, pricePerDay: number | null) => number;
//# sourceMappingURL=calculation.d.ts.map