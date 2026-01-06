"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRepository = exports.PaymentRepository = void 0;
const database_1 = __importDefault(require("../utils/database"));
class PaymentRepository {
    async findAll() {
        return await database_1.default.payment.findMany({
            include: { booking: true }
        });
    }
    async findByBookingId(bookingId) {
        return await database_1.default.payment.findUnique({
            where: { bookingId },
            include: { booking: true }
        });
    }
    async findById(id) {
        return await database_1.default.payment.findUnique({
            where: { id },
            include: { booking: true }
        });
    }
    async upsertPayment(bookingId, data) {
        return await database_1.default.payment.upsert({
            where: { bookingId },
            update: data,
            create: {
                bookingId,
                ...data
            },
            include: { booking: true }
        });
    }
    async create(data) {
        return await database_1.default.payment.create({
            data,
            include: { booking: true }
        });
    }
    async update(id, data) {
        return await database_1.default.payment.update({
            where: { id },
            data,
            include: { booking: true }
        });
    }
}
exports.PaymentRepository = PaymentRepository;
exports.paymentRepository = new PaymentRepository();
//# sourceMappingURL=paymentRepository.js.map