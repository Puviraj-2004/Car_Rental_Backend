"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformRepository = exports.PlatformRepository = void 0;
const database_1 = __importDefault(require("../utils/database"));
class PlatformRepository {
    async getSettings() {
        return await database_1.default.platformSettings.findFirst();
    }
    async createSettings(data) {
        return await database_1.default.platformSettings.create({
            data
        });
    }
    async updateSettings(id, data) {
        return await database_1.default.platformSettings.update({
            where: { id },
            data
        });
    }
}
exports.PlatformRepository = PlatformRepository;
exports.platformRepository = new PlatformRepository();
//# sourceMappingURL=platformRepository.js.map