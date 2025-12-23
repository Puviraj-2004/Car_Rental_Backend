export declare const userResolvers: {
    Query: {
        me: (_: any, __: any, context: any) => Promise<({
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
        } & {
            role: import(".prisma/client").$Enums.Role;
            password: string | null;
            id: string;
            email: string;
            otp: string | null;
            googleId: string | null;
            firstName: string;
            lastName: string;
            phoneNumber: string | null;
            isVerified: boolean;
            otpExpires: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }) | null>;
        user: (_: any, { id }: {
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
        } & {
            role: import(".prisma/client").$Enums.Role;
            password: string | null;
            id: string;
            email: string;
            otp: string | null;
            googleId: string | null;
            firstName: string;
            lastName: string;
            phoneNumber: string | null;
            isVerified: boolean;
            otpExpires: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }) | null>;
        users: (_: any, __: any, context: any) => Promise<({
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
        } & {
            role: import(".prisma/client").$Enums.Role;
            password: string | null;
            id: string;
            email: string;
            otp: string | null;
            googleId: string | null;
            firstName: string;
            lastName: string;
            phoneNumber: string | null;
            isVerified: boolean;
            otpExpires: Date | null;
            createdAt: Date;
            updatedAt: Date;
        })[]>;
    };
    Mutation: {
        register: (_: any, { input }: {
            input: any;
        }) => Promise<{
            token: string;
            user: {
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
            } & {
                role: import(".prisma/client").$Enums.Role;
                password: string | null;
                id: string;
                email: string;
                otp: string | null;
                googleId: string | null;
                firstName: string;
                lastName: string;
                phoneNumber: string | null;
                isVerified: boolean;
                otpExpires: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
            message: string;
        }>;
        verifyOTP: (_: any, { email, otp }: {
            email: string;
            otp: string;
        }) => Promise<{
            success: boolean;
            message: string;
        }>;
        login: (_: any, { input }: {
            input: any;
        }) => Promise<{
            token: string;
            user: {
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
            } & {
                role: import(".prisma/client").$Enums.Role;
                password: string | null;
                id: string;
                email: string;
                otp: string | null;
                googleId: string | null;
                firstName: string;
                lastName: string;
                phoneNumber: string | null;
                isVerified: boolean;
                otpExpires: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
        }>;
        updateUser: (_: any, { input }: {
            input: any;
        }, context: any) => Promise<{
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
        } & {
            role: import(".prisma/client").$Enums.Role;
            password: string | null;
            id: string;
            email: string;
            otp: string | null;
            googleId: string | null;
            firstName: string;
            lastName: string;
            phoneNumber: string | null;
            isVerified: boolean;
            otpExpires: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }>;
        deleteUser: (_: any, { id }: {
            id: string;
        }) => Promise<boolean>;
    };
    User: {
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
            rentalType: import(".prisma/client").$Enums.RentalType;
            rentalValue: number;
            status: import(".prisma/client").$Enums.BookingStatus;
            pickupLocation: string | null;
            dropoffLocation: string | null;
        }[]>;
    };
};
//# sourceMappingURL=userResolvers.d.ts.map