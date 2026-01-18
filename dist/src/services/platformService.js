"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformService = exports.PlatformService = void 0;
const platformRepository_1 = require("../repositories/platformRepository");
const cleanupService_1 = require("./cleanupService");
const expirationService_1 = require("./expirationService");
const AppError_1 = require("../errors/AppError");
class PlatformService {
    async getPlatformSettings() {
        try {
            let settings = await platformRepository_1.platformRepository.getSettings();
            if (!settings) {
                // Business Logic: Auto-initialize settings if DB is empty
                settings = await platformRepository_1.platformRepository.createSettings({
                    companyName: 'RentCar Premium',
                    currency: 'EUR',
                    taxPercentage: 20.0,
                    youngDriverMinAge: 25,
                    youngDriverFee: 30.0,
                    supportEmail: 'support@rentcar.com',
                    supportPhone: '+33 1 23 45 67 89',
                    address: 'Paris, France',
                });
            }
            return settings;
        }
        catch (error) {
            throw new AppError_1.AppError("Failed to fetch platform settings", AppError_1.ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
    async updatePlatformSettings(input) {
        const existingSettings = await platformRepository_1.platformRepository.getSettings();
        // Mapping logic kept exactly as provided in original code
        const dataToUpdate = {
            companyName: input.companyName,
            supportEmail: input.supportEmail,
            supportPhone: input.supportPhone,
            address: input.address,
            facebookUrl: input.facebookUrl,
            twitterUrl: input.twitterUrl,
            instagramUrl: input.instagramUrl,
            linkedinUrl: input.linkedinUrl,
            youngDriverMinAge: input.youngDriverMinAge,
            youngDriverFee: input.youngDriverFee,
            termsAndConditions: input.termsAndConditions,
            privacyPolicy: input.privacyPolicy,
            currency: input.currency,
            taxPercentage: input.taxPercentage,
            // Novice driver and logo fields handled with safe checks for schema compatibility
            ...(input.noviceLicenseYears && { noviceLicenseYears: input.noviceLicenseYears }),
            ...(input.logoUrl && { logoUrl: input.logoUrl })
        };
        if (existingSettings) {
            return await platformRepository_1.platformRepository.updateSettings(existingSettings.id, dataToUpdate);
        }
        else {
            return await platformRepository_1.platformRepository.createSettings(input);
        }
    }
    async runOldBookingsCleanup(daysOld) {
        const result = await cleanupService_1.cleanupService.cleanupOldCompletedBookings(daysOld);
        return result.deletedCount;
    }
    async triggerManualExpiration() {
        return await expirationService_1.expirationService.triggerExpirationCheck();
    }
}
exports.PlatformService = PlatformService;
exports.platformService = new PlatformService();
//# sourceMappingURL=platformService.js.map