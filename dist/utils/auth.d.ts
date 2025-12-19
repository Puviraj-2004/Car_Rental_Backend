export declare const generateToken: (userId: string) => string;
export declare const verifyToken: (token: string) => any;
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePasswords: (password: string, hashedPassword: string) => Promise<boolean>;
//# sourceMappingURL=auth.d.ts.map