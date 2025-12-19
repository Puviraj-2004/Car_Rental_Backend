export declare const carResolvers: {
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
                rentalType: string;
                rentalValue: number;
                status: string;
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
            model: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            brand: string;
            plateNumber: string;
            fuelType: string;
            transmission: string;
            seats: number;
            doors: number;
            pricePerHour: number;
            pricePerKm: number;
            pricePerDay: number;
            critAirRating: number;
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
                rentalType: string;
                rentalValue: number;
                status: string;
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
            model: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            brand: string;
            plateNumber: string;
            fuelType: string;
            transmission: string;
            seats: number;
            doors: number;
            pricePerHour: number;
            pricePerKm: number;
            pricePerDay: number;
            critAirRating: number;
            availability: boolean;
            descriptionEn: string | null;
            descriptionFr: string | null;
        }) | null>;
        availableCars: (_: any, { startDate, endDate }: {
            startDate: string;
            endDate: string;
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
                rentalType: string;
                rentalValue: number;
                status: string;
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
            model: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            brand: string;
            plateNumber: string;
            fuelType: string;
            transmission: string;
            seats: number;
            doors: number;
            pricePerHour: number;
            pricePerKm: number;
            pricePerDay: number;
            critAirRating: number;
            availability: boolean;
            descriptionEn: string | null;
            descriptionFr: string | null;
        })[]>;
    };
    Mutation: {
        createCar: (_: any, { input }: {
            input: any;
        }) => Promise<{
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
                rentalType: string;
                rentalValue: number;
                status: string;
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
            model: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            brand: string;
            plateNumber: string;
            fuelType: string;
            transmission: string;
            seats: number;
            doors: number;
            pricePerHour: number;
            pricePerKm: number;
            pricePerDay: number;
            critAirRating: number;
            availability: boolean;
            descriptionEn: string | null;
            descriptionFr: string | null;
        }>;
        updateCar: (_: any, { id, input }: {
            id: string;
            input: any;
        }) => Promise<{
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
                rentalType: string;
                rentalValue: number;
                status: string;
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
            model: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            brand: string;
            plateNumber: string;
            fuelType: string;
            transmission: string;
            seats: number;
            doors: number;
            pricePerHour: number;
            pricePerKm: number;
            pricePerDay: number;
            critAirRating: number;
            availability: boolean;
            descriptionEn: string | null;
            descriptionFr: string | null;
        }>;
        deleteCar: (_: any, { id }: {
            id: string;
        }) => Promise<boolean>;
        uploadCarImages: (_: any, { input }: {
            input: any;
        }) => Promise<any[]>;
        deleteCarImage: (_: any, { imageId }: {
            imageId: string;
        }) => Promise<boolean>;
        setPrimaryCarImage: (_: any, { carId, imageId }: {
            carId: string;
            imageId: string;
        }) => Promise<boolean>;
    };
    Car: {
        bookings: (parent: any) => Promise<{
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
            rentalType: string;
            rentalValue: number;
            status: string;
            pickupLocation: string | null;
            dropoffLocation: string | null;
        }[]>;
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
    CarImage: {
        car: (parent: any) => Promise<{
            year: number;
            model: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            brand: string;
            plateNumber: string;
            fuelType: string;
            transmission: string;
            seats: number;
            doors: number;
            pricePerHour: number;
            pricePerKm: number;
            pricePerDay: number;
            critAirRating: number;
            availability: boolean;
            descriptionEn: string | null;
            descriptionFr: string | null;
        } | null>;
    };
};
//# sourceMappingURL=carResolvers.d.ts.map