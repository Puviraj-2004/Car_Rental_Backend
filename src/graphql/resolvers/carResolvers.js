"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.carResolvers = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.carResolvers = {
    Query: {
        cars: async (_, { filter }) => {
            const where = {};
            if (filter) {
                if (filter.brand)
                    where.brand = { contains: filter.brand, mode: 'insensitive' };
                if (filter.model)
                    where.model = { contains: filter.model, mode: 'insensitive' };
                if (filter.fuelType)
                    where.fuelType = filter.fuelType;
                if (filter.transmission)
                    where.transmission = filter.transmission;
                if (filter.minPrice !== undefined)
                    where.pricePerDay = { gte: filter.minPrice };
                if (filter.maxPrice !== undefined)
                    where.pricePerDay = { ...where.pricePerDay, lte: filter.maxPrice };
                if (filter.critAirRating !== undefined)
                    where.critAirRating = filter.critAirRating;
                if (filter.availability !== undefined)
                    where.availability = filter.availability;
            }
            return await prisma.car.findMany({
                where,
                include: { bookings: true }
            });
        },
        car: async (_, { id }) => {
            return await prisma.car.findUnique({
                where: { id },
                include: { bookings: true }
            });
        },
        availableCars: async (_, { startDate, endDate }) => {
            // Convert string dates to Date objects
            const start = new Date(startDate);
            const end = new Date(endDate);
            // Find cars that don't have overlapping bookings
            const bookedCarIds = await prisma.booking.findMany({
                where: {
                    AND: [
                        { status: { not: 'cancelled' } },
                        {
                            OR: [
                                {
                                    AND: [
                                        { startDate: { lte: end } },
                                        { endDate: { gte: start } }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                select: {
                    carId: true
                }
            });
            const bookedIds = bookedCarIds.map((booking) => booking.carId);
            return await prisma.car.findMany({
                where: {
                    AND: [
                        { availability: true },
                        { id: { notIn: bookedIds } }
                    ]
                },
                include: { bookings: true }
            });
        }
    },
    Mutation: {
        createCar: async (_, { input }) => {
            return await prisma.car.create({
                data: {
                    ...input,
                    availability: input.availability !== undefined ? input.availability : true
                },
                include: { bookings: true }
            });
        },
        updateCar: async (_, { id, input }) => {
            return await prisma.car.update({
                where: { id },
                data: input,
                include: { bookings: true }
            });
        },
        deleteCar: async (_, { id }) => {
            await prisma.car.delete({
                where: { id }
            });
            return true;
        }
    },
    Car: {
        bookings: async (parent) => {
            return await prisma.booking.findMany({
                where: { carId: parent.id }
            });
        }
    }
};
//# sourceMappingURL=carResolvers.js.map