export declare const bookingResolvers: {
    Query: {
        bookings: (_: any, __: any, context: any) => Promise<({
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
            car: {
                model: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    brandId: string;
                };
                brand: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    logoUrl: string | null;
                    logoPublicId: string | null;
                };
            } & {
                year: number;
                id: string;
                status: import(".prisma/client").$Enums.CarStatus;
                createdAt: Date;
                updatedAt: Date;
                brandId: string;
                modelId: string;
                plateNumber: string;
                fuelType: import(".prisma/client").$Enums.FuelType;
                transmission: import(".prisma/client").$Enums.TransmissionType;
                seats: number;
                mileage: number;
                pricePerHour: number | null;
                pricePerKm: number | null;
                pricePerDay: number | null;
                depositAmount: number;
                critAirRating: import(".prisma/client").$Enums.CritAirCategory;
                descriptionEn: string | null;
                descriptionFr: string | null;
            };
            payment: {
                id: string;
                status: import(".prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                updatedAt: Date;
                bookingId: string;
                amount: number;
                currency: string;
                paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
                transactionId: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
            } | null;
        } & {
            userId: string;
            id: string;
            status: import(".prisma/client").$Enums.BookingStatus;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            carId: string;
            depositAmount: number;
            pickupLocation: string | null;
            dropoffLocation: string | null;
            totalPrice: number;
            basePrice: number;
            taxAmount: number;
            rentalType: import(".prisma/client").$Enums.RentalType;
        })[]>;
        myBookings: (_: any, __: any, context: any) => Promise<({
            car: {
                model: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    brandId: string;
                };
                brand: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    logoUrl: string | null;
                    logoPublicId: string | null;
                };
                images: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    carId: string;
                    isPrimary: boolean;
                    imagePath: string;
                    publicId: string | null;
                    altText: string | null;
                }[];
            } & {
                year: number;
                id: string;
                status: import(".prisma/client").$Enums.CarStatus;
                createdAt: Date;
                updatedAt: Date;
                brandId: string;
                modelId: string;
                plateNumber: string;
                fuelType: import(".prisma/client").$Enums.FuelType;
                transmission: import(".prisma/client").$Enums.TransmissionType;
                seats: number;
                mileage: number;
                pricePerHour: number | null;
                pricePerKm: number | null;
                pricePerDay: number | null;
                depositAmount: number;
                critAirRating: import(".prisma/client").$Enums.CritAirCategory;
                descriptionEn: string | null;
                descriptionFr: string | null;
            };
            payment: {
                id: string;
                status: import(".prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                updatedAt: Date;
                bookingId: string;
                amount: number;
                currency: string;
                paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
                transactionId: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
            } | null;
        } & {
            userId: string;
            id: string;
            status: import(".prisma/client").$Enums.BookingStatus;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            carId: string;
            depositAmount: number;
            pickupLocation: string | null;
            dropoffLocation: string | null;
            totalPrice: number;
            basePrice: number;
            taxAmount: number;
            rentalType: import(".prisma/client").$Enums.RentalType;
        })[]>;
        booking: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<{
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
            car: {
                model: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    brandId: string;
                };
                brand: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    logoUrl: string | null;
                    logoPublicId: string | null;
                };
            } & {
                year: number;
                id: string;
                status: import(".prisma/client").$Enums.CarStatus;
                createdAt: Date;
                updatedAt: Date;
                brandId: string;
                modelId: string;
                plateNumber: string;
                fuelType: import(".prisma/client").$Enums.FuelType;
                transmission: import(".prisma/client").$Enums.TransmissionType;
                seats: number;
                mileage: number;
                pricePerHour: number | null;
                pricePerKm: number | null;
                pricePerDay: number | null;
                depositAmount: number;
                critAirRating: import(".prisma/client").$Enums.CritAirCategory;
                descriptionEn: string | null;
                descriptionFr: string | null;
            };
            payment: {
                id: string;
                status: import(".prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                updatedAt: Date;
                bookingId: string;
                amount: number;
                currency: string;
                paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
                transactionId: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
            } | null;
            verification: {
                id: string;
                createdAt: Date;
                bookingId: string;
                token: string;
                expiresAt: Date;
                isVerified: boolean;
                verifiedAt: Date | null;
            } | null;
        } & {
            userId: string;
            id: string;
            status: import(".prisma/client").$Enums.BookingStatus;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            carId: string;
            depositAmount: number;
            pickupLocation: string | null;
            dropoffLocation: string | null;
            totalPrice: number;
            basePrice: number;
            taxAmount: number;
            rentalType: import(".prisma/client").$Enums.RentalType;
        }>;
    };
    Mutation: {
        createBooking: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<{
            car: {
                model: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    brandId: string;
                };
                brand: {
                    name: string;
                    id: string;
                    createdAt: Date;
                    logoUrl: string | null;
                    logoPublicId: string | null;
                };
            } & {
                year: number;
                id: string;
                status: import(".prisma/client").$Enums.CarStatus;
                createdAt: Date;
                updatedAt: Date;
                brandId: string;
                modelId: string;
                plateNumber: string;
                fuelType: import(".prisma/client").$Enums.FuelType;
                transmission: import(".prisma/client").$Enums.TransmissionType;
                seats: number;
                mileage: number;
                pricePerHour: number | null;
                pricePerKm: number | null;
                pricePerDay: number | null;
                depositAmount: number;
                critAirRating: import(".prisma/client").$Enums.CritAirCategory;
                descriptionEn: string | null;
                descriptionFr: string | null;
            };
        } & {
            userId: string;
            id: string;
            status: import(".prisma/client").$Enums.BookingStatus;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            carId: string;
            depositAmount: number;
            pickupLocation: string | null;
            dropoffLocation: string | null;
            totalPrice: number;
            basePrice: number;
            taxAmount: number;
            rentalType: import(".prisma/client").$Enums.RentalType;
        }>;
        sendBookingVerificationLink: (_: any, { bookingId }: {
            bookingId: string;
        }, context: any) => Promise<{
            success: boolean;
            message: string;
            bookingId: string;
        }>;
        verifyBookingToken: (_: any, { token }: {
            token: string;
        }) => Promise<{
            success: boolean;
            message: string;
            bookingId: string;
        }>;
        updateBookingStatus: (_: any, { id, status }: {
            id: string;
            status: any;
        }, context: any) => Promise<{
            userId: string;
            id: string;
            status: import(".prisma/client").$Enums.BookingStatus;
            createdAt: Date;
            updatedAt: Date;
            startDate: Date;
            endDate: Date;
            carId: string;
            depositAmount: number;
            pickupLocation: string | null;
            dropoffLocation: string | null;
            totalPrice: number;
            basePrice: number;
            taxAmount: number;
            rentalType: import(".prisma/client").$Enums.RentalType;
        }>;
        cancelBooking: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<boolean>;
        deleteBooking: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<boolean>;
    };
};
//# sourceMappingURL=bookingResolvers.d.ts.map