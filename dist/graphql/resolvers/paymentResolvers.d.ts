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
                rentalType: string;
                rentalValue: number;
                status: string;
                pickupLocation: string | null;
                dropoffLocation: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            taxAmount: number;
            status: string;
            bookingId: string;
            amount: number;
            baseAmount: number;
            currency: string;
            paymentMethod: string | null;
            transactionId: string | null;
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
                rentalType: string;
                rentalValue: number;
                status: string;
                pickupLocation: string | null;
                dropoffLocation: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            taxAmount: number;
            status: string;
            bookingId: string;
            amount: number;
            baseAmount: number;
            currency: string;
            paymentMethod: string | null;
            transactionId: string | null;
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
                rentalType: string;
                rentalValue: number;
                status: string;
                pickupLocation: string | null;
                dropoffLocation: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            taxAmount: number;
            status: string;
            bookingId: string;
            amount: number;
            baseAmount: number;
            currency: string;
            paymentMethod: string | null;
            transactionId: string | null;
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
                rentalType: string;
                rentalValue: number;
                status: string;
                pickupLocation: string | null;
                dropoffLocation: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            taxAmount: number;
            status: string;
            bookingId: string;
            amount: number;
            baseAmount: number;
            currency: string;
            paymentMethod: string | null;
            transactionId: string | null;
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
                rentalType: string;
                rentalValue: number;
                status: string;
                pickupLocation: string | null;
                dropoffLocation: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            taxAmount: number;
            status: string;
            bookingId: string;
            amount: number;
            baseAmount: number;
            currency: string;
            paymentMethod: string | null;
            transactionId: string | null;
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
            rentalType: string;
            rentalValue: number;
            status: string;
            pickupLocation: string | null;
            dropoffLocation: string | null;
        } | null>;
    };
};
//# sourceMappingURL=paymentResolvers.d.ts.map