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
                extraKmCharge: number;
                depositAmount: number;
                pickupLocation: string | null;
                dropoffLocation: string | null;
                startMeter: number | null;
                endMeter: number | null;
                allowedKm: number | null;
                extraKmUsed: number;
                totalPrice: number;
                totalFinalPrice: number | null;
                basePrice: number;
                taxAmount: number;
                rentalType: import(".prisma/client").$Enums.RentalType;
                bookingType: import(".prisma/client").$Enums.BookingType;
                surchargeAmount: number;
                repairOrderId: string | null;
                expiresAt: Date | null;
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
                extraKmCharge: number;
                depositAmount: number;
                pickupLocation: string | null;
                dropoffLocation: string | null;
                startMeter: number | null;
                endMeter: number | null;
                allowedKm: number | null;
                extraKmUsed: number;
                totalPrice: number;
                totalFinalPrice: number | null;
                basePrice: number;
                taxAmount: number;
                rentalType: import(".prisma/client").$Enums.RentalType;
                bookingType: import(".prisma/client").$Enums.BookingType;
                surchargeAmount: number;
                repairOrderId: string | null;
                expiresAt: Date | null;
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
                extraKmCharge: number;
                depositAmount: number;
                pickupLocation: string | null;
                dropoffLocation: string | null;
                startMeter: number | null;
                endMeter: number | null;
                allowedKm: number | null;
                extraKmUsed: number;
                totalPrice: number;
                totalFinalPrice: number | null;
                basePrice: number;
                taxAmount: number;
                rentalType: import(".prisma/client").$Enums.RentalType;
                bookingType: import(".prisma/client").$Enums.BookingType;
                surchargeAmount: number;
                repairOrderId: string | null;
                expiresAt: Date | null;
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
                extraKmCharge: number;
                depositAmount: number;
                pickupLocation: string | null;
                dropoffLocation: string | null;
                startMeter: number | null;
                endMeter: number | null;
                allowedKm: number | null;
                extraKmUsed: number;
                totalPrice: number;
                totalFinalPrice: number | null;
                basePrice: number;
                taxAmount: number;
                rentalType: import(".prisma/client").$Enums.RentalType;
                bookingType: import(".prisma/client").$Enums.BookingType;
                surchargeAmount: number;
                repairOrderId: string | null;
                expiresAt: Date | null;
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