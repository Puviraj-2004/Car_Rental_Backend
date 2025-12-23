import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  const adminEmail = 'admin@carrental.com';

  const hashedPassword = await bcrypt.hash('Admin@123456', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      isVerified: true,
    },
    create: {
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '+33 6 12 34 56 78',
      role: 'ADMIN',
      isVerified: true,
    },
  });

  console.log(`✅ Admin user ready: ${admin.email}`);
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });