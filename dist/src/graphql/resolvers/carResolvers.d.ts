export declare const carResolvers: {
    Query: {
        cars: (_: any, { filter }: any) => Promise<({
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
        })[]>;
        car: (_: any, { id }: any) => Promise<({
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
            bookings: {
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
                surchargeAmount: number;
            }[];
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
        }) | null>;
        brands: () => Promise<{
            name: string;
            id: string;
            createdAt: Date;
            logoUrl: string | null;
            logoPublicId: string | null;
        }[]>;
        models: (_: any, { brandId }: any) => Promise<{
            name: string;
            id: string;
            createdAt: Date;
            brandId: string;
        }[]>;
        availableCars: (_: any, { startDate, endDate }: any) => Promise<({
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
        })[]>;
    };
    Mutation: {
        createBrand: (_: any, args: any, context: any) => Promise<{
            name: string;
            id: string;
            createdAt: Date;
            logoUrl: string | null;
            logoPublicId: string | null;
        }>;
        updateBrand: (_: any, { id, ...args }: any, context: any) => Promise<{
            name: string;
            id: string;
            createdAt: Date;
            logoUrl: string | null;
            logoPublicId: string | null;
        }>;
        deleteBrand: (_: any, { id }: any, context: any) => Promise<boolean>;
        createModel: (_: any, args: any, context: any) => Promise<{
            name: string;
            id: string;
            createdAt: Date;
            brandId: string;
        }>;
        createCar: (_: any, { input }: any, context: any) => Promise<{
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
        }>;
        updateCar: (_: any, { id, input }: any, context: any) => Promise<{
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
        }>;
        deleteCar: (_: any, { id }: any, context: any) => Promise<boolean>;
        addCarImage: (_: any, { carId, file, isPrimary }: any, context: any) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            carId: string;
            isPrimary: boolean;
            imagePath: string;
            publicId: string | null;
            altText: string | null;
        }>;
        deleteCarImage: (_: any, { imageId }: any, context: any) => Promise<boolean>;
        setPrimaryCarImage: (_: any, { carId, imageId }: any, context: any) => Promise<boolean>;
    };
};
//# sourceMappingURL=carResolvers.d.ts.map