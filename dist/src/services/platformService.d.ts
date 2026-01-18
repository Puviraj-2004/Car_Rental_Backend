import { PlatformSettingsInput } from '../types/graphql';
export declare class PlatformService {
    getPlatformSettings(): Promise<{
        id: string;
        updatedAt: Date;
        address: string | null;
        companyName: string;
        supportEmail: string | null;
        supportPhone: string | null;
        taxPercentage: number;
        currency: string;
        youngDriverMinAge: number;
        youngDriverFee: number;
    }>;
    updatePlatformSettings(input: PlatformSettingsInput): Promise<{
        id: string;
        updatedAt: Date;
        address: string | null;
        companyName: string;
        supportEmail: string | null;
        supportPhone: string | null;
        taxPercentage: number;
        currency: string;
        youngDriverMinAge: number;
        youngDriverFee: number;
    }>;
    runOldBookingsCleanup(daysOld: number): Promise<number>;
    triggerManualExpiration(): Promise<boolean>;
}
export declare const platformService: PlatformService;
//# sourceMappingURL=platformService.d.ts.map