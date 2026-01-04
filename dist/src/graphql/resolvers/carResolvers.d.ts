export declare const carResolvers: {
    Query: {
        cars: (_: any, { filter }: any) => Promise<({
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
        })[]>;
        car: (_: any, { id }: any) => Promise<({
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
        }) | null>;
        brands: () => Promise<{
            id: string;
            name: string;
            logoUrl: string | null;
        }[]>;
        models: (_: any, { brandId }: any) => Promise<{
            id: string;
            name: string;
            brandId: string;
        }[]>;
        availableCars: (_: any, { startDate, endDate }: any) => Promise<({
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
        })[]>;
    };
    Mutation: {
        createBrand: (_: any, args: any, context: any) => Promise<any>;
        updateBrand: (_: any, { id, ...args }: any, context: any) => Promise<any>;
        deleteBrand: (_: any, { id }: any, context: any) => Promise<boolean>;
        createModel: (_: any, args: any, context: any) => Promise<any>;
        updateModel: (_: any, { id, ...args }: any, context: any) => Promise<any>;
        deleteModel: (_: any, { id }: any, context: any) => Promise<boolean>;
        createCar: (_: any, { input }: any, context: any) => Promise<{
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
        }>;
        updateCar: (_: any, { id, input }: any, context: any) => Promise<{
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
        }>;
        deleteCar: (_: any, { id }: any, context: any) => Promise<boolean>;
        addCarImage: (_: any, { carId, file, isPrimary }: any, context: any) => Promise<{
            id: string;
            carId: string;
            isPrimary: boolean;
            url: string;
        }>;
        deleteCarImage: (_: any, { imageId }: any, context: any) => Promise<boolean>;
        setPrimaryCarImage: (_: any, { carId, imageId }: any, context: any) => Promise<boolean>;
    };
    Car: {
        brand: (parent: any) => Promise<{
            id: string;
            name: string;
            logoUrl: string | null;
        } | undefined>;
    };
};
//# sourceMappingURL=carResolvers.d.ts.map