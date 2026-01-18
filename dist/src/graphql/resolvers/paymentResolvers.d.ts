export declare const paymentResolvers: {
    Query: {
        payments: (_: any, __: any, context: any) => Promise<({
            booking: {
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
            };
        } & {
            id: string;
            bookingId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            amount: number;
            stripeId: string | null;
        })[]>;
        bookingPayment: (_: any, { bookingId }: {
            bookingId: string;
        }, context: any) => Promise<({
            booking: {
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
            };
        } & {
            id: string;
            bookingId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            amount: number;
            stripeId: string | null;
        }) | null>;
    };
    Mutation: {
        createStripeCheckoutSession: (_: any, { bookingId }: {
            bookingId: string;
        }, context: any) => Promise<{
            url: any;
            sessionId: any;
        }>;
        mockFinalizePayment: (_: any, { bookingId, success }: {
            bookingId: string;
            success: boolean;
        }, context: any) => Promise<{
            booking: {
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
            };
        } & {
            id: string;
            bookingId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            amount: number;
            stripeId: string | null;
        }>;
        createPayment: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<{
            booking: {
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
            };
        } & {
            id: string;
            bookingId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            amount: number;
            stripeId: string | null;
        }>;
        updatePaymentStatus: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<{
            booking: {
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
            };
        } & {
            id: string;
            bookingId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            amount: number;
            stripeId: string | null;
        }>;
        refundPayment: (_: any, { paymentId }: {
            paymentId: string;
        }, context: any) => Promise<({
            booking: {
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
            };
        } & {
            id: string;
            bookingId: string;
            createdAt: Date;
            updatedAt: Date;
            status: import(".prisma/client").$Enums.PaymentStatus;
            amount: number;
            stripeId: string | null;
        }) | null>;
    };
};
//# sourceMappingURL=paymentResolvers.d.ts.map