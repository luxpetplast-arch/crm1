const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function createCashier() {
  try {
    const hashedPassword = await bcrypt.hash('123456', 10);
    const cashier = await prisma.user.create({
      data: {
        name: 'Kassir',
        login: 'kassir',
        email: 'kassir@luxpet.uz',
        password: hashedPassword,
        role: 'CASHIER',
        active: true
      }
    });
    console.log('✅ Kassir yaratildi:', cashier);
  } catch (error) {
    console.log('❌ Xatolik:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createCashier();
