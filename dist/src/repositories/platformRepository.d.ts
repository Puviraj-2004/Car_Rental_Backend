import { Prisma } from '@prisma/client';
export declare class PlatformRepository {
    getSettings(): Promise<{
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
    } | null>;
    createSettings(data: Prisma.PlatformSettingsCreateInput): Promise<{
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
    updateSettings(id: string, data: Prisma.PlatformSettingsUpdateInput): Promise<{
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
}
export declare const platformRepository: PlatformRepository;
//# sourceMappingURL=platformRepository.d.ts.map