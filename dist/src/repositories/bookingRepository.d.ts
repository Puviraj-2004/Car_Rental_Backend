import { BookingStatus } from '@prisma/client';
/**
 * Senior Architect Note:
 * Centralized Include configurations.
 * Added 'images: true' to admin section to prevent "Cannot return null for non-nullable field Car.images" errors.
 */
export declare const BOOKING_INCLUDES: {
    basic: {
        user: boolean;
        car: {
            include: {
                model: {
                    include: {
                        brand: boolean;
                    };
                };
                images: boolean;
            };
        };
        payment: boolean;
        verification: boolean;
        documentVerification: boolean;
    };
    detailed: {
        user: boolean;
        car: {
            include: {
                model: {
                    include: {
                        brand: boolean;
                    };
                };
                images: boolean;
            };
        };
        payment: boolean;
        verification: boolean;
        documentVerification: boolean;
    };
    admin: {
        user: boolean;
        car: {
            include: {
                model: {
                    include: {
                        brand: boolean;
                    };
                };
                images: boolean;
            };
        };
        payment: boolean;
        verification: boolean;
        documentVerification: boolean;
    };
};
export declare class BookingRepository {
    findMany(where?: any, include?: any, orderBy?: any): Promise<({
        [x: string]: never;
        [x: number]: never;
        [x: symbol]: never;
    } & {
        id: string;
        startDate: Date;
        endDate: Date;
        carId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.BookingStatus;
        userId: string | null;
        pickupTime: string | null;
        returnTime: string | null;
        basePrice: number;
        taxAmount: number;
        depositAmount: number;
        startOdometer: number | null;
        endOdometer: number | null;
        pickupNotes: string | null;
        damageFee: number;
        extraKmFee: number;
        returnNotes: string | null;
        totalPrice: number;
        bookingType: import(".prisma/client").$Enums.BookingType;
        repairOrderId: string | null;
        createdByAdmin: boolean;
        isWalkIn: boolean;
        guestName: string | null;
        guestPhone: string | null;
        guestEmail: string | null;
    })[]>;
    findUnique(id: string, include?: any): Promise<({
        [x: string]: never;
        [x: number]: never;
        [x: symbol]: never;
    } & {
        id: string;
        startDate: Date;
        endDate: Date;
        carId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.BookingStatus;
        userId: string | null;
        pickupTime: string | null;
        returnTime: string | null;
        basePrice: number;
        taxAmount: number;
        depositAmount: number;
        startOdometer: number | null;
        endOdometer: number | null;
        pickupNotes: string | null;
        damageFee: number;
        extraKmFee: number;
        returnNotes: string | null;
        totalPrice: number;
        bookingType: import(".prisma/client").$Enums.BookingType;
        repairOrderId: string | null;
        createdByAdmin: boolean;
        isWalkIn: boolean;
        guestName: string | null;
        guestPhone: string | null;
        guestEmail: string | null;
    }) | null>;
    findFirst(where: any, include?: any): Promise<({
        [x: string]: never;
        [x: number]: never;
        [x: symbol]: never;
    } & {
        id: string;
        startDate: Date;
        endDate: Date;
        carId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.BookingStatus;
        userId: string | null;
        pickupTime: string | null;
        returnTime: string | null;
        basePrice: number;
        taxAmount: number;
        depositAmount: number;
        startOdometer: number | null;
        endOdometer: number | null;
        pickupNotes: string | null;
        damageFee: number;
        extraKmFee: number;
        returnNotes: string | null;
        totalPrice: number;
        bookingType: import(".prisma/client").$Enums.BookingType;
        repairOrderId: string | null;
        createdByAdmin: boolean;
        isWalkIn: boolean;
        guestName: string | null;
        guestPhone: string | null;
        guestEmail: string | null;
    }) | null>;
    findVerificationToken(token: string): Promise<{
        id: string;
        bookingId: string;
        createdAt: Date;
        updatedAt: Date;
        verifiedAt: Date | null;
        token: string;
        expiresAt: Date;
        isVerified: boolean;
    } | null>;
    updateBookingStatus(id: string, status: BookingStatus): Promise<{
        id: string;
        startDate: Date;
        endDate: Date;
        carId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.BookingStatus;
        userId: string | null;
        pickupTime: string | null;
        returnTime: string | null;
        basePrice: number;
        taxAmount: number;
        depositAmount: number;
        startOdometer: number | null;
        endOdometer: number | null;
        pickupNotes: string | null;
        damageFee: number;
        extraKmFee: number;
        returnNotes: string | null;
        totalPrice: number;
        bookingType: import(".prisma/client").$Enums.BookingType;
        repairOrderId: string | null;
        createdByAdmin: boolean;
        isWalkIn: boolean;
        guestName: string | null;
        guestPhone: string | null;
        guestEmail: string | null;
    }>;
    findConflicts(carId: string, startDate: Date, endDate: Date, excludeBookingId?: string): Promise<({
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
            emailVerified: boolean;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
        } | null;
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
        userId: string | null;
        pickupTime: string | null;
        returnTime: string | null;
        basePrice: number;
        taxAmount: number;
        depositAmount: number;
        startOdometer: number | null;
        endOdometer: number | null;
        pickupNotes: string | null;
        damageFee: number;
        extraKmFee: number;
        returnNotes: string | null;
        totalPrice: number;
        bookingType: import(".prisma/client").$Enums.BookingType;
        repairOrderId: string | null;
        createdByAdmin: boolean;
        isWalkIn: boolean;
        guestName: string | null;
        guestPhone: string | null;
        guestEmail: string | null;
    })[]>;
    create(data: any): Promise<{
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
            emailVerified: boolean;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
        } | null;
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
        userId: string | null;
        pickupTime: string | null;
        returnTime: string | null;
        basePrice: number;
        taxAmount: number;
        depositAmount: number;
        startOdometer: number | null;
        endOdometer: number | null;
        pickupNotes: string | null;
        damageFee: number;
        extraKmFee: number;
        returnNotes: string | null;
        totalPrice: number;
        bookingType: import(".prisma/client").$Enums.BookingType;
        repairOrderId: string | null;
        createdByAdmin: boolean;
        isWalkIn: boolean;
        guestName: string | null;
        guestPhone: string | null;
        guestEmail: string | null;
    }>;
    update(id: string, data: any): Promise<{
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
            emailVerified: boolean;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
        } | null;
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
        userId: string | null;
        pickupTime: string | null;
        returnTime: string | null;
        basePrice: number;
        taxAmount: number;
        depositAmount: number;
        startOdometer: number | null;
        endOdometer: number | null;
        pickupNotes: string | null;
        damageFee: number;
        extraKmFee: number;
        returnNotes: string | null;
        totalPrice: number;
        bookingType: import(".prisma/client").$Enums.BookingType;
        repairOrderId: string | null;
        createdByAdmin: boolean;
        isWalkIn: boolean;
        guestName: string | null;
        guestPhone: string | null;
        guestEmail: string | null;
    }>;
    delete(id: string): Promise<{
        id: string;
        startDate: Date;
        endDate: Date;
        carId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.BookingStatus;
        userId: string | null;
        pickupTime: string | null;
        returnTime: string | null;
        basePrice: number;
        taxAmount: number;
        depositAmount: number;
        startOdometer: number | null;
        endOdometer: number | null;
        pickupNotes: string | null;
        damageFee: number;
        extraKmFee: number;
        returnNotes: string | null;
        totalPrice: number;
        bookingType: import(".prisma/client").$Enums.BookingType;
        repairOrderId: string | null;
        createdByAdmin: boolean;
        isWalkIn: boolean;
        guestName: string | null;
        guestPhone: string | null;
        guestEmail: string | null;
    }>;
    startTripTransaction(bookingId: string, carId: string): Promise<[{
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
            emailVerified: boolean;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
        } | null;
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
        userId: string | null;
        pickupTime: string | null;
        returnTime: string | null;
        basePrice: number;
        taxAmount: number;
        depositAmount: number;
        startOdometer: number | null;
        endOdometer: number | null;
        pickupNotes: string | null;
        damageFee: number;
        extraKmFee: number;
        returnNotes: string | null;
        totalPrice: number;
        bookingType: import(".prisma/client").$Enums.BookingType;
        repairOrderId: string | null;
        createdByAdmin: boolean;
        isWalkIn: boolean;
        guestName: string | null;
        guestPhone: string | null;
        guestEmail: string | null;
    }, {
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
    }]>;
    completeTripTransaction(bookingId: string, carId: string): Promise<[{
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
            emailVerified: boolean;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            updatedAt: Date;
        } | null;
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
        userId: string | null;
        pickupTime: string | null;
        returnTime: string | null;
        basePrice: number;
        taxAmount: number;
        depositAmount: number;
        startOdometer: number | null;
        endOdometer: number | null;
        pickupNotes: string | null;
        damageFee: number;
        extraKmFee: number;
        returnNotes: string | null;
        totalPrice: number;
        bookingType: import(".prisma/client").$Enums.BookingType;
        repairOrderId: string | null;
        createdByAdmin: boolean;
        isWalkIn: boolean;
        guestName: string | null;
        guestPhone: string | null;
        guestEmail: string | null;
    }, {
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
    }]>;
}
export declare const bookingRepository: BookingRepository;
//# sourceMappingURL=bookingRepository.d.ts.map