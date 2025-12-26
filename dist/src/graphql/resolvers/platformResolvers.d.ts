export declare const platformResolvers: {
    Query: {
        platformSettings: () => Promise<{
            id: string;
            updatedAt: Date;
            address: string | null;
            logoUrl: string | null;
            logoPublicId: string | null;
            currency: string;
            description: string | null;
            companyName: string;
            supportEmail: string | null;
            supportPhone: string | null;
            facebookUrl: string | null;
            twitterUrl: string | null;
            instagramUrl: string | null;
            linkedinUrl: string | null;
            termsAndConditions: string | null;
            privacyPolicy: string | null;
            taxPercentage: number;
        }>;
        auditLogs: (_: any, { limit, offset }: any, context: any) => Promise<({
            user: {
                role: import(".prisma/client").$Enums.Role;
                id: string;
                email: string;
                otp: string | null;
                username: string;
                phoneNumber: string;
                googleId: string | null;
                password: string | null;
                isEmailVerified: boolean;
                otpExpires: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            userId: string;
            id: string;
            createdAt: Date;
            action: string;
            details: import("@prisma/client/runtime/library").JsonValue | null;
        })[]>;
    };
    Mutation: {
        updatePlatformSettings: (_: any, { input }: any, context: any) => Promise<{
            id: string;
            updatedAt: Date;
            address: string | null;
            logoUrl: string | null;
            logoPublicId: string | null;
            currency: string;
            description: string | null;
            companyName: string;
            supportEmail: string | null;
            supportPhone: string | null;
            facebookUrl: string | null;
            twitterUrl: string | null;
            instagramUrl: string | null;
            linkedinUrl: string | null;
            termsAndConditions: string | null;
            privacyPolicy: string | null;
            taxPercentage: number;
        }>;
    };
};
//# sourceMappingURL=platformResolvers.d.ts.map