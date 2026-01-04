export declare const userResolvers: {
    Query: {
        me: (_: any, __: any, context: any) => Promise<({
            verification: {
                userId: string;
                id: string;
                licenseNumber: string | null;
                licenseCategory: import(".prisma/client").$Enums.LicenseCategory;
                status: import(".prisma/client").$Enums.VerificationStatus;
                createdAt: Date;
                updatedAt: Date;
                licenseFrontUrl: string | null;
                licenseBackUrl: string | null;
                idCardUrl: string | null;
                addressProofUrl: string | null;
                licenseExpiry: Date | null;
                idNumber: string | null;
                idExpiry: Date | null;
                aiMetadata: import("@prisma/client/runtime/library").JsonValue | null;
                rejectionReason: string | null;
                verifiedAt: Date | null;
            } | null;
            bookings: {
                userId: string;
                id: string;
                status: import(".prisma/client").$Enums.BookingStatus;
                createdAt: Date;
                updatedAt: Date;
                carId: string;
                startDate: Date;
                endDate: Date;
                pickupTime: string | null;
                returnTime: string | null;
                basePrice: number;
                taxAmount: number;
                surchargeAmount: number;
                depositAmount: number;
                startOdometer: number | null;
                endOdometer: number | null;
                damageFee: number;
                extraKmFee: number;
                returnNotes: string | null;
                totalPrice: number;
                bookingType: import(".prisma/client").$Enums.BookingType;
                repairOrderId: string | null;
            }[];
        } & {
            role: import(".prisma/client").$Enums.Role;
            id: string;
            fullName: string | null;
            email: string;
            facebookId: string | null;
            appleId: string | null;
            googleId: string | null;
            password: string | null;
            phoneNumber: string | null;
            avatarUrl: string | null;
            dateOfBirth: Date | null;
            fullAddress: string | null;
            createdAt: Date;
            updatedAt: Date;
        }) | null>;
        user: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<({
            verification: {
                userId: string;
                id: string;
                licenseNumber: string | null;
                licenseCategory: import(".prisma/client").$Enums.LicenseCategory;
                status: import(".prisma/client").$Enums.VerificationStatus;
                createdAt: Date;
                updatedAt: Date;
                licenseFrontUrl: string | null;
                licenseBackUrl: string | null;
                idCardUrl: string | null;
                addressProofUrl: string | null;
                licenseExpiry: Date | null;
                idNumber: string | null;
                idExpiry: Date | null;
                aiMetadata: import("@prisma/client/runtime/library").JsonValue | null;
                rejectionReason: string | null;
                verifiedAt: Date | null;
            } | null;
            bookings: {
                userId: string;
                id: string;
                status: import(".prisma/client").$Enums.BookingStatus;
                createdAt: Date;
                updatedAt: Date;
                carId: string;
                startDate: Date;
                endDate: Date;
                pickupTime: string | null;
                returnTime: string | null;
                basePrice: number;
                taxAmount: number;
                surchargeAmount: number;
                depositAmount: number;
                startOdometer: number | null;
                endOdometer: number | null;
                damageFee: number;
                extraKmFee: number;
                returnNotes: string | null;
                totalPrice: number;
                bookingType: import(".prisma/client").$Enums.BookingType;
                repairOrderId: string | null;
            }[];
        } & {
            role: import(".prisma/client").$Enums.Role;
            id: string;
            fullName: string | null;
            email: string;
            facebookId: string | null;
            appleId: string | null;
            googleId: string | null;
            password: string | null;
            phoneNumber: string | null;
            avatarUrl: string | null;
            dateOfBirth: Date | null;
            fullAddress: string | null;
            createdAt: Date;
            updatedAt: Date;
        }) | null>;
        users: (_: any, __: any, context: any) => Promise<({
            verification: {
                userId: string;
                id: string;
                licenseNumber: string | null;
                licenseCategory: import(".prisma/client").$Enums.LicenseCategory;
                status: import(".prisma/client").$Enums.VerificationStatus;
                createdAt: Date;
                updatedAt: Date;
                licenseFrontUrl: string | null;
                licenseBackUrl: string | null;
                idCardUrl: string | null;
                addressProofUrl: string | null;
                licenseExpiry: Date | null;
                idNumber: string | null;
                idExpiry: Date | null;
                aiMetadata: import("@prisma/client/runtime/library").JsonValue | null;
                rejectionReason: string | null;
                verifiedAt: Date | null;
            } | null;
            bookings: {
                userId: string;
                id: string;
                status: import(".prisma/client").$Enums.BookingStatus;
                createdAt: Date;
                updatedAt: Date;
                carId: string;
                startDate: Date;
                endDate: Date;
                pickupTime: string | null;
                returnTime: string | null;
                basePrice: number;
                taxAmount: number;
                surchargeAmount: number;
                depositAmount: number;
                startOdometer: number | null;
                endOdometer: number | null;
                damageFee: number;
                extraKmFee: number;
                returnNotes: string | null;
                totalPrice: number;
                bookingType: import(".prisma/client").$Enums.BookingType;
                repairOrderId: string | null;
            }[];
        } & {
            role: import(".prisma/client").$Enums.Role;
            id: string;
            fullName: string | null;
            email: string;
            facebookId: string | null;
            appleId: string | null;
            googleId: string | null;
            password: string | null;
            phoneNumber: string | null;
            avatarUrl: string | null;
            dateOfBirth: Date | null;
            fullAddress: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[]>;
        myVerification: (_: any, __: any, context: any) => Promise<{
            userId: string;
            id: string;
            licenseNumber: string | null;
            licenseCategory: import(".prisma/client").$Enums.LicenseCategory;
            status: import(".prisma/client").$Enums.VerificationStatus;
            createdAt: Date;
            updatedAt: Date;
            licenseFrontUrl: string | null;
            licenseBackUrl: string | null;
            idCardUrl: string | null;
            addressProofUrl: string | null;
            licenseExpiry: Date | null;
            idNumber: string | null;
            idExpiry: Date | null;
            aiMetadata: import("@prisma/client/runtime/library").JsonValue | null;
            rejectionReason: string | null;
            verifiedAt: Date | null;
        } | null>;
    };
    Mutation: {
        register: (_: any, { input }: {
            input: any;
        }) => Promise<{
            token: string;
            user: {
                role: import(".prisma/client").$Enums.Role;
                id: string;
                fullName: string | null;
                email: string;
                facebookId: string | null;
                appleId: string | null;
                googleId: string | null;
                password: string | null;
                phoneNumber: string | null;
                avatarUrl: string | null;
                dateOfBirth: Date | null;
                fullAddress: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            message: string;
        }>;
        login: (_: any, { input }: {
            input: any;
        }) => Promise<{
            token: string;
            user: {
                role: import(".prisma/client").$Enums.Role;
                id: string;
                fullName: string | null;
                email: string;
                facebookId: string | null;
                appleId: string | null;
                googleId: string | null;
                password: string | null;
                phoneNumber: string | null;
                avatarUrl: string | null;
                dateOfBirth: Date | null;
                fullAddress: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        }>;
        googleLogin: (_: any, { idToken }: {
            idToken: string;
        }) => Promise<{
            token: string;
            user: {
                role: import(".prisma/client").$Enums.Role;
                id: string;
                fullName: string | null;
                email: string;
                facebookId: string | null;
                appleId: string | null;
                googleId: string | null;
                password: string | null;
                phoneNumber: string | null;
                avatarUrl: string | null;
                dateOfBirth: Date | null;
                fullAddress: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            message: string;
        }>;
        createOrUpdateVerification: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<{
            userId: string;
            id: string;
            licenseNumber: string | null;
            licenseCategory: import(".prisma/client").$Enums.LicenseCategory;
            status: import(".prisma/client").$Enums.VerificationStatus;
            createdAt: Date;
            updatedAt: Date;
            licenseFrontUrl: string | null;
            licenseBackUrl: string | null;
            idCardUrl: string | null;
            addressProofUrl: string | null;
            licenseExpiry: Date | null;
            idNumber: string | null;
            idExpiry: Date | null;
            aiMetadata: import("@prisma/client/runtime/library").JsonValue | null;
            rejectionReason: string | null;
            verifiedAt: Date | null;
        }>;
        verifyDocument: (_: any, { userId, status, reason }: any, context: any) => Promise<{
            userId: string;
            id: string;
            licenseNumber: string | null;
            licenseCategory: import(".prisma/client").$Enums.LicenseCategory;
            status: import(".prisma/client").$Enums.VerificationStatus;
            createdAt: Date;
            updatedAt: Date;
            licenseFrontUrl: string | null;
            licenseBackUrl: string | null;
            idCardUrl: string | null;
            addressProofUrl: string | null;
            licenseExpiry: Date | null;
            idNumber: string | null;
            idExpiry: Date | null;
            aiMetadata: import("@prisma/client/runtime/library").JsonValue | null;
            rejectionReason: string | null;
            verifiedAt: Date | null;
        }>;
        processDocumentOCR: (_: any, { file, documentType, side }: any, context: any) => Promise<import("../../services/ocrService").ExtractedDocumentData>;
        updateUser: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<{
            role: import(".prisma/client").$Enums.Role;
            id: string;
            fullName: string | null;
            email: string;
            facebookId: string | null;
            appleId: string | null;
            googleId: string | null;
            password: string | null;
            phoneNumber: string | null;
            avatarUrl: string | null;
            dateOfBirth: Date | null;
            fullAddress: string | null;
            createdAt: Date;
            updatedAt: Date;
        }>;
        deleteUser: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<boolean>;
    };
};
//# sourceMappingURL=userResolvers.d.ts.map