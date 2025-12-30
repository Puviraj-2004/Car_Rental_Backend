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
                extraKmCharge: number | null;
                depositAmount: number;
                brandId: string;
                modelId: string;
                plateNumber: string;
                fuelType: import(".prisma/client").$Enums.FuelType;
                transmission: import(".prisma/client").$Enums.TransmissionType;
                seats: number;
                mileage: number;
                dailyKmLimit: number | null;
                currentMileage: number;
                pricePerHour: number | null;
                pricePerKm: number | null;
                pricePerDay: number | null;
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
                currency: string;
                amount: number;
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
            carId: string;
            startDate: Date;
            endDate: Date;
            pickupLocation: string | null;
            dropoffLocation: string | null;
            startMeter: number | null;
            endMeter: number | null;
            allowedKm: number | null;
            extraKmUsed: number;
            extraKmCharge: number;
            totalPrice: number;
            totalFinalPrice: number | null;
            basePrice: number;
            taxAmount: number;
            depositAmount: number;
            rentalType: import(".prisma/client").$Enums.RentalType;
            bookingType: import(".prisma/client").$Enums.BookingType;
            surchargeAmount: number;
            repairOrderId: string | null;
            expiresAt: Date | null;
        })[]>;
        myBookings: (_: any, __: any, context: any) => Promise<({
            user: {
                driverProfile: {
                    userId: string;
                    id: string;
                    address: string | null;
                    status: import(".prisma/client").$Enums.VerificationStatus;
                    createdAt: Date;
                    updatedAt: Date;
                    licenseNumber: string | null;
                    licenseIssueDate: Date | null;
                    licenseExpiry: Date | null;
                    idProofNumber: string | null;
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
                extraKmCharge: number | null;
                depositAmount: number;
                brandId: string;
                modelId: string;
                plateNumber: string;
                fuelType: import(".prisma/client").$Enums.FuelType;
                transmission: import(".prisma/client").$Enums.TransmissionType;
                seats: number;
                mileage: number;
                dailyKmLimit: number | null;
                currentMileage: number;
                pricePerHour: number | null;
                pricePerKm: number | null;
                pricePerDay: number | null;
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
                currency: string;
                amount: number;
                paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
                transactionId: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
            } | null;
            verification: {
                id: string;
                createdAt: Date;
                expiresAt: Date;
                bookingId: string;
                token: string;
                isVerified: boolean;
                verifiedAt: Date | null;
            } | null;
        } & {
            userId: string;
            id: string;
            status: import(".prisma/client").$Enums.BookingStatus;
            createdAt: Date;
            updatedAt: Date;
            carId: string;
            startDate: Date;
            endDate: Date;
            pickupLocation: string | null;
            dropoffLocation: string | null;
            startMeter: number | null;
            endMeter: number | null;
            allowedKm: number | null;
            extraKmUsed: number;
            extraKmCharge: number;
            totalPrice: number;
            totalFinalPrice: number | null;
            basePrice: number;
            taxAmount: number;
            depositAmount: number;
            rentalType: import(".prisma/client").$Enums.RentalType;
            bookingType: import(".prisma/client").$Enums.BookingType;
            surchargeAmount: number;
            repairOrderId: string | null;
            expiresAt: Date | null;
        })[]>;
        checkCarAvailability: (_: any, { carId, startDate, endDate }: {
            carId: string;
            startDate: string;
            endDate: string;
        }) => Promise<{
            available: boolean;
            conflictingBookings?: any[];
        }>;
        booking: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<({
            user: {
                driverProfile: {
                    userId: string;
                    id: string;
                    address: string | null;
                    status: import(".prisma/client").$Enums.VerificationStatus;
                    createdAt: Date;
                    updatedAt: Date;
                    licenseNumber: string | null;
                    licenseIssueDate: Date | null;
                    licenseExpiry: Date | null;
                    idProofNumber: string | null;
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
                extraKmCharge: number | null;
                depositAmount: number;
                brandId: string;
                modelId: string;
                plateNumber: string;
                fuelType: import(".prisma/client").$Enums.FuelType;
                transmission: import(".prisma/client").$Enums.TransmissionType;
                seats: number;
                mileage: number;
                dailyKmLimit: number | null;
                currentMileage: number;
                pricePerHour: number | null;
                pricePerKm: number | null;
                pricePerDay: number | null;
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
                currency: string;
                amount: number;
                paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
                transactionId: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
            } | null;
            verification: {
                id: string;
                createdAt: Date;
                expiresAt: Date;
                bookingId: string;
                token: string;
                isVerified: boolean;
                verifiedAt: Date | null;
            } | null;
        } & {
            userId: string;
            id: string;
            status: import(".prisma/client").$Enums.BookingStatus;
            createdAt: Date;
            updatedAt: Date;
            carId: string;
            startDate: Date;
            endDate: Date;
            pickupLocation: string | null;
            dropoffLocation: string | null;
            startMeter: number | null;
            endMeter: number | null;
            allowedKm: number | null;
            extraKmUsed: number;
            extraKmCharge: number;
            totalPrice: number;
            totalFinalPrice: number | null;
            basePrice: number;
            taxAmount: number;
            depositAmount: number;
            rentalType: import(".prisma/client").$Enums.RentalType;
            bookingType: import(".prisma/client").$Enums.BookingType;
            surchargeAmount: number;
            repairOrderId: string | null;
            expiresAt: Date | null;
        }) | null>;
        userBookings: (_: any, { userId }: {
            userId: string;
        }, context: any) => Promise<({
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
                extraKmCharge: number | null;
                depositAmount: number;
                brandId: string;
                modelId: string;
                plateNumber: string;
                fuelType: import(".prisma/client").$Enums.FuelType;
                transmission: import(".prisma/client").$Enums.TransmissionType;
                seats: number;
                mileage: number;
                dailyKmLimit: number | null;
                currentMileage: number;
                pricePerHour: number | null;
                pricePerKm: number | null;
                pricePerDay: number | null;
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
                currency: string;
                amount: number;
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
            carId: string;
            startDate: Date;
            endDate: Date;
            pickupLocation: string | null;
            dropoffLocation: string | null;
            startMeter: number | null;
            endMeter: number | null;
            allowedKm: number | null;
            extraKmUsed: number;
            extraKmCharge: number;
            totalPrice: number;
            totalFinalPrice: number | null;
            basePrice: number;
            taxAmount: number;
            depositAmount: number;
            rentalType: import(".prisma/client").$Enums.RentalType;
            bookingType: import(".prisma/client").$Enums.BookingType;
            surchargeAmount: number;
            repairOrderId: string | null;
            expiresAt: Date | null;
        })[]>;
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
                extraKmCharge: number | null;
                depositAmount: number;
                brandId: string;
                modelId: string;
                plateNumber: string;
                fuelType: import(".prisma/client").$Enums.FuelType;
                transmission: import(".prisma/client").$Enums.TransmissionType;
                seats: number;
                mileage: number;
                dailyKmLimit: number | null;
                currentMileage: number;
                pricePerHour: number | null;
                pricePerKm: number | null;
                pricePerDay: number | null;
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
            carId: string;
            startDate: Date;
            endDate: Date;
            pickupLocation: string | null;
            dropoffLocation: string | null;
            startMeter: number | null;
            endMeter: number | null;
            allowedKm: number | null;
            extraKmUsed: number;
            extraKmCharge: number;
            totalPrice: number;
            totalFinalPrice: number | null;
            basePrice: number;
            taxAmount: number;
            depositAmount: number;
            rentalType: import(".prisma/client").$Enums.RentalType;
            bookingType: import(".prisma/client").$Enums.BookingType;
            surchargeAmount: number;
            repairOrderId: string | null;
            expiresAt: Date | null;
        }>;
        confirmBooking: (_: any, { bookingId }: {
            bookingId: string;
        }, context: any) => Promise<{
            success: boolean;
            message: string;
            booking: ({
                user: {
                    driverProfile: {
                        userId: string;
                        id: string;
                        address: string | null;
                        status: import(".prisma/client").$Enums.VerificationStatus;
                        createdAt: Date;
                        updatedAt: Date;
                        licenseNumber: string | null;
                        licenseIssueDate: Date | null;
                        licenseExpiry: Date | null;
                        idProofNumber: string | null;
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
                    extraKmCharge: number | null;
                    depositAmount: number;
                    brandId: string;
                    modelId: string;
                    plateNumber: string;
                    fuelType: import(".prisma/client").$Enums.FuelType;
                    transmission: import(".prisma/client").$Enums.TransmissionType;
                    seats: number;
                    mileage: number;
                    dailyKmLimit: number | null;
                    currentMileage: number;
                    pricePerHour: number | null;
                    pricePerKm: number | null;
                    pricePerDay: number | null;
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
                    currency: string;
                    amount: number;
                    paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
                    transactionId: string | null;
                    metadata: import("@prisma/client/runtime/library").JsonValue | null;
                } | null;
                verification: {
                    id: string;
                    createdAt: Date;
                    expiresAt: Date;
                    bookingId: string;
                    token: string;
                    isVerified: boolean;
                    verifiedAt: Date | null;
                } | null;
            } & {
                userId: string;
                id: string;
                status: import(".prisma/client").$Enums.BookingStatus;
                createdAt: Date;
                updatedAt: Date;
                carId: string;
                startDate: Date;
                endDate: Date;
                pickupLocation: string | null;
                dropoffLocation: string | null;
                startMeter: number | null;
                endMeter: number | null;
                allowedKm: number | null;
                extraKmUsed: number;
                extraKmCharge: number;
                totalPrice: number;
                totalFinalPrice: number | null;
                basePrice: number;
                taxAmount: number;
                depositAmount: number;
                rentalType: import(".prisma/client").$Enums.RentalType;
                bookingType: import(".prisma/client").$Enums.BookingType;
                surchargeAmount: number;
                repairOrderId: string | null;
                expiresAt: Date | null;
            }) | null;
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
            bookingId: any;
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
            carId: string;
            startDate: Date;
            endDate: Date;
            pickupLocation: string | null;
            dropoffLocation: string | null;
            startMeter: number | null;
            endMeter: number | null;
            allowedKm: number | null;
            extraKmUsed: number;
            extraKmCharge: number;
            totalPrice: number;
            totalFinalPrice: number | null;
            basePrice: number;
            taxAmount: number;
            depositAmount: number;
            rentalType: import(".prisma/client").$Enums.RentalType;
            bookingType: import(".prisma/client").$Enums.BookingType;
            surchargeAmount: number;
            repairOrderId: string | null;
            expiresAt: Date | null;
        }>;
        cancelBooking: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<boolean>;
        deleteBooking: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<boolean>;
        updateMeterReadings: (_: any, { bookingId, input }: {
            bookingId: string;
            input: any;
        }, context: any) => Promise<{
            user: {
                driverProfile: {
                    userId: string;
                    id: string;
                    address: string | null;
                    status: import(".prisma/client").$Enums.VerificationStatus;
                    createdAt: Date;
                    updatedAt: Date;
                    licenseNumber: string | null;
                    licenseIssueDate: Date | null;
                    licenseExpiry: Date | null;
                    idProofNumber: string | null;
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
                extraKmCharge: number | null;
                depositAmount: number;
                brandId: string;
                modelId: string;
                plateNumber: string;
                fuelType: import(".prisma/client").$Enums.FuelType;
                transmission: import(".prisma/client").$Enums.TransmissionType;
                seats: number;
                mileage: number;
                dailyKmLimit: number | null;
                currentMileage: number;
                pricePerHour: number | null;
                pricePerKm: number | null;
                pricePerDay: number | null;
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
                currency: string;
                amount: number;
                paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
                transactionId: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
            } | null;
            verification: {
                id: string;
                createdAt: Date;
                expiresAt: Date;
                bookingId: string;
                token: string;
                isVerified: boolean;
                verifiedAt: Date | null;
            } | null;
        } & {
            userId: string;
            id: string;
            status: import(".prisma/client").$Enums.BookingStatus;
            createdAt: Date;
            updatedAt: Date;
            carId: string;
            startDate: Date;
            endDate: Date;
            pickupLocation: string | null;
            dropoffLocation: string | null;
            startMeter: number | null;
            endMeter: number | null;
            allowedKm: number | null;
            extraKmUsed: number;
            extraKmCharge: number;
            totalPrice: number;
            totalFinalPrice: number | null;
            basePrice: number;
            taxAmount: number;
            depositAmount: number;
            rentalType: import(".prisma/client").$Enums.RentalType;
            bookingType: import(".prisma/client").$Enums.BookingType;
            surchargeAmount: number;
            repairOrderId: string | null;
            expiresAt: Date | null;
        }>;
        resendVerificationLink: (_: any, { bookingId }: {
            bookingId: string;
        }, context: any) => Promise<{
            success: boolean;
            message: string;
            expiresAt: string;
        }>;
        finalizeBookingReturn: (_: any, { bookingId }: {
            bookingId: string;
        }, context: any) => Promise<{
            user: {
                driverProfile: {
                    userId: string;
                    id: string;
                    address: string | null;
                    status: import(".prisma/client").$Enums.VerificationStatus;
                    createdAt: Date;
                    updatedAt: Date;
                    licenseNumber: string | null;
                    licenseIssueDate: Date | null;
                    licenseExpiry: Date | null;
                    idProofNumber: string | null;
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
                extraKmCharge: number | null;
                depositAmount: number;
                brandId: string;
                modelId: string;
                plateNumber: string;
                fuelType: import(".prisma/client").$Enums.FuelType;
                transmission: import(".prisma/client").$Enums.TransmissionType;
                seats: number;
                mileage: number;
                dailyKmLimit: number | null;
                currentMileage: number;
                pricePerHour: number | null;
                pricePerKm: number | null;
                pricePerDay: number | null;
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
                currency: string;
                amount: number;
                paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
                transactionId: string | null;
                metadata: import("@prisma/client/runtime/library").JsonValue | null;
            } | null;
            verification: {
                id: string;
                createdAt: Date;
                expiresAt: Date;
                bookingId: string;
                token: string;
                isVerified: boolean;
                verifiedAt: Date | null;
            } | null;
        } & {
            userId: string;
            id: string;
            status: import(".prisma/client").$Enums.BookingStatus;
            createdAt: Date;
            updatedAt: Date;
            carId: string;
            startDate: Date;
            endDate: Date;
            pickupLocation: string | null;
            dropoffLocation: string | null;
            startMeter: number | null;
            endMeter: number | null;
            allowedKm: number | null;
            extraKmUsed: number;
            extraKmCharge: number;
            totalPrice: number;
            totalFinalPrice: number | null;
            basePrice: number;
            taxAmount: number;
            depositAmount: number;
            rentalType: import(".prisma/client").$Enums.RentalType;
            bookingType: import(".prisma/client").$Enums.BookingType;
            surchargeAmount: number;
            repairOrderId: string | null;
            expiresAt: Date | null;
        }>;
    };
};
//# sourceMappingURL=bookingResolvers.d.ts.map