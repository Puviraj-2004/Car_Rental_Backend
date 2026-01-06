"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const database_1 = __importDefault(require("../utils/database"));
const graphql_1 = require("../types/graphql");
const USER_INCLUDE = { verification: true, bookings: true };
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
            include: includeAll ? USER_INCLUDE : { verification: true }
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
    async findVerificationByUserId(userId) {
        return await database_1.default.documentVerification.findUnique({ where: { userId } });
    }
    async upsertVerification(userId, data) {
        return await database_1.default.documentVerification.upsert({
            where: { userId },
            update: data,
            create: {
                user: { connect: { id: userId } },
                ...data
            }
        });
    }
    async updateVerification(userId, data) {
        return await database_1.default.documentVerification.update({
            where: { userId },
            data
        });
    }
    async findBookingVerificationByToken(token) {
        return await database_1.default.bookingVerification.findUnique({ where: { token } });
    }
    async updateBookingStatus(id, status) {
        return await database_1.default.booking.update({
            where: { id },
            data: { status, updatedAt: new Date() }
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