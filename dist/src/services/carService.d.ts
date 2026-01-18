import { FileUpload, CarFilterInput, CreateCarInput, UpdateCarInput, CreateBrandInput, UpdateBrandInput, CreateModelInput, UpdateModelInput } from '../types/graphql';
export declare class CarService {
    private buildBookingAvailabilityFilter;
    private buildStatusFilter;
    getCars(filter?: CarFilterInput): Promise<({
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
    getAvailableCars(startDate: string, endDate: string): Promise<({
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
    addCarImage(carId: string, file: FileUpload, isPrimary: boolean): Promise<{
        id: string;
        carId: string;
        isPrimary: boolean;
        url: string;
    }>;
    setPrimaryImage(carId: string, imageId: string): Promise<boolean>;
    getCarById(id: string): Promise<({
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
    getBrands(): Promise<{
        id: string;
        name: string;
        logoUrl: string | null;
    }[]>;
    getModelsByBrand(brandId: string): Promise<{
        id: string;
        brandId: string;
        name: string;
    }[]>;
    createBrand(data: CreateBrandInput): Promise<{
        id: string;
        name: string;
        logoUrl: string | null;
    }>;
    updateBrand(id: string, data: UpdateBrandInput): Promise<{
        id: string;
        name: string;
        logoUrl: string | null;
    }>;
    deleteBrand(id: string): Promise<{
        id: string;
        name: string;
        logoUrl: string | null;
    }>;
    createModel(data: CreateModelInput): Promise<{
        id: string;
        brandId: string;
        name: string;
    }>;
    updateModel(id: string, data: UpdateModelInput): Promise<{
        id: string;
        brandId: string;
        name: string;
    }>;
    deleteModel(id: string): Promise<boolean>;
    createCar(data: CreateCarInput): Promise<{
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
    getModels(brandId?: string): Promise<{
        id: string;
        brandId: string;
        name: string;
    }[]>;
    updateCar(id: string, data: UpdateCarInput): Promise<{
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
    deleteCar(id: string): Promise<{
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
    deleteCarImage(imageId: string): Promise<{
        id: string;
        carId: string;
        isPrimary: boolean;
        url: string;
    }>;
    getCarBrand(carId: string): Promise<{
        id: string;
        name: string;
        logoUrl: string | null;
    } | undefined>;
    finishMaintenance(carId: string): Promise<{
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
}
export declare const carService: CarService;
//# sourceMappingURL=carService.d.ts.map