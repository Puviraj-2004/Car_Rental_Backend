export declare const bookingResolvers: {
    Query: {
        bookings: (_: any, __: any, context: any) => Promise<({
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
            car: {
                model: {
                    brand: {
                        id: string;
                        name: string;
                        logoUrl: string | null;
                    };
                } & {
                    id: string;
                    name: string;
                    brandId: string;
                };
            } & {
                year: number;
                id: string;
                status: import(".prisma/client").$Enums.CarStatus;
                createdAt: Date;
                updatedAt: Date;
                depositAmount: number;
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
                status: import(".prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                updatedAt: Date;
                bookingId: string;
                amount: number;
                stripeId: string | null;
            } | null;
            verification: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                verifiedAt: Date | null;
                token: string;
                bookingId: string;
                expiresAt: Date;
                isVerified: boolean;
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
        myBookings: (_: any, __: any, context: any) => Promise<({
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
            car: {
                model: {
                    brand: {
                        id: string;
                        name: string;
                        logoUrl: string | null;
                    };
                } & {
                    id: string;
                    name: string;
                    brandId: string;
                };
                images: {
                    id: string;
                    carId: string;
                    isPrimary: boolean;
                    url: string;
                }[];
            } & {
                year: number;
                id: string;
                status: import(".prisma/client").$Enums.CarStatus;
                createdAt: Date;
                updatedAt: Date;
                depositAmount: number;
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
                status: import(".prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                updatedAt: Date;
                bookingId: string;
                amount: number;
                stripeId: string | null;
            } | null;
            verification: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                verifiedAt: Date | null;
                token: string;
                bookingId: string;
                expiresAt: Date;
                isVerified: boolean;
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
            car: {
                model: {
                    brand: {
                        id: string;
                        name: string;
                        logoUrl: string | null;
                    };
                } & {
                    id: string;
                    name: string;
                    brandId: string;
                };
                images: {
                    id: string;
                    carId: string;
                    isPrimary: boolean;
                    url: string;
                }[];
            } & {
                year: number;
                id: string;
                status: import(".prisma/client").$Enums.CarStatus;
                createdAt: Date;
                updatedAt: Date;
                depositAmount: number;
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
                status: import(".prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                updatedAt: Date;
                bookingId: string;
                amount: number;
                stripeId: string | null;
            } | null;
            verification: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                verifiedAt: Date | null;
                token: string;
                bookingId: string;
                expiresAt: Date;
                isVerified: boolean;
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
        }) | null>;
        bookingByToken: (_: any, { token }: {
            token: string;
        }) => Promise<({
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
            car: {
                model: {
                    brand: {
                        id: string;
                        name: string;
                        logoUrl: string | null;
                    };
                } & {
                    id: string;
                    name: string;
                    brandId: string;
                };
                images: {
                    id: string;
                    carId: string;
                    isPrimary: boolean;
                    url: string;
                }[];
            } & {
                year: number;
                id: string;
                status: import(".prisma/client").$Enums.CarStatus;
                createdAt: Date;
                updatedAt: Date;
                depositAmount: number;
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
                status: import(".prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                updatedAt: Date;
                bookingId: string;
                amount: number;
                stripeId: string | null;
            } | null;
            verification: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                verifiedAt: Date | null;
                token: string;
                bookingId: string;
                expiresAt: Date;
                isVerified: boolean;
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
        }) | null>;
        userBookings: (_: any, { userId }: {
            userId: string;
        }, context: any) => Promise<({
            car: {
                model: {
                    brand: {
                        id: string;
                        name: string;
                        logoUrl: string | null;
                    };
                } & {
                    id: string;
                    name: string;
                    brandId: string;
                };
            } & {
                year: number;
                id: string;
                status: import(".prisma/client").$Enums.CarStatus;
                createdAt: Date;
                updatedAt: Date;
                depositAmount: number;
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
                status: import(".prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                updatedAt: Date;
                bookingId: string;
                amount: number;
                stripeId: string | null;
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
        carBookings: (_: any, { carId }: {
            carId: string;
        }, context: any) => Promise<({
            car: {
                model: {
                    brand: {
                        id: string;
                        name: string;
                        logoUrl: string | null;
                    };
                } & {
                    id: string;
                    name: string;
                    brandId: string;
                };
            } & {
                year: number;
                id: string;
                status: import(".prisma/client").$Enums.CarStatus;
                createdAt: Date;
                updatedAt: Date;
                depositAmount: number;
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
                status: import(".prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                updatedAt: Date;
                bookingId: string;
                amount: number;
                stripeId: string | null;
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
    };
    Mutation: {
        createBooking: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<{
            car: {
                model: {
                    brand: {
                        id: string;
                        name: string;
                        logoUrl: string | null;
                    };
                } & {
                    id: string;
                    name: string;
                    brandId: string;
                };
            } & {
                year: number;
                id: string;
                status: import(".prisma/client").$Enums.CarStatus;
                createdAt: Date;
                updatedAt: Date;
                depositAmount: number;
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
        }>;
        confirmReservation: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<{
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
            car: {
                model: {
                    brand: {
                        id: string;
                        name: string;
                        logoUrl: string | null;
                    };
                } & {
                    id: string;
                    name: string;
                    brandId: string;
                };
                images: {
                    id: string;
                    carId: string;
                    isPrimary: boolean;
                    url: string;
                }[];
            } & {
                year: number;
                id: string;
                status: import(".prisma/client").$Enums.CarStatus;
                createdAt: Date;
                updatedAt: Date;
                depositAmount: number;
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
                status: import(".prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                updatedAt: Date;
                bookingId: string;
                amount: number;
                stripeId: string | null;
            } | null;
            verification: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                verifiedAt: Date | null;
                token: string;
                bookingId: string;
                expiresAt: Date;
                isVerified: boolean;
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
        startTrip: (_: any, { bookingId }: {
            bookingId: string;
        }, context: any) => Promise<{
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
        }>;
        completeTrip: (_: any, { bookingId }: {
            bookingId: string;
        }, context: any) => Promise<{
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
        }>;
        finishCarMaintenance: (_: any, { carId }: {
            carId: string;
        }, context: any) => Promise<{
            year: number;
            id: string;
            status: import(".prisma/client").$Enums.CarStatus;
            createdAt: Date;
            updatedAt: Date;
            depositAmount: number;
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
        cancelBooking: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<boolean>;
        deleteBooking: (_: any, { id }: {
            id: string;
        }, context: any) => Promise<boolean>;
        updateBooking: (_: any, { id, input }: {
            id: string;
            input: any;
        }, context: any) => Promise<{
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
            car: {
                model: {
                    brand: {
                        id: string;
                        name: string;
                        logoUrl: string | null;
                    };
                } & {
                    id: string;
                    name: string;
                    brandId: string;
                };
                images: {
                    id: string;
                    carId: string;
                    isPrimary: boolean;
                    url: string;
                }[];
            } & {
                year: number;
                id: string;
                status: import(".prisma/client").$Enums.CarStatus;
                createdAt: Date;
                updatedAt: Date;
                depositAmount: number;
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
                status: import(".prisma/client").$Enums.PaymentStatus;
                createdAt: Date;
                updatedAt: Date;
                bookingId: string;
                amount: number;
                stripeId: string | null;
            } | null;
            verification: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                verifiedAt: Date | null;
                token: string;
                bookingId: string;
                expiresAt: Date;
                isVerified: boolean;
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
    };
};
//# sourceMappingURL=bookingResolvers.d.ts.map