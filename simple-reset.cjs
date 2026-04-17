const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetPasswords() {
  try {
    console.log('🔄 Parollarni qayta o\'rnatish...');
    
    // Admin paroli
    const adminHash = await bcrypt.hash('admin123', 10);
    await prisma.user.update({
      where: { login: 'admin' },
      data: { password: adminHash }
    });
    console.log('✅ admin parol: admin123');
    
    // Test user paroli
    const testHash = await bcrypt.hash('test123', 10);
    await prisma.user.update({
      where: { login: 'testuser' },
      data: { password: testHash }
    });
    console.log('✅ testuser parol: test123');
    
    // Cashier1 paroli
    const cashier1Hash = await bcrypt.hash('cashier123', 10);
    await prisma.user.update({
      where: { login: 'cashier1' },
      data: { password: cashier1Hash }
    });
    console.log('✅ cashier1 parol: cashier123');
    
    // Kassir paroli
    const kassirHash = await bcrypt.hash('kassir123', 10);
    await prisma.user.update({
      where: { login: 'kassir' },
      data: { password: kassirHash }
    });
    console.log('✅ kassir parol: kassir123');
    
    console.log('\n🎉 Barcha parollar muvaffaqiyatli o\'rnatildi!');
    
  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPasswords();
