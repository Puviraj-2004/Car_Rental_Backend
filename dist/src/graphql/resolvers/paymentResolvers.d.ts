export declare const paymentResolvers: {
    Query: {
        payments: (_: any, __: any, context: any) => Promise<({
            booking: {
                userId: string;
                id: string;
                status: import(".prisma/client").$Enums.BookingStatus;
                createdAt: Date;
                updatedAt: Date;
                carId: string;
                startDate: Date;
                endDate: Date;
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
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            bookingId: string;
            amount: number;
            stripeId: string | null;
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
                carId: string;
                startDate: Date;
                endDate: Date;
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
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            bookingId: string;
            amount: number;
            stripeId: string | null;
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
                carId: string;
                startDate: Date;
                endDate: Date;
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
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            bookingId: string;
            amount: number;
            stripeId: string | null;
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
                carId: string;
                startDate: Date;
                endDate: Date;
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
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            createdAt: Date;
            updatedAt: Date;
            bookingId: string;
            amount: number;
            stripeId: string | null;
        }>;
    };
};
//# sourceMappingURL=paymentResolvers.d.ts.map