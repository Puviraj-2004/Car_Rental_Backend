"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    // 1. ADMIN USER SEEDING
    const adminEmail = 'admin@carrental.com';
    const hashedPassword = await bcryptjs_1.default.hash('Admin@123456', 10);
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            password: hashedPassword,
            fullName: 'Super Admin',
            role: client_1.Role.ADMIN,
            emailVerified: true,
        },
        create: {
            email: adminEmail,
            fullName: 'Super Admin',
            password: hashedPassword,
            phoneNumber: '+33612345678',
            role: client_1.Role.ADMIN,
            emailVerified: true,
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
//# sourceMappingURL=seed.js.map