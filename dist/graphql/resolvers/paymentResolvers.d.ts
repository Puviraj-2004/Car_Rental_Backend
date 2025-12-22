export declare const paymentResolvers: {
    Query: {
        payments: () => Promise<({
            booking: {
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
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            taxAmount: number;
            status: import(".prisma/client").$Enums.PaymentStatus;
            bookingId: string;
            transactionId: string | null;
            amount: number;
            baseAmount: number;
            currency: string;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        })[]>;
        payment: (_: any, { id }: {
            id: string;
        }) => Promise<({
            booking: {
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
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            taxAmount: number;
            status: import(".prisma/client").$Enums.PaymentStatus;
            bookingId: string;
            transactionId: string | null;
            amount: number;
            baseAmount: number;
            currency: string;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        }) | null>;
        bookingPayment: (_: any, { bookingId }: {
            bookingId: string;
        }) => Promise<({
            booking: {
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
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            taxAmount: number;
            status: import(".prisma/client").$Enums.PaymentStatus;
            bookingId: string;
            transactionId: string | null;
            amount: number;
            baseAmount: number;
            currency: string;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        }) | null>;
    };
    Mutation: {
        createPayment: (_: any, { input }: {
            input: any;
        }) => Promise<{
            booking: {
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
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            taxAmount: number;
            status: import(".prisma/client").$Enums.PaymentStatus;
            bookingId: string;
            transactionId: string | null;
            amount: number;
            baseAmount: number;
            currency: string;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        }>;
        updatePaymentStatus: (_: any, { input }: {
            input: any;
        }) => Promise<{
            booking: {
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
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            taxAmount: number;
            status: import(".prisma/client").$Enums.PaymentStatus;
            bookingId: string;
            transactionId: string | null;
            amount: number;
            baseAmount: number;
            currency: string;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
        }>;
    };
    Payment: {
        booking: (parent: any) => Promise<{
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
        } | null>;
    };
};
//# sourceMappingURL=paymentResolvers.d.ts.map