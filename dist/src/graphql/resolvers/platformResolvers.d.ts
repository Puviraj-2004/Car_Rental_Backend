export declare const platformResolvers: {
    Query: {
        platformSettings: () => Promise<{
            id: string;
            updatedAt: Date;
            address: string | null;
            logoUrl: string | null;
            logoPublicId: string | null;
            currency: string;
            companyName: string;
            description: string | null;
            supportEmail: string | null;
            supportPhone: string | null;
            facebookUrl: string | null;
            twitterUrl: string | null;
            instagramUrl: string | null;
            linkedinUrl: string | null;
            youngDriverMinAge: number | null;
            youngDriverFee: number | null;
            noviceLicenseYears: number | null;
            termsAndConditions: string | null;
            privacyPolicy: string | null;
            taxPercentage: number;
        }>;
        auditLogs: (_: any, { limit, offset }: {
            limit?: number;
            offset?: number;
        }, context: any) => Promise<({
            user: {
                role: import(".prisma/client").$Enums.Role;
                id: string;
                email: string;
                username: string;
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
        updatePlatformSettings: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<{
            id: string;
            updatedAt: Date;
            address: string | null;
            logoUrl: string | null;
            logoPublicId: string | null;
            currency: string;
            companyName: string;
            description: string | null;
            supportEmail: string | null;
            supportPhone: string | null;
            facebookUrl: string | null;
            twitterUrl: string | null;
            instagramUrl: string | null;
            linkedinUrl: string | null;
            youngDriverMinAge: number | null;
            youngDriverFee: number | null;
            noviceLicenseYears: number | null;
            termsAndConditions: string | null;
            privacyPolicy: string | null;
            taxPercentage: number;
        }>;
    };
};
//# sourceMappingURL=platformResolvers.d.ts.map