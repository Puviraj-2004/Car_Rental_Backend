import { PrismaClient, Role } from '@prisma/client';
// கவனிக்க: உங்கள் seed.ts prisma ஃபோல்டரில் இருந்தால், src-க்கு செல்ல ../src தேவை
import { hashPassword } from '../src/utils/auth'; 

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. அட்மின் ஏற்கனவே இருக்கிறாரா என்று பார்த்தல்
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@carrental.com' }
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists');
  } else {
    // பாஸ்வேர்டு ஹேஷிங்
    const hashedPassword = await hashPassword('Admin@123456');

    // அட்மின் பயனர் உருவாக்கம்
    const admin = await prisma.user.create({
      data: {
        email: 'admin@carrental.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        phoneNumber: '+33 6 12 34 56 78',
        role: Role.ADMIN, 
      }
    });
    console.log(`✅ Admin user created: ${admin.email}`);
  }

  // 2. Sample Car பகுதியை நீக்கிவிட்டேன். 
  // ஒருவேளை உங்களுக்குக் கார்கள் எதுவுமே தேவையில்லை என்றால் இந்த இடம் காலியாக இருக்கலாம்.

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