export declare const userResolvers: {
    Query: {
        me: (_: any, __: any, context: any) => Promise<({
            bookings: {
                id: string;
                startDate: Date;
                endDate: Date;
                carId: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.BookingStatus;
                userId: string;
                pickupTime: string | null;
                returnTime: string | null;
                basePrice: number;
                taxAmount: number;
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
            id: string;
            email: string;
            facebookId: string | null;
            appleId: string | null;
            googleId: string | null;
            fullName: string | null;
            password: string | null;
            phoneNumber: string | null;
            avatarUrl: string | null;
            dateOfBirth: Date | null;
            fullAddress: string | null;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
        }) | null>;
        user: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<({
            bookings: {
                id: string;
                startDate: Date;
                endDate: Date;
                carId: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.BookingStatus;
                userId: string;
                pickupTime: string | null;
                returnTime: string | null;
                basePrice: number;
                taxAmount: number;
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
            id: string;
            email: string;
            facebookId: string | null;
            appleId: string | null;
            googleId: string | null;
            fullName: string | null;
            password: string | null;
            phoneNumber: string | null;
            avatarUrl: string | null;
            dateOfBirth: Date | null;
            fullAddress: string | null;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
        }) | null>;
        users: (_: any, __: any, context: any) => Promise<({
            bookings: {
                id: string;
                startDate: Date;
                endDate: Date;
                carId: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.BookingStatus;
                userId: string;
                pickupTime: string | null;
                returnTime: string | null;
                basePrice: number;
                taxAmount: number;
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
            id: string;
            email: string;
            facebookId: string | null;
            appleId: string | null;
            googleId: string | null;
            fullName: string | null;
            password: string | null;
            phoneNumber: string | null;
            avatarUrl: string | null;
            dateOfBirth: Date | null;
            fullAddress: string | null;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
        })[]>;
        myVerification: (_: any, __: any, context: any) => Promise<{
            id: string;
            bookingId: string;
            createdAt: Date;
            updatedAt: Date;
            licenseFrontUrl: string | null;
            licenseBackUrl: string | null;
            idCardUrl: string | null;
            idCardBackUrl: string | null;
            addressProofUrl: string | null;
            licenseNumber: string | null;
            licenseExpiry: Date | null;
            licenseIssueDate: Date | null;
            driverDob: Date | null;
            licenseCategories: import(".prisma/client").$Enums.LicenseCategory[];
            idNumber: string | null;
            idExpiry: Date | null;
            verifiedAddress: string | null;
            status: import(".prisma/client").$Enums.VerificationStatus;
            aiMetadata: import("@prisma/client/runtime/library").JsonValue | null;
            rejectionReason: string | null;
            verifiedAt: Date | null;
        } | null>;
        checkCarAvailability: (_: any, { carId, startDate, endDate, excludeBookingId }: any) => Promise<{
            available: boolean;
            conflictingBookings: ({
                user: {
                    id: string;
                    email: string;
                    facebookId: string | null;
                    appleId: string | null;
                    googleId: string | null;
                    fullName: string | null;
                    password: string | null;
                    phoneNumber: string | null;
                    avatarUrl: string | null;
                    dateOfBirth: Date | null;
                    fullAddress: string | null;
                    role: import(".prisma/client").$Enums.Role;
                    createdAt: Date;
                    updatedAt: Date;
                };
                documentVerification: {
                    id: string;
                    bookingId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    licenseFrontUrl: string | null;
                    licenseBackUrl: string | null;
                    idCardUrl: string | null;
                    idCardBackUrl: string | null;
                    addressProofUrl: string | null;
                    licenseNumber: string | null;
                    licenseExpiry: Date | null;
                    licenseIssueDate: Date | null;
                    driverDob: Date | null;
                    licenseCategories: import(".prisma/client").$Enums.LicenseCategory[];
                    idNumber: string | null;
                    idExpiry: Date | null;
                    verifiedAddress: string | null;
                    status: import(".prisma/client").$Enums.VerificationStatus;
                    aiMetadata: import("@prisma/client/runtime/library").JsonValue | null;
                    rejectionReason: string | null;
                    verifiedAt: Date | null;
                } | null;
                car: {
                    model: {
                        brand: {
                            id: string;
                            name: string;
                            logoUrl: string | null;
                        };
                    } & {
                        id: string;
                        brandId: string;
                        name: string;
                    };
                    images: {
                        id: string;
                        carId: string;
                        isPrimary: boolean;
                        url: string;
                    }[];
                } & {
                    id: string;
                    brandId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: import(".prisma/client").$Enums.CarStatus;
                    depositAmount: number;
                    year: number;
                    modelId: string;
                    plateNumber: string;
                    transmission: import(".prisma/client").$Enums.Transmission;
                    fuelType: import(".prisma/client").$Enums.FuelType | null;
                    seats: number;
                    requiredLicense: import(".prisma/client").$Enums.LicenseCategory;
                    pricePerDay: number;
                    dailyKmLimit: number | null;
                    extraKmCharge: number;
                    currentOdometer: number;
                    critAirRating: import(".prisma/client").$Enums.CritAirCategory;
                };
                payment: {
                    id: string;
                    bookingId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: import(".prisma/client").$Enums.PaymentStatus;
                    amount: number;
                    stripeId: string | null;
                } | null;
                verification: {
                    id: string;
                    bookingId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    verifiedAt: Date | null;
                    token: string;
                    expiresAt: Date;
                    isVerified: boolean;
                } | null;
            } & {
                id: string;
                startDate: Date;
                endDate: Date;
                carId: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.BookingStatus;
                userId: string;
                pickupTime: string | null;
                returnTime: string | null;
                basePrice: number;
                taxAmount: number;
                depositAmount: number;
                startOdometer: number | null;
                endOdometer: number | null;
                damageFee: number;
                extraKmFee: number;
                returnNotes: string | null;
                totalPrice: number;
                bookingType: import(".prisma/client").$Enums.BookingType;
                repairOrderId: string | null;
            })[];
        }>;
    };
    Mutation: {
        register: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<{
            token: string;
            user: {
                bookings: {
                    id: string;
                    startDate: Date;
                    endDate: Date;
                    carId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: import(".prisma/client").$Enums.BookingStatus;
                    userId: string;
                    pickupTime: string | null;
                    returnTime: string | null;
                    basePrice: number;
                    taxAmount: number;
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
                id: string;
                email: string;
                facebookId: string | null;
                appleId: string | null;
                googleId: string | null;
                fullName: string | null;
                password: string | null;
                phoneNumber: string | null;
                avatarUrl: string | null;
                dateOfBirth: Date | null;
                fullAddress: string | null;
                role: import(".prisma/client").$Enums.Role;
                createdAt: Date;
                updatedAt: Date;
            };
            message: string;
        }>;
        login: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<{
            token: string;
            user: {
                bookings: {
                    id: string;
                    startDate: Date;
                    endDate: Date;
                    carId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: import(".prisma/client").$Enums.BookingStatus;
                    userId: string;
                    pickupTime: string | null;
                    returnTime: string | null;
                    basePrice: number;
                    taxAmount: number;
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
                id: string;
                email: string;
                facebookId: string | null;
                appleId: string | null;
                googleId: string | null;
                fullName: string | null;
                password: string | null;
                phoneNumber: string | null;
                avatarUrl: string | null;
                dateOfBirth: Date | null;
                fullAddress: string | null;
                role: import(".prisma/client").$Enums.Role;
                createdAt: Date;
                updatedAt: Date;
            };
        }>;
        googleLogin: (_: any, { idToken }: {
            idToken: string;
        }) => Promise<{
            token: string;
            user: {
                bookings: {
                    id: string;
                    startDate: Date;
                    endDate: Date;
                    carId: string;
                    createdAt: Date;
                    updatedAt: Date;
                    status: import(".prisma/client").$Enums.BookingStatus;
                    userId: string;
                    pickupTime: string | null;
                    returnTime: string | null;
                    basePrice: number;
                    taxAmount: number;
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
                id: string;
                email: string;
                facebookId: string | null;
                appleId: string | null;
                googleId: string | null;
                fullName: string | null;
                password: string | null;
                phoneNumber: string | null;
                avatarUrl: string | null;
                dateOfBirth: Date | null;
                fullAddress: string | null;
                role: import(".prisma/client").$Enums.Role;
                createdAt: Date;
                updatedAt: Date;
            };
            message: string;
        }>;
        createOrUpdateVerification: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<{
            booking: {
                user: {
                    id: string;
                    email: string;
                    facebookId: string | null;
                    appleId: string | null;
                    googleId: string | null;
                    fullName: string | null;
                    password: string | null;
                    phoneNumber: string | null;
                    avatarUrl: string | null;
                    dateOfBirth: Date | null;
                    fullAddress: string | null;
                    role: import(".prisma/client").$Enums.Role;
                    createdAt: Date;
                    updatedAt: Date;
                };
            } & {
                id: string;
                startDate: Date;
                endDate: Date;
                carId: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.BookingStatus;
                userId: string;
                pickupTime: string | null;
                returnTime: string | null;
                basePrice: number;
                taxAmount: number;
                depositAmount: number;
                startOdometer: number | null;
                endOdometer: number | null;
                damageFee: number;
                extraKmFee: number;
                returnNotes: string | null;
                totalPrice: number;
                bookingType: import(".prisma/client").$Enums.BookingType;
                repairOrderId: string | null;
            };
        } & {
            id: string;
            bookingId: string;
            createdAt: Date;
            updatedAt: Date;
            licenseFrontUrl: string | null;
            licenseBackUrl: string | null;
            idCardUrl: string | null;
            idCardBackUrl: string | null;
            addressProofUrl: string | null;
            licenseNumber: string | null;
            licenseExpiry: Date | null;
            licenseIssueDate: Date | null;
            driverDob: Date | null;
            licenseCategories: import(".prisma/client").$Enums.LicenseCategory[];
            idNumber: string | null;
            idExpiry: Date | null;
            verifiedAddress: string | null;
            status: import(".prisma/client").$Enums.VerificationStatus;
            aiMetadata: import("@prisma/client/runtime/library").JsonValue | null;
            rejectionReason: string | null;
            verifiedAt: Date | null;
        }>;
        verifyDocument: (_: any, { userId, status }: any, context: any) => Promise<{
            id: string;
            bookingId: string;
            createdAt: Date;
            updatedAt: Date;
            licenseFrontUrl: string | null;
            licenseBackUrl: string | null;
            idCardUrl: string | null;
            idCardBackUrl: string | null;
            addressProofUrl: string | null;
            licenseNumber: string | null;
            licenseExpiry: Date | null;
            licenseIssueDate: Date | null;
            driverDob: Date | null;
            licenseCategories: import(".prisma/client").$Enums.LicenseCategory[];
            idNumber: string | null;
            idExpiry: Date | null;
            verifiedAddress: string | null;
            status: import(".prisma/client").$Enums.VerificationStatus;
            aiMetadata: import("@prisma/client/runtime/library").JsonValue | null;
            rejectionReason: string | null;
            verifiedAt: Date | null;
        }>;
        processDocumentOCR: (_: any, { file, documentType, side }: any, context: any) => Promise<import("../../services/ocrService").ExtractedDocumentData>;
        updateUser: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<{
            bookings: {
                id: string;
                startDate: Date;
                endDate: Date;
                carId: string;
                createdAt: Date;
                updatedAt: Date;
                status: import(".prisma/client").$Enums.BookingStatus;
                userId: string;
                pickupTime: string | null;
                returnTime: string | null;
                basePrice: number;
                taxAmount: number;
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
            id: string;
            email: string;
            facebookId: string | null;
            appleId: string | null;
            googleId: string | null;
            fullName: string | null;
            password: string | null;
            phoneNumber: string | null;
            avatarUrl: string | null;
            dateOfBirth: Date | null;
            fullAddress: string | null;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
        }>;
        deleteUser: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<boolean>;
    };
};
//# sourceMappingURL=userResolvers.d.ts.map