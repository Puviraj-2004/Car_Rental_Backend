"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingRepository = exports.BookingRepository = exports.BOOKING_INCLUDES = void 0;
const database_1 = __importDefault(require("../utils/database"));
const client_1 = require("@prisma/client"); // ✅ Use Prisma native enums for repo
/**
 * Senior Architect Note:
 * Centralized Include configurations.
 * Added 'images: true' to the admin section to prevent "Cannot return null for non-nullable field Car.images" errors.
 */
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
        car: { include: { model: { include: { brand: true } }, images: true } }, // ✅ FIXED: Added images: true
        payment: true,
        verification: true
    }
};
class BookingRepository {
    async findMany(where, include = exports.BOOKING_INCLUDES.detailed, orderBy = { createdAt: 'desc' }) {
        return await database_1.default.booking.findMany({ where, include, orderBy });
    }
    async findUnique(id, include = exports.BOOKING_INCLUDES.detailed) {
        return await database_1.default.booking.findUnique({ where: { id }, include });
    }
    async findFirst(where, include = exports.BOOKING_INCLUDES.detailed) {
        return await database_1.default.booking.findFirst({ where, include });
    }
    async findVerificationToken(token) {
        return await database_1.default.bookingVerification.findUnique({ where: { token } });
    }
    async findConflicts(carId, startDate, endDate) {
        // 🛡️ Senior Logic: Strict Status-based conflict check
        const conflictStatuses = [
            client_1.BookingStatus.PENDING,
            client_1.BookingStatus.VERIFIED,
            client_1.BookingStatus.CONFIRMED,
            client_1.BookingStatus.ONGOING
        ];
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
    // 🚀 Transactional Start Trip: Atomic update for Booking & Car
    async startTripTransaction(bookingId, carId) {
        return await database_1.default.$transaction([
            database_1.default.booking.update({
                where: { id: bookingId },
                data: { status: client_1.BookingStatus.ONGOING, updatedAt: new Date() },
                include: exports.BOOKING_INCLUDES.detailed
            }),
            database_1.default.car.update({
                where: { id: carId },
                data: { status: client_1.CarStatus.RENTED }
            })
        ]);
    }
    // 🧹 Transactional Complete Trip: Booking to COMPLETED, Car to MAINTENANCE
    async completeTripTransaction(bookingId, carId) {
        return await database_1.default.$transaction([
            database_1.default.booking.update({
                where: { id: bookingId },
                data: { status: client_1.BookingStatus.COMPLETED, updatedAt: new Date() },
                include: exports.BOOKING_INCLUDES.detailed
            }),
            database_1.default.car.update({
                where: { id: carId },
                data: { status: client_1.CarStatus.MAINTENANCE }
            })
        ]);
    }
}
exports.BookingRepository = BookingRepository;
exports.bookingRepository = new BookingRepository();
//# sourceMappingURL=bookingRepository.js.map