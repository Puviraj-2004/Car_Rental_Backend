"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const database_1 = __importDefault(require("../utils/database"));
const graphql_1 = require("../types/graphql");
const USER_INCLUDE = { bookings: true };
class UserRepository {
    async findByEmail(email) {
        return await database_1.default.user.findUnique({
            where: { email },
            include: USER_INCLUDE
        });
    }
    async findById(id, includeAll = false) {
        return await database_1.default.user.findUnique({
            where: { id },
            include: includeAll ? USER_INCLUDE : { bookings: true }
        });
    }
    async findAll() {
        return await database_1.default.user.findMany({
            include: USER_INCLUDE
        });
    }
    async createUser(data) {
        return await database_1.default.user.create({
            data,
            include: USER_INCLUDE
        });
    }
    async updateUser(id, data) {
        return await database_1.default.user.update({
            where: { id },
            data,
            include: USER_INCLUDE
        });
    }
    async deleteUser(id) {
        return await database_1.default.user.delete({ where: { id } });
    }
    async findVerificationByBookingId(bookingId) {
        return await database_1.default.documentVerification.findUnique({ where: { bookingId } });
    }
    async upsertVerification(bookingId, data) {
        return await database_1.default.documentVerification.upsert({
            where: { bookingId },
            update: data,
            create: {
                booking: { connect: { id: bookingId } },
                ...data
            },
            include: {
                booking: {
                    include: {
                        user: true // Include user data for frontend
                    }
                }
            }
        });
    }
    async updateVerification(bookingId, data) {
        return await database_1.default.documentVerification.update({
            where: { bookingId },
            data
        });
    }
    async findBookingVerificationByToken(token) {
        return await database_1.default.bookingVerification.findUnique({ where: { token } });
    }
    async updateBookingVerification(id, data) {
        return await database_1.default.bookingVerification.update({
            where: { id },
            data
        });
    }
    async updateManyBookingsStatus(userId, currentStatus, nextStatus) {
        return await database_1.default.booking.updateMany({
            where: { userId, status: currentStatus },
            data: { status: nextStatus, updatedAt: new Date() }
        });
    }
    async countActiveBookings(userId) {
        return await database_1.default.booking.count({
            where: {
                userId,
                status: {
                    in: [graphql_1.BookingStatus.PENDING, graphql_1.BookingStatus.VERIFIED, graphql_1.BookingStatus.CONFIRMED, graphql_1.BookingStatus.ONGOING]
                }
            }
        });
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
//# sourceMappingURL=userRepository.js.map