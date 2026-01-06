import { Prisma } from '@prisma/client';
export declare const CAR_INCLUDES: {
    model: {
        include: {
            brand: boolean;
        };
    };
    images: boolean;
    bookings: boolean;
};
export declare class CarRepository {
    findMany(where: Prisma.CarWhereInput): Promise<({
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
    findUnique(id: string): Promise<({
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
        }[];
        images: {
            id: string;
            carId: string;
            isPrimary: boolean;
            url: string;
        }[];
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
    }) | null>;
    findBrands(): Promise<{
        id: string;
        name: string;
        logoUrl: string | null;
    }[]>;
    findModelsByBrand(brandId: string): Promise<{
        id: string;
        brandId: string;
        name: string;
    }[]>;
    createBrand(data: {
        name: string;
        logoUrl?: string;
    }): Promise<{
        id: string;
        name: string;
        logoUrl: string | null;
    }>;
    updateBrand(id: string, data: {
        name?: string;
        logoUrl?: string;
    }): Promise<{
        id: string;
        name: string;
        logoUrl: string | null;
    }>;
    deleteBrand(id: string): Promise<{
        id: string;
        name: string;
        logoUrl: string | null;
    }>;
    createModel(data: {
        name: string;
        brandId: string;
    }): Promise<{
        id: string;
        brandId: string;
        name: string;
    }>;
    updateModel(id: string, data: {
        name?: string;
    }): Promise<{
        id: string;
        brandId: string;
        name: string;
    }>;
    deleteModel(id: string): Promise<{
        id: string;
        brandId: string;
        name: string;
    }>;
    createCar(data: Prisma.CarCreateInput): Promise<{
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
    }>;
    updateCar(id: string, data: Prisma.CarUpdateInput): Promise<{
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
    }>;
    deleteCar(id: string): Promise<{
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
    }>;
    findImageById(id: string): Promise<{
        id: string;
        carId: string;
        isPrimary: boolean;
        url: string;
    } | null>;
    createImage(data: Prisma.CarImageCreateInput): Promise<{
        id: string;
        carId: string;
        isPrimary: boolean;
        url: string;
    }>;
    deleteImage(id: string): Promise<{
        id: string;
        carId: string;
        isPrimary: boolean;
        url: string;
    }>;
    updateManyImages(where: Prisma.CarImageWhereInput, data: Prisma.CarImageUpdateManyMutationInput): Promise<Prisma.BatchPayload>;
    updateImage(id: string, data: Prisma.CarImageUpdateInput): Promise<{
        id: string;
        carId: string;
        isPrimary: boolean;
        url: string;
    }>;
    countModelsByBrand(brandId: string): Promise<number>;
    countCarsByModel(modelId: string): Promise<number>;
    countActiveBookings(carId: string): Promise<number>;
}
export declare const carRepository: CarRepository;
//# sourceMappingURL=carRepository.d.ts.map