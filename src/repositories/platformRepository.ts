import prisma from '../utils/database';
import { Prisma } from '@prisma/client';

export class PlatformRepository {
  async getSettings() {
    return await prisma.platformSettings.findFirst();
  }

  async createSettings(data: Prisma.PlatformSettingsCreateInput) {
    return await prisma.platformSettings.create({
      data
    });
  }

  async updateSettings(id: string, data: Prisma.PlatformSettingsUpdateInput) {
    return await prisma.platformSettings.update({
      where: { id },
      data
    });
  }
}

export const platformRepository = new PlatformRepository();