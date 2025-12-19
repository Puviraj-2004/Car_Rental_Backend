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
                startDate: Date;
                endDate: Date;
                totalPrice: number;
                basePrice: number;
                taxAmount: number;
                status: string;
                pickupLocation: string | null;
                dropoffLocation: string | null;
            }[];
        } & {
            year: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            brand: string;
            model: string;
            plateNumber: string;
            fuelType: string;
            transmission: string;
            seats: number;
            doors: number;
            pricePerDay: number;
            critAirRating: number;
            availability: boolean;
            imageUrl: string | null;
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
                startDate: Date;
                endDate: Date;
                totalPrice: number;
                basePrice: number;
                taxAmount: number;
                status: string;
                pickupLocation: string | null;
                dropoffLocation: string | null;
            }[];
        } & {
            year: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            brand: string;
            model: string;
            plateNumber: string;
            fuelType: string;
            transmission: string;
            seats: number;
            doors: number;
            pricePerDay: number;
            critAirRating: number;
            availability: boolean;
            imageUrl: string | null;
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
                startDate: Date;
                endDate: Date;
                totalPrice: number;
                basePrice: number;
                taxAmount: number;
                status: string;
                pickupLocation: string | null;
                dropoffLocation: string | null;
            }[];
        } & {
            year: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            brand: string;
            model: string;
            plateNumber: string;
            fuelType: string;
            transmission: string;
            seats: number;
            doors: number;
            pricePerDay: number;
            critAirRating: number;
            availability: boolean;
            imageUrl: string | null;
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
                startDate: Date;
                endDate: Date;
                totalPrice: number;
                basePrice: number;
                taxAmount: number;
                status: string;
                pickupLocation: string | null;
                dropoffLocation: string | null;
            }[];
        } & {
            year: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            brand: string;
            model: string;
            plateNumber: string;
            fuelType: string;
            transmission: string;
            seats: number;
            doors: number;
            pricePerDay: number;
            critAirRating: number;
            availability: boolean;
            imageUrl: string | null;
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
                startDate: Date;
                endDate: Date;
                totalPrice: number;
                basePrice: number;
                taxAmount: number;
                status: string;
                pickupLocation: string | null;
                dropoffLocation: string | null;
            }[];
        } & {
            year: number;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            brand: string;
            model: string;
            plateNumber: string;
            fuelType: string;
            transmission: string;
            seats: number;
            doors: number;
            pricePerDay: number;
            critAirRating: number;
            availability: boolean;
            imageUrl: string | null;
            descriptionEn: string | null;
            descriptionFr: string | null;
        }>;
        deleteCar: (_: any, { id }: {
            id: string;
        }) => Promise<boolean>;
    };
    Car: {
        bookings: (parent: any) => Promise<{
            userId: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            carId: string;
            startDate: Date;
            endDate: Date;
            totalPrice: number;
            basePrice: number;
            taxAmount: number;
            status: string;
            pickupLocation: string | null;
            dropoffLocation: string | null;
        }[]>;
    };
};
//# sourceMappingURL=carResolvers.d.ts.map