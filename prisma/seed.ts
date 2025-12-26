// prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. ADMIN USER SEEDING
  const adminEmail = 'admin@carrental.com';
  const hashedPassword = await bcrypt.hash('Admin@123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      username: 'admin_user', // ✅ firstName/lastName-க்கு பதில் username
      password: hashedPassword,
      role: Role.ADMIN,
      isEmailVerified: true,
    },
    create: {
      email: adminEmail,
      username: 'admin_user', // ✅ firstName/lastName-க்கு பதில் username
      password: hashedPassword,
      phoneNumber: '+33612345678', // ✅ phoneNumber இப்போது கட்டாயம்
      role: Role.ADMIN,
      isEmailVerified: true,
    },
  });

  console.log(`✅ Admin user ready: ${admin.username}`);

  // 2. PLATFORM SETTINGS SEEDING
  const settings = await prisma.platformSettings.findFirst();
  
  if (!settings) {
    await prisma.platformSettings.create({
      data: {
        companyName: 'RentCar Premium',
        description: 'Premium car rental service with AI-powered instant verification.',
        supportEmail: 'support@rentcar.com',
        supportPhone: '+33 1 23 45 67 89',
        address: '123 Avenue des Champs-Élysées, Paris, France',
        currency: 'EUR',
        taxPercentage: 20.0,
        facebookUrl: 'https://facebook.com/rentcar',
        instagramUrl: 'https://instagram.com/rentcar',
        twitterUrl: 'https://twitter.com/rentcar',
        linkedinUrl: 'https://linkedin.com/company/rentcar',
      },
    });
    console.log('✅ Platform Settings seeded successfully!');
  } else {
    console.log('ℹ️ Platform Settings already exist, skipping...');
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });