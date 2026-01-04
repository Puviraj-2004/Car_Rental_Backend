export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export declare const validatePassword: (password: string) => ValidationResult;
export declare const validateCarData: (carData: any) => ValidationResult;
export declare const validateBookingInput: (input: any) => ValidationResult;
export declare const validateCarFilterInput: (filter: any) => ValidationResult;
//# sourceMappingURL=validation.d.ts.map