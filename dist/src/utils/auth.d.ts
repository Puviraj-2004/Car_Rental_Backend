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
export {};
//# sourceMappingURL=auth.d.ts.map