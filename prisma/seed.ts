import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { login: 'admin@aziztrades.com' },
    update: {},
    create: {
      login: 'admin@aziztrades.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      active: true,
    },
  });

  console.log('✅ Admin user created:', admin);

  // Cashier user
  const cashierPassword = await bcrypt.hash('cashier123', 10);
  const cashier = await prisma.user.upsert({
    where: { login: 'cashier' },
    update: {},
    create: {
      login: 'cashier',
      password: cashierPassword,
      name: 'Kassir',
      role: 'CASHIER',
      active: true,
    },
  });

  console.log('✅ Cashier user created:', cashier);

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
