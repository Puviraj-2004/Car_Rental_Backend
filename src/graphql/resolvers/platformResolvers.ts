// backend/src/graphql/resolvers/platformResolvers.ts

import prisma from '../../utils/database';
import { isAdmin } from '../../utils/authguard';

export const platformResolvers = {
  Query: {
    // 🌍 Public: Header, Footer, matrum Booking page-kaaga settings-ai yaaru venaalum paarkkalaam
    platformSettings: async () => {
      try {
        let settings = await prisma.platformSettings.findFirst();
        
        // Oruvelai database-la settings illaiyendraal, default settings-ai create seiyyum
        if (!settings) {
          settings = await prisma.platformSettings.create({
            data: {
              companyName: 'RentCar Premium',
              description: 'AI-powered premium car rental service.',
              currency: 'EUR',
              taxPercentage: 20.0,
              youngDriverMinAge: 25,
              youngDriverFee: 30.0,
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
      } catch (error) {
        throw new Error("Failed to fetch platform settings.");
      }
    },

    // 🔒 Admin Only: System-il nadandha ellaa actions-aiyum (Logs) paarkka
    auditLogs: async (_: any, { limit, offset }: { limit?: number, offset?: number }, context: any) => {
      isAdmin(context); // Security Check

      return await prisma.auditLog.findMany({
        take: limit || 50,
        skip: offset || 0,
        orderBy: { createdAt: 'desc' },
        include: { 
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              role: true
            }
          }
        }
      });
    }
  },

  Mutation: {
    // 🔒 Admin Only: Site settings-ai update seiyya
    updatePlatformSettings: async (_: any, { input }: { input: any }, context: any) => {
      isAdmin(context); // Security Check

      const existingSettings = await prisma.platformSettings.findFirst();

      if (existingSettings) {
        // Irukkura settings-ai update seiyyal
        return await prisma.platformSettings.update({
          where: { id: existingSettings.id },
          data: {
            companyName: input.companyName,
            description: input.description,
            logoUrl: input.logoUrl,
            logoPublicId: input.logoPublicId,
            supportEmail: input.supportEmail,
            supportPhone: input.supportPhone,
            address: input.address,
            
            // Social Media Links
            facebookUrl: input.facebookUrl,
            twitterUrl: input.twitterUrl,
            instagramUrl: input.instagramUrl,
            linkedinUrl: input.linkedinUrl,

            // Young Driver & License Policies
            youngDriverMinAge: input.youngDriverMinAge,
            youngDriverFee: input.youngDriverFee,
            noviceLicenseYears: input.noviceLicenseYears,

            // Legal & Finance
            termsAndConditions: input.termsAndConditions,
            privacyPolicy: input.privacyPolicy,
            currency: input.currency,
            taxPercentage: input.taxPercentage
          }
        });
      } else {
        // Settings illaiyendraal pudhusa create seiyyal
        return await prisma.platformSettings.create({
          data: input
        });
      }
    }
  }
};