"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRepository = exports.BookingRepository = exports.BOOKING_INCLUDES = void 0;
const database_1 = __importDefault(require("../utils/database"));
const graphql_1 = require("../types/graphql");
exports.BOOKING_INCLUDES = {
    basic: {
        car: { include: { model: { include: { brand: true } } } },
        payment: true
    },
    detailed: {
        user: true,
        car: { include: { model: { include: { brand: true } }, images: true } },
        payment: true,
        verification: true,
    },
    admin: {
        user: true,
        car: { include: { model: { include: { brand: true } } } },
        payment: true,
        verification: true
    }
};
class BookingRepository {
    async findMany(where, include, orderBy = { createdAt: 'desc' }) {
        return await database_1.default.booking.findMany({ where, include, orderBy });
    }
    async findUnique(id, include) {
        return await database_1.default.booking.findUnique({ where: { id }, include });
    }
    async findFirst(where, include) {
        return await database_1.default.booking.findFirst({ where, include });
    }
    async findVerificationToken(token) {
        return await database_1.default.bookingVerification.findUnique({ where: { token } });
    }
    async findConflicts(carId, startDate, endDate) {
        const conflictStatuses = [graphql_1.BookingStatus.PENDING, graphql_1.BookingStatus.VERIFIED, graphql_1.BookingStatus.CONFIRMED, graphql_1.BookingStatus.ONGOING];
        return await database_1.default.booking.findMany({
            where: {
                AND: [
                    { carId },
                    { status: { in: conflictStatuses } },
                    {
                        OR: [
                            { AND: [{ startDate: { lte: startDate } }, { endDate: { gt: startDate } }] },
                            { AND: [{ startDate: { lt: endDate } }, { endDate: { gte: endDate } }] },
                            { AND: [{ startDate: { gte: startDate } }, { endDate: { lte: endDate } }] }
                        ]
                    }
                ]
            },
            include: { user: true },
            orderBy: { startDate: 'asc' }
        });
    }
    async create(data) {
        return await database_1.default.booking.create({
            data,
            include: { car: { include: { model: { include: { brand: true } } } } }
        });
    }
    async update(id, data, include = exports.BOOKING_INCLUDES.detailed) {
        return await database_1.default.booking.update({ where: { id }, data, include });
    }
    async delete(id) {
        return await database_1.default.booking.delete({ where: { id } });
    }
    async startTripTransaction(bookingId, carId) {
        return await database_1.default.$transaction(async (tx) => {
            const b = await tx.booking.update({
                where: { id: bookingId },
                data: { status: graphql_1.BookingStatus.ONGOING, updatedAt: new Date() }
            });
            await tx.car.update({
                where: { id: carId },
                data: { status: graphql_1.CarStatus.RENTED }
            });
            return b;
        });
    }
    async completeTripTransaction(bookingId, carId) {
        return await database_1.default.$transaction(async (tx) => {
            const b = await tx.booking.update({
                where: { id: bookingId },
                data: { status: graphql_1.BookingStatus.COMPLETED, updatedAt: new Date() }
            });
            await tx.car.update({
                where: { id: carId },
                data: { status: graphql_1.CarStatus.MAINTENANCE }
            });
            return b;
        });
    }
}
exports.BookingRepository = BookingRepository;
exports.bookingRepository = new BookingRepository();
//# sourceMappingURL=bookingRepository.js.map