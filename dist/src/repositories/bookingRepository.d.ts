import { Prisma } from '@prisma/client';
export declare const BOOKING_INCLUDES: {
    basic: {
        car: {
            include: {
                model: {
                    include: {
                        brand: boolean;
                    };
                };
            };
        };
        payment: boolean;
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
            };
        };
        payment: boolean;
        verification: boolean;
    };
};
export declare class BookingRepository {
    findMany(where: Prisma.BookingWhereInput, include?: Prisma.BookingInclude, orderBy?: Prisma.BookingOrderByWithRelationInput): Promise<{
        id: string;
        startDate: Date;
        endDate: Date;
        carId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.BookingStatus;
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
    }[]>;
    findUnique(id: string, include?: Prisma.BookingInclude): Promise<{
        id: string;
        startDate: Date;
        endDate: Date;
        carId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.BookingStatus;
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
    } | null>;
    findFirst(where: Prisma.BookingWhereInput, include?: Prisma.BookingInclude): Promise<{
        id: string;
        startDate: Date;
        endDate: Date;
        carId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.BookingStatus;
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
    } | null>;
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
    findConflicts(carId: string, startDate: Date, endDate: Date): Promise<({
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
        userId: string;
        status: import(".prisma/client").$Enums.BookingStatus;
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
    })[]>;
    create(data: Prisma.BookingCreateInput): Promise<{
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
        } & {
            id: string;
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
    } & {
        id: string;
        startDate: Date;
        endDate: Date;
        carId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.BookingStatus;
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
    }>;
    update(id: string, data: Prisma.BookingUpdateInput, include?: Prisma.BookingInclude): Promise<{
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
        car: {
            id: string;
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
        userId: string;
        status: import(".prisma/client").$Enums.BookingStatus;
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
    }>;
    delete(id: string): Promise<{
        id: string;
        startDate: Date;
        endDate: Date;
        carId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.BookingStatus;
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
    }>;
    startTripTransaction(bookingId: string, carId: string): Promise<{
        id: string;
        startDate: Date;
        endDate: Date;
        carId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.BookingStatus;
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
    }>;
    completeTripTransaction(bookingId: string, carId: string): Promise<{
        id: string;
        startDate: Date;
        endDate: Date;
        carId: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.BookingStatus;
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
    }>;
}
export declare const bookingRepository: BookingRepository;
//# sourceMappingURL=bookingRepository.d.ts.map