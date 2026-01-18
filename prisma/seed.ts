import { PrismaClient, Role} from '@prisma/client';
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
      password: hashedPassword,
      fullName: 'Super Admin',
      role: Role.ADMIN,
    },
    create: {
      email: adminEmail,
      fullName: 'Super Admin',
      password: hashedPassword,
      phoneNumber: '+33612345678',
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Admin user ready: ${admin.email}`);

  // 2. PLATFORM SETTINGS SEEDING
  const settings = await prisma.platformSettings.findFirst();
  if (!settings) {
    await prisma.platformSettings.create({
      data: {
        companyName: 'RentCar Premium France',
        supportEmail: 'support@rentcar.com',
        supportPhone: '+33 1 23 45 67 89',
        address: '123 Avenue des Champs-Élysées, Paris',
        taxPercentage: 20.0,
        currency: 'EUR',
        youngDriverMinAge: 25,
        youngDriverFee: 30.0,
      },
    });
    console.log('✅ Platform Settings seeded!');
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