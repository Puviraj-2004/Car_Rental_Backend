import { ExtractedDocumentData } from '../../services/ocrService';
export declare const userResolvers: {
    Query: {
        me: (_: any, __: any, context: any) => Promise<({
            driverProfile: {
                userId: string;
                id: string;
                status: import(".prisma/client").$Enums.VerificationStatus;
                createdAt: Date;
                updatedAt: Date;
                licenseNumber: string | null;
                licenseIssueDate: Date | null;
                licenseExpiry: Date | null;
                idProofNumber: string | null;
                address: string | null;
                dateOfBirth: Date | null;
                licenseFrontUrl: string | null;
                licenseBackUrl: string | null;
                idProofUrl: string | null;
                addressProofUrl: string | null;
                licenseFrontPublicId: string | null;
                licenseBackPublicId: string | null;
                idProofPublicId: string | null;
                addressProofPublicId: string | null;
                verificationNote: string | null;
            } | null;
            bookings: {
                userId: string;
                id: string;
                status: import(".prisma/client").$Enums.BookingStatus;
                createdAt: Date;
                updatedAt: Date;
                startDate: Date;
                endDate: Date;
                carId: string;
                extraKmCharge: number;
                depositAmount: number;
                pickupLocation: string | null;
                dropoffLocation: string | null;
                startMeter: number | null;
                endMeter: number | null;
                allowedKm: number | null;
                extraKmUsed: number;
                totalPrice: number;
                totalFinalPrice: number | null;
                basePrice: number;
                taxAmount: number;
                rentalType: import(".prisma/client").$Enums.RentalType;
                bookingType: import(".prisma/client").$Enums.BookingType;
                surchargeAmount: number;
                repairOrderId: string | null;
                expiresAt: Date | null;
            }[];
        } & {
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
        }) | null>;
        user: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<({
            driverProfile: {
                userId: string;
                id: string;
                status: import(".prisma/client").$Enums.VerificationStatus;
                createdAt: Date;
                updatedAt: Date;
                licenseNumber: string | null;
                licenseIssueDate: Date | null;
                licenseExpiry: Date | null;
                idProofNumber: string | null;
                address: string | null;
                dateOfBirth: Date | null;
                licenseFrontUrl: string | null;
                licenseBackUrl: string | null;
                idProofUrl: string | null;
                addressProofUrl: string | null;
                licenseFrontPublicId: string | null;
                licenseBackPublicId: string | null;
                idProofPublicId: string | null;
                addressProofPublicId: string | null;
                verificationNote: string | null;
            } | null;
            bookings: {
                userId: string;
                id: string;
                status: import(".prisma/client").$Enums.BookingStatus;
                createdAt: Date;
                updatedAt: Date;
                startDate: Date;
                endDate: Date;
                carId: string;
                extraKmCharge: number;
                depositAmount: number;
                pickupLocation: string | null;
                dropoffLocation: string | null;
                startMeter: number | null;
                endMeter: number | null;
                allowedKm: number | null;
                extraKmUsed: number;
                totalPrice: number;
                totalFinalPrice: number | null;
                basePrice: number;
                taxAmount: number;
                rentalType: import(".prisma/client").$Enums.RentalType;
                bookingType: import(".prisma/client").$Enums.BookingType;
                surchargeAmount: number;
                repairOrderId: string | null;
                expiresAt: Date | null;
            }[];
        } & {
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
        }) | null>;
        users: (_: any, __: any, context: any) => Promise<({
            driverProfile: {
                userId: string;
                id: string;
                status: import(".prisma/client").$Enums.VerificationStatus;
                createdAt: Date;
                updatedAt: Date;
                licenseNumber: string | null;
                licenseIssueDate: Date | null;
                licenseExpiry: Date | null;
                idProofNumber: string | null;
                address: string | null;
                dateOfBirth: Date | null;
                licenseFrontUrl: string | null;
                licenseBackUrl: string | null;
                idProofUrl: string | null;
                addressProofUrl: string | null;
                licenseFrontPublicId: string | null;
                licenseBackPublicId: string | null;
                idProofPublicId: string | null;
                addressProofPublicId: string | null;
                verificationNote: string | null;
            } | null;
            bookings: {
                userId: string;
                id: string;
                status: import(".prisma/client").$Enums.BookingStatus;
                createdAt: Date;
                updatedAt: Date;
                startDate: Date;
                endDate: Date;
                carId: string;
                extraKmCharge: number;
                depositAmount: number;
                pickupLocation: string | null;
                dropoffLocation: string | null;
                startMeter: number | null;
                endMeter: number | null;
                allowedKm: number | null;
                extraKmUsed: number;
                totalPrice: number;
                totalFinalPrice: number | null;
                basePrice: number;
                taxAmount: number;
                rentalType: import(".prisma/client").$Enums.RentalType;
                bookingType: import(".prisma/client").$Enums.BookingType;
                surchargeAmount: number;
                repairOrderId: string | null;
                expiresAt: Date | null;
            }[];
        } & {
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
        })[]>;
        myDriverProfile: (_: any, __: any, context: any) => Promise<{
            userId: string;
            id: string;
            status: import(".prisma/client").$Enums.VerificationStatus;
            createdAt: Date;
            updatedAt: Date;
            licenseNumber: string | null;
            licenseIssueDate: Date | null;
            licenseExpiry: Date | null;
            idProofNumber: string | null;
            address: string | null;
            dateOfBirth: Date | null;
            licenseFrontUrl: string | null;
            licenseBackUrl: string | null;
            idProofUrl: string | null;
            addressProofUrl: string | null;
            licenseFrontPublicId: string | null;
            licenseBackPublicId: string | null;
            idProofPublicId: string | null;
            addressProofPublicId: string | null;
            verificationNote: string | null;
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
            message: string;
        }>;
        login: (_: any, { input }: {
            input: any;
        }) => Promise<{
            token: string;
            user: {
                driverProfile: {
                    userId: string;
                    id: string;
                    status: import(".prisma/client").$Enums.VerificationStatus;
                    createdAt: Date;
                    updatedAt: Date;
                    licenseNumber: string | null;
                    licenseIssueDate: Date | null;
                    licenseExpiry: Date | null;
                    idProofNumber: string | null;
                    address: string | null;
                    dateOfBirth: Date | null;
                    licenseFrontUrl: string | null;
                    licenseBackUrl: string | null;
                    idProofUrl: string | null;
                    addressProofUrl: string | null;
                    licenseFrontPublicId: string | null;
                    licenseBackPublicId: string | null;
                    idProofPublicId: string | null;
                    addressProofPublicId: string | null;
                    verificationNote: string | null;
                } | null;
            } & {
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
        }>;
        googleLogin: (_: any, { idToken }: {
            idToken: string;
        }) => Promise<{
            token: string;
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
            message: string;
        }>;
        verifyOTP: (_: any, { email, otp }: {
            email: string;
            otp: string;
        }) => Promise<{
            success: boolean;
            message: string;
        }>;
        createOrUpdateDriverProfile: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<{
            userId: string;
            id: string;
            status: import(".prisma/client").$Enums.VerificationStatus;
            createdAt: Date;
            updatedAt: Date;
            licenseNumber: string | null;
            licenseIssueDate: Date | null;
            licenseExpiry: Date | null;
            idProofNumber: string | null;
            address: string | null;
            dateOfBirth: Date | null;
            licenseFrontUrl: string | null;
            licenseBackUrl: string | null;
            idProofUrl: string | null;
            addressProofUrl: string | null;
            licenseFrontPublicId: string | null;
            licenseBackPublicId: string | null;
            idProofPublicId: string | null;
            addressProofPublicId: string | null;
            verificationNote: string | null;
        }>;
        verifyDriverProfile: (_: any, { userId, status, note }: any, context: any) => Promise<{
            userId: string;
            id: string;
            status: import(".prisma/client").$Enums.VerificationStatus;
            createdAt: Date;
            updatedAt: Date;
            licenseNumber: string | null;
            licenseIssueDate: Date | null;
            licenseExpiry: Date | null;
            idProofNumber: string | null;
            address: string | null;
            dateOfBirth: Date | null;
            licenseFrontUrl: string | null;
            licenseBackUrl: string | null;
            idProofUrl: string | null;
            addressProofUrl: string | null;
            licenseFrontPublicId: string | null;
            licenseBackPublicId: string | null;
            idProofPublicId: string | null;
            addressProofPublicId: string | null;
            verificationNote: string | null;
        }>;
        processDocumentOCR: (_: any, { file }: {
            file: any;
        }, context: any) => Promise<ExtractedDocumentData>;
        updateUser: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<{
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
        }>;
        deleteUser: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<boolean>;
    };
};
//# sourceMappingURL=userResolvers.d.ts.map