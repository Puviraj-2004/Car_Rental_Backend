import { GraphQLContext, CarQueryArgs, CarByIdArgs, ModelsByBrandArgs, AvailableCarsArgs, CreateCarArgs, UpdateCarArgs, DeleteCarArgs, CreateBrandArgs, UpdateBrandArgs, DeleteBrandArgs, CreateModelArgs, UpdateModelArgs, DeleteModelArgs, AddCarImageArgs, DeleteCarImageArgs, SetPrimaryCarImageArgs } from '../../types/graphql';
export declare const carResolvers: {
    Query: {
        cars: (_: unknown, args: CarQueryArgs) => Promise<({
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
        })[]>;
        car: (_: unknown, args: CarByIdArgs) => Promise<({
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
        }) | null>;
        brands: () => Promise<{
            id: string;
            name: string;
            logoUrl: string | null;
        }[]>;
        models: (_: unknown, args: ModelsByBrandArgs) => Promise<{
            id: string;
            brandId: string;
            name: string;
        }[]>;
        availableCars: (_: unknown, args: AvailableCarsArgs) => Promise<({
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
        })[]>;
    };
    Mutation: {
        createBrand: (_: unknown, args: CreateBrandArgs, context: GraphQLContext) => Promise<{
            id: string;
            name: string;
            logoUrl: string | null;
        }>;
        updateBrand: (_: unknown, args: UpdateBrandArgs, context: GraphQLContext) => Promise<{
            id: string;
            name: string;
            logoUrl: string | null;
        }>;
        deleteBrand: (_: unknown, args: DeleteBrandArgs, context: GraphQLContext) => Promise<{
            id: string;
            name: string;
            logoUrl: string | null;
        }>;
        createModel: (_: unknown, args: CreateModelArgs, context: GraphQLContext) => Promise<{
            id: string;
            brandId: string;
            name: string;
        }>;
        updateModel: (_: unknown, args: UpdateModelArgs, context: GraphQLContext) => Promise<{
            id: string;
            brandId: string;
            name: string;
        }>;
        deleteModel: (_: unknown, args: DeleteModelArgs, context: GraphQLContext) => Promise<boolean>;
        createCar: (_: unknown, args: CreateCarArgs, context: GraphQLContext) => Promise<{
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
        }>;
        updateCar: (_: unknown, args: UpdateCarArgs, context: GraphQLContext) => Promise<{
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
        }>;
        deleteCar: (_: unknown, args: DeleteCarArgs, context: GraphQLContext) => Promise<{
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
        }>;
        addCarImage: (_: unknown, args: AddCarImageArgs, context: GraphQLContext) => Promise<{
            id: string;
            carId: string;
            isPrimary: boolean;
            url: string;
        }>;
        deleteCarImage: (_: unknown, args: DeleteCarImageArgs, context: GraphQLContext) => Promise<boolean>;
        setPrimaryCarImage: (_: unknown, args: SetPrimaryCarImageArgs, context: GraphQLContext) => Promise<boolean>;
    };
    Car: {
        brand: (parent: {
            id: string;
        }) => Promise<{
            id: string;
            name: string;
            logoUrl: string | null;
        } | undefined>;
    };
};
//# sourceMappingURL=carResolvers.d.ts.map