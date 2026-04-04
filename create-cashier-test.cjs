const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createCashierUser() {
  try {
    // Tekshirish - user allaqachon mavjudmi
    const existingUser = await prisma.user.findUnique({
      where: { login: 'cashier1' }
    });

    if (existingUser) {
      console.log('✅ Cashier user allaqachon mavjud:', existingUser.login);
      return;
    }

    // Yangi kassir user yaratish
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const cashier = await prisma.user.create({
      data: {
        login: 'cashier1',
        email: 'cashier1@luxpet.uz',
        password: hashedPassword,
        name: 'Test Kassir',
        role: 'CASHIER',
        active: true
      }
    });

    console.log('✅ Kassir user muvaffaqiyatli yaratildi:');
    console.log('Login:', cashier.login);
    console.log('Parol:', '123456');
    console.log('Roli:', cashier.role);
    
  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createCashierUser();
