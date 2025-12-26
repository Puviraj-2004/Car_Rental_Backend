export interface ValidationResult {
    isValid: boolean;
    errors: string[];
}
export declare const validateEmail: (email: string) => boolean;
export declare const validatePhoneNumber: (phone: string) => boolean;
export declare const validatePassword: (password: string) => ValidationResult;
export declare const validateCarData: (carData: any) => ValidationResult;
export declare const validateBookingInput: (input: any) => ValidationResult;
//# sourceMappingURL=validation.d.ts.map