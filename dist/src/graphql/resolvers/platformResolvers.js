"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformResolvers = void 0;
const database_1 = __importDefault(require("../../utils/database"));
const authguard_1 = require("../../utils/authguard");
exports.platformResolvers = {
    Query: {
        // 🌍 Public Access: Anyone can read site settings (for Footer/Navbar)
        platformSettings: async () => {
            // Try to find existing settings
            const settings = await database_1.default.platformSettings.findFirst();
            // If no settings exist yet (fresh DB), create default ones
            if (!settings) {
                return await database_1.default.platformSettings.create({
                    data: {
                        companyName: 'RentCar',
                        currency: 'EUR',
                        taxPercentage: 20.0,
                        description: 'Premium car rental service.',
                        // Default empty values for new fields to avoid null issues if needed
                        facebookUrl: '',
                        twitterUrl: '',
                        instagramUrl: '',
                        linkedinUrl: '',
                        address: ''
                    }
                });
            }
            return settings;
        },
        // 🔒 Admin Only: View Audit Logs
        auditLogs: async (_, { limit, offset }, context) => {
            (0, authguard_1.isAdmin)(context); // Security Check
            return await database_1.default.auditLog.findMany({
                take: limit || 50,
                skip: offset || 0,
                orderBy: { createdAt: 'desc' },
                include: { user: true }
            });
        }
    },
    Mutation: {
        // 🔒 Admin Only: Update Settings
        updatePlatformSettings: async (_, { input }, context) => {
            (0, authguard_1.isAdmin)(context); // Security Check
            const existing = await database_1.default.platformSettings.findFirst();
            if (existing) {
                // Update existing record
                return await database_1.default.platformSettings.update({
                    where: { id: existing.id },
                    data: input
                });
            }
            else {
                // Create new if somehow deleted
                return await database_1.default.platformSettings.create({ data: input });
            }
        }
    }
};
//# sourceMappingURL=platformResolvers.js.map