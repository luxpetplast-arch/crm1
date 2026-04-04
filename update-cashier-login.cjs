const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateCashierLogin() {
  try {
    // Kassir loginini yangilash
    const cashier = await prisma.user.update({
      where: { email: 'cashier@zavod.uz' },
      data: { login: 'cashier1' }
    });
    
    console.log('✅ Kassir login yangilandi:');
    console.log('📧 Email:', cashier.email);
    console.log('👤 Login:', cashier.login);
    console.log('🎭 Rol:', cashier.role);
    
  } catch (error) {
    console.error('❌ Xatolik:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updateCashierLogin();
