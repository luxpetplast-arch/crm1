const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const user = await prisma.user.update({
      where: { login: 'admin' },
      data: { password: hashedPassword }
    });
    
    console.log('✅ Admin paroli yangilandi:');
    console.log('👤 Login:', user.login);
    console.log('🔑 Yangi parol: admin123');
    
  } catch (error) {
    console.error('❌ Xatolik:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
