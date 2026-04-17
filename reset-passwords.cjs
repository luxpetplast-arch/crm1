const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetPasswords() {
  try {
    // Default parollar
    const defaultPasswords = {
      'admin': 'admin123',
      'testuser': 'test123',
      'cashier1': 'cashier123',
      'kassir': 'kassir123'
    };

    console.log('🔄 Parollarni qayta o\'rnatish...');
    
    for (const [login, password] of Object.entries(defaultPasswords)) {
      const user = await prisma.user.findUnique({ where: { login } });
      
      if (user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await prisma.user.update({
          where: { login },
          data: { password: hashedPassword }
        });
        
        console.log(`✅ ${login} parol qayta o\'rnatildi: ${password}`);
      } else {
        console.log(`⚠️ ${login} foydalanuvchi topilmadi`);
      }
    }
    
    console.log('\n🎉 Barcha parollar muvaffaqiyatli o\'rnatildi!');
    console.log('\n📋 Login va parollar ro\'yxati:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    for (const [login, password] of Object.entries(defaultPasswords)) {
      const user = await prisma.user.findUnique({ where: { login } });
      console.log(`👤 ${user.name.toUpperCase()} | Login: ${login} | Parol: ${password}`);
    }
    
  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPasswords();
