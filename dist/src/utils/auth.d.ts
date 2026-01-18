import { Role } from '@prisma/client';
interface JWTPayload {
    userId: string;
    role: Role;
    iat?: number;
    exp?: number;
}
export declare const generateToken: (userId: string, role?: string) => string;
export declare const verifyToken: (token: string) => JWTPayload;
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePasswords: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const generateOTP: () => string;
export declare const storeOTP: (email: string, otp: string) => {
    expiresAt: string;
};
export declare const verifyOTPCode: (email: string, otp: string) => {
    valid: boolean;
    message: string;
};
export declare const clearOTP: (email: string) => void;
export declare const storePendingRegistration: (email: string, fullName: string, hashedPassword: string, phoneNumber?: string) => void;
export declare const getPendingRegistration: (email: string) => {
    fullName: string;
    password: string;
    phoneNumber?: string;
} | null;
export declare const clearPendingRegistration: (email: string) => void;
export {};
//# sourceMappingURL=auth.d.ts.map