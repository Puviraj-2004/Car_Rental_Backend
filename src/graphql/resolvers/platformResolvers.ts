import prisma from '../../utils/database';
import { isAdmin } from '../../utils/authguard';

export const platformResolvers = {
  Query: {
    // 🌍 Public Access: Anyone can read site settings (for Footer/Navbar)
    platformSettings: async () => {
      // Try to find existing settings
      const settings = await prisma.platformSettings.findFirst();
      
      // If no settings exist yet (fresh DB), create default ones
      if (!settings) {
         return await prisma.platformSettings.create({
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
    auditLogs: async (_: any, { limit, offset }: any, context: any) => {
      isAdmin(context); // Security Check

      return await prisma.auditLog.findMany({
        take: limit || 50,
        skip: offset || 0,
        orderBy: { createdAt: 'desc' },
        include: { user: true }
      });
    }
  },

  Mutation: {
    // 🔒 Admin Only: Update Settings
    updatePlatformSettings: async (_: any, { input }: any, context: any) => {
      isAdmin(context); // Security Check
      
      const existing = await prisma.platformSettings.findFirst();
      
      if (existing) {
        // Update existing record
        return await prisma.platformSettings.update({
          where: { id: existing.id },
          data: input
        });
      } else {
        // Create new if somehow deleted
        return await prisma.platformSettings.create({ data: input });
      }
    }
  }
};