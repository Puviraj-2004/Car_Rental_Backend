import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@carrental.com' }
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists');
    return;
  }

  // Hash password
  const hashedPassword = await hashPassword('Admin@123456');

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@carrental.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      phoneNumber: '+33 6 12 34 56 78',
      address: '123 Admin Street',
      city: 'Paris',
      country: 'France',
      postalCode: '75000',
      language: 'en',
      gdprConsent: true,
      consentDate: new Date()
    }
  });

  console.log('✅ Admin user created successfully:');
  console.log(`   Email: ${admin.email}`);
  console.log(`   Password: Admin@123456`);
  console.log(`   ID: ${admin.id}`);

  // Optional: Create sample car
  const sampleCar = await prisma.car.create({
    data: {
      brand: 'Tesla',
      model: 'Model 3',
      year: 2024,
      plateNumber: 'ADMIN-001',
      fuelType: 'ELECTRIC',
      transmission: 'AUTOMATIC',
      seats: 5,
      doors: 4,
      pricePerHour: 25.00,
      pricePerKm: 0.50,
      pricePerDay: 150.00,
      critAirRating: 0,
      availability: true,
      descriptionEn: 'Premium electric car with autopilot',
      descriptionFr: 'Voiture électrique premium avec autopilote'
    }
  });

  console.log('✅ Sample car created:');
  console.log(`   Brand: ${sampleCar.brand} ${sampleCar.model}`);
  console.log(`   Plate: ${sampleCar.plateNumber}`);

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
