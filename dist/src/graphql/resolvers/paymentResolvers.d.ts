export declare const paymentResolvers: {
    Query: {
        payments: (_: any, __: any, context: any) => Promise<({
            booking: {
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
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            bookingId: string;
            amount: number;
            currency: string;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
            transactionId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        })[]>;
        bookingPayment: (_: any, { bookingId }: {
            bookingId: string;
        }, context: any) => Promise<({
            booking: {
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
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            bookingId: string;
            amount: number;
            currency: string;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
            transactionId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        }) | null>;
    };
    Mutation: {
        createPayment: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<{
            booking: {
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
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            bookingId: string;
            amount: number;
            currency: string;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
            transactionId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        }>;
        updatePaymentStatus: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<{
            booking: {
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
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            bookingId: string;
            amount: number;
            currency: string;
            paymentMethod: import(".prisma/client").$Enums.PaymentMethod | null;
            transactionId: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
        }>;
    };
};
//# sourceMappingURL=paymentResolvers.d.ts.map