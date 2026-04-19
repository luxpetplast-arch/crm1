const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetAdminPassword() {
  console.log('🔄 Admin parolini yangilash...');

  try {
    // Admin parolini yangilash
    const adminPassword = await bcrypt.hash('admin123', 10);
    
    // admin (oddiy) user uchun
    const admin1 = await prisma.user.updateMany({
      where: { login: 'admin' },
      data: { password: adminPassword }
    });
    console.log(`✅ admin user yangilandi: ${admin1.count} ta`);
    
    // admin@aziztrades.com user uchun
    const admin2 = await prisma.user.updateMany({
      where: { login: 'admin@aziztrades.com' },
      data: { password: adminPassword }
    });
    console.log(`✅ admin@aziztrades.com user yangilandi: ${admin2.count} ta`);

    console.log('\n📋 Yangi login ma\'lumotlari:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👨‍💼 ADMIN | Login: admin | Parol: admin123');
    console.log('👨‍💼 ADMIN | Login: admin@aziztrades.com | Parol: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ Endi admin123 bilan login qilib ko\'ring!');

  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
