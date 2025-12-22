export declare const carResolvers: {
    Upload: import("graphql").GraphQLScalarType<Promise<import("graphql-upload-ts").FileUpload>, never>;
    Query: {
        cars: (_: any, { filter }: {
            filter: any;
        }) => Promise<({
            bookings: {
                userId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                carId: string;
                startDate: Date | null;
                endDate: Date | null;
                totalPrice: number;
                basePrice: number;
                taxAmount: number;
                rentalType: import(".prisma/client").$Enums.RentalType;
                rentalValue: number;
                status: import(".prisma/client").$Enums.BookingStatus;
                pickupLocation: string | null;
                dropoffLocation: string | null;
            }[];
            images: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                carId: string;
                imagePath: string;
                altText: string | null;
                isPrimary: boolean;
            }[];
        } & {
            year: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            brand: string;
            model: string;
            plateNumber: string;
            fuelType: import(".prisma/client").$Enums.FuelType;
            transmission: import(".prisma/client").$Enums.TransmissionType;
            seats: number;
            doors: number;
            pricePerHour: number;
            pricePerKm: number;
            pricePerDay: number;
            critAirRating: import(".prisma/client").$Enums.CritAirCategory;
            availability: boolean;
            descriptionEn: string | null;
            descriptionFr: string | null;
        })[]>;
        car: (_: any, { id }: {
            id: string;
        }) => Promise<({
            bookings: {
                userId: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                carId: string;
                startDate: Date | null;
                endDate: Date | null;
                totalPrice: number;
                basePrice: number;
                taxAmount: number;
                rentalType: import(".prisma/client").$Enums.RentalType;
                rentalValue: number;
                status: import(".prisma/client").$Enums.BookingStatus;
                pickupLocation: string | null;
                dropoffLocation: string | null;
            }[];
            images: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                carId: string;
                imagePath: string;
                altText: string | null;
                isPrimary: boolean;
            }[];
        } & {
            year: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            brand: string;
            model: string;
            plateNumber: string;
            fuelType: import(".prisma/client").$Enums.FuelType;
            transmission: import(".prisma/client").$Enums.TransmissionType;
            seats: number;
            doors: number;
            pricePerHour: number;
            pricePerKm: number;
            pricePerDay: number;
            critAirRating: import(".prisma/client").$Enums.CritAirCategory;
            availability: boolean;
            descriptionEn: string | null;
            descriptionFr: string | null;
        }) | null>;
    };
    Mutation: {
        createCar: (_: any, { input }: {
            input: any;
        }) => Promise<{
            images: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                carId: string;
                imagePath: string;
                altText: string | null;
                isPrimary: boolean;
            }[];
        } & {
            year: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            brand: string;
            model: string;
            plateNumber: string;
            fuelType: import(".prisma/client").$Enums.FuelType;
            transmission: import(".prisma/client").$Enums.TransmissionType;
            seats: number;
            doors: number;
            pricePerHour: number;
            pricePerKm: number;
            pricePerDay: number;
            critAirRating: import(".prisma/client").$Enums.CritAirCategory;
            availability: boolean;
            descriptionEn: string | null;
            descriptionFr: string | null;
        }>;
        uploadCarImages: (_: any, { input }: {
            input: any;
        }) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            carId: string;
            imagePath: string;
            altText: string | null;
            isPrimary: boolean;
        }[]>;
        deleteCar: (_: any, { id }: {
            id: string;
        }) => Promise<boolean>;
        deleteCarImage: (_: any, { imageId }: {
            imageId: string;
        }) => Promise<boolean>;
    };
    Car: {
        images: (parent: any) => Promise<{
            id: string;
            createdAt: Date;
            updatedAt: Date;
            carId: string;
            imagePath: string;
            altText: string | null;
            isPrimary: boolean;
        }[]>;
    };
};
//# sourceMappingURL=carResolvers.d.ts.map