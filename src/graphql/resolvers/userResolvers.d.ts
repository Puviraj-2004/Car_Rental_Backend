export declare const userResolvers: {
    Query: {
        me: (_: any, __: any, context: any) => Promise<({
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
            id: string;
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            phoneNumber: string | null;
            dateOfBirth: Date | null;
            address: string | null;
            city: string | null;
            country: string | null;
            postalCode: string | null;
            language: string;
            gdprConsent: boolean;
            consentDate: Date | null;
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
            id: string;
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            phoneNumber: string | null;
            dateOfBirth: Date | null;
            address: string | null;
            city: string | null;
            country: string | null;
            postalCode: string | null;
            language: string;
            gdprConsent: boolean;
            consentDate: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }) | null>;
        users: () => Promise<({
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
            id: string;
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            phoneNumber: string | null;
            dateOfBirth: Date | null;
            address: string | null;
            city: string | null;
            country: string | null;
            postalCode: string | null;
            language: string;
            gdprConsent: boolean;
            consentDate: Date | null;
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
                id: string;
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                phoneNumber: string | null;
                dateOfBirth: Date | null;
                address: string | null;
                city: string | null;
                country: string | null;
                postalCode: string | null;
                language: string;
                gdprConsent: boolean;
                consentDate: Date | null;
                createdAt: Date;
                updatedAt: Date;
            };
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
                id: string;
                email: string;
                password: string;
                firstName: string;
                lastName: string;
                phoneNumber: string | null;
                dateOfBirth: Date | null;
                address: string | null;
                city: string | null;
                country: string | null;
                postalCode: string | null;
                language: string;
                gdprConsent: boolean;
                consentDate: Date | null;
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
            id: string;
            email: string;
            password: string;
            firstName: string;
            lastName: string;
            phoneNumber: string | null;
            dateOfBirth: Date | null;
            address: string | null;
            city: string | null;
            country: string | null;
            postalCode: string | null;
            language: string;
            gdprConsent: boolean;
            consentDate: Date | null;
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
//# sourceMappingURL=userResolvers.d.ts.map