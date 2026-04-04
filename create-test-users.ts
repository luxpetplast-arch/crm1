import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('🔧 Test foydalanuvchilar yaratilmoqda...');

    // Admin foydalanuvchi
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@aziztrades.com' },
      update: {},
      create: {
        email: 'admin@aziztrades.com',
        login: 'admin',
        password: adminPassword,
        name: 'Administrator',
        role: 'ADMIN',
        active: true,
      },
    });
    console.log('✅ Admin yaratildi:', admin.email);

    // Kassir foydalanuvchi
    const cashierPassword = await bcrypt.hash('cashier123', 10);
    const cashier = await prisma.user.upsert({
      where: { email: 'cashier@aziztrades.com' },
      update: {},
      create: {
        email: 'cashier@aziztrades.com',
        login: 'kassir',
        password: cashierPassword,
        name: 'Kassir',
        role: 'CASHIER',
        active: true,
      },
    });
    console.log('✅ Kassir yaratildi:', cashier.email);

    // Sotuvchi foydalanuvchi
    const sellerPassword = await bcrypt.hash('seller123', 10);
    const seller = await prisma.user.upsert({
      where: { email: 'seller@aziztrades.com' },
      update: {},
      create: {
        email: 'seller@aziztrades.com',
        login: 'sotuvchi',
        password: sellerPassword,
        name: 'Sotuvchi',
        role: 'SELLER',
        active: true,
      },
    });
    console.log('✅ Sotuvchi yaratildi:', seller.email);

    console.log('\n📋 Login ma\'lumotlari:');
    console.log('-------------------');
    console.log('Admin:');
    console.log('  Login: admin');
    console.log('  Parol: admin123');
    console.log('');
    console.log('Kassir:');
    console.log('  Login: kassir');
    console.log('  Parol: cashier123');
    console.log('');
    console.log('Sotuvchi:');
    console.log('  Login: sotuvchi');
    console.log('  Parol: seller123');
    console.log('-------------------');

  } catch (error) {
    console.error('❌ Xato:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
