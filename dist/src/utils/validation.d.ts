import { CreateCarInput, UpdateCarInput, CreateBookingInput } from '../types/graphql';
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings?: string[];
}
export declare const validatePassword: (password: string) => ValidationResult;
export declare const validateCarData: (carData: CreateCarInput | UpdateCarInput) => ValidationResult;
export declare const validateBookingInput: (input: CreateBookingInput) => ValidationResult;
import { CarFilterInput } from '../types/graphql';
export declare const validateCarFilterInput: (filter: CarFilterInput) => ValidationResult;
//# sourceMappingURL=validation.d.ts.map