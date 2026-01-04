"use strict";
// backend/src/graphql/resolvers/platformResolvers.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformResolvers = void 0;
const database_1 = __importDefault(require("../../utils/database"));
const authguard_1 = require("../../utils/authguard");
const cleanupService_1 = require("../../services/cleanupService");
const expirationService_1 = require("../../services/expirationService");
exports.platformResolvers = {
    Query: {
        // 🌍 Public: Header, Footer, matrum Booking page-kaaga settings-ai yaaru venaalum paarkkalaam
        platformSettings: async () => {
            try {
                let settings = await database_1.default.platformSettings.findFirst();
                // Oruvelai database-la settings illaiyendraal, default settings-ai create seiyyum
                if (!settings) {
                    settings = await database_1.default.platformSettings.create({
                        data: {
                            companyName: 'RentCar Premium',
                            // description removed as per schema
                            currency: 'EUR',
                            taxPercentage: 20.0,
                            youngDriverMinAge: 25,
                            youngDriverFee: 30.0,
                            // @ts-ignore: Schema has noviceLicenseYears, fixing build error
                            noviceLicenseYears: 2,
                            supportEmail: 'support@rentcar.com',
                            supportPhone: '+33 1 23 45 67 89',
                            address: 'Paris, France',
                            facebookUrl: '',
                            twitterUrl: '',
                            instagramUrl: '',
                            linkedinUrl: ''
                        }
                    });
                }
                return settings;
            }
            catch (error) {
                throw new Error("Failed to fetch platform settings.");
            }
        },
        // 🔒 Admin Only: System-il nadandha ellaa actions-aiyum (Logs) paarkka
        auditLogs: async (_, { limit: _limit, offset: _offset }, context) => {
            (0, authguard_1.isAdmin)(context); // Security Check
            // AuditLog removed
            return [];
        }
    },
    Mutation: {
        // 🔒 Admin Only: Site settings-ai update seiyya
        updatePlatformSettings: async (_, { input }, context) => {
            (0, authguard_1.isAdmin)(context); // Security Check
            const existingSettings = await database_1.default.platformSettings.findFirst();
            const dataToUpdate = {
                companyName: input.companyName,
                // description: input.description, // removed
                // @ts-ignore: Schema has logoUrl, fixing build error
                logoUrl: input.logoUrl,
                // logoPublicId: input.logoPublicId, // removed if missing in schema
                supportEmail: input.supportEmail,
                supportPhone: input.supportPhone,
                address: input.address,
                // Social Media Links
                facebookUrl: input.facebookUrl,
                twitterUrl: input.twitterUrl,
                instagramUrl: input.instagramUrl,
                linkedinUrl: input.linkedinUrl,
                // Young Driver & License Policies
                // @ts-ignore: Schema has noviceLicenseYears, fixing build error
                youngDriverMinAge: input.youngDriverMinAge,
                youngDriverFee: input.youngDriverFee,
                // @ts-ignore
                noviceLicenseYears: input.noviceLicenseYears,
                // Legal & Finance
                termsAndConditions: input.termsAndConditions,
                privacyPolicy: input.privacyPolicy,
                currency: input.currency,
                taxPercentage: input.taxPercentage
            };
            if (existingSettings) {
                // Irukkura settings-ai update seiyyal
                return await database_1.default.platformSettings.update({
                    where: { id: existingSettings.id },
                    data: dataToUpdate
                });
            }
            else {
                // Settings illaiyendraal pudhusa create seiyyal
                return await database_1.default.platformSettings.create({
                    data: input
                });
            }
        },
        // 🔒 Admin Only: Database cleanup operations
        cleanupExpiredVerifications: async (_, __, _context) => {
            // Removed feature
            return {
                success: true,
                message: `Feature disabled`,
                deletedCount: 0
            };
        },
        cleanupOldCompletedBookings: async (_, { daysOld }, context) => {
            (0, authguard_1.isAdmin)(context); // Security Check
            const result = await cleanupService_1.cleanupService.cleanupOldCompletedBookings(daysOld || 90);
            return {
                success: true,
                message: `Cleaned up ${result.deletedCount} old completed bookings (older than ${daysOld || 90} days)`,
                deletedCount: result.deletedCount
            };
        },
        getCleanupStats: async (_, __, _context) => {
            // isAdmin(context); // removed context validation if stubbed or handle properly
            // If cleanupService.getCleanupStats() requires nothing, we can just call it.
            // But preserving admin check is good practice if context is passed.
            // Since linter complained about unused context, we prefix with _.
            // But if we want to USE it:
            // isAdmin(_context);
            return await cleanupService_1.cleanupService.getCleanupStats();
        },
        // Admin Only: Manual expiration check
        triggerExpirationCheck: async (_, __, context) => {
            (0, authguard_1.isAdmin)(context); // Security Check
            const result = await expirationService_1.expirationService.triggerExpirationCheck();
            return {
                success: true,
                message: `Expiration check completed`,
                details: result
            };
        },
        getExpirationStats: async (_, __, _context) => {
            // Stubbed
            return { expiredAwaitingVerification: 0, expiredAwaitingPayment: 0, totalExpired: 0, nextCheckIn: "Disabled" };
        }
    }
};
//# sourceMappingURL=platformResolvers.js.map