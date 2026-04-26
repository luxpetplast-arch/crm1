const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createCashier() {
  try {
    // Kassir uchun parolni hash qilish
    const hashedPassword = await bcrypt.hash('cashier123', 10);
    
    // Kassir foydalanuvchisini yaratish
    const cashier = await prisma.user.create({
      data: {
        login: 'cashier2',
        password: hashedPassword,
        name: 'Kassir',
        role: 'CASHIER',
        active: true
      }
    });
    
    console.log('✅ Kassir akkaunti muvaffaqiyatli yaratildi:');
    console.log('📧 Login: cashier');
    console.log('🔑 Parol: cashier123');
    console.log('👤 Ism: Kassir');
    console.log('🎭 Rol: CASHIER');
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('❌ Bu login allaqachon ro\'yxatdan o\'tgan');
    } else {
      console.error('❌ Xatolik:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createCashier();
