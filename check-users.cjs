const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  console.log('👥 Foydalanuvchilarni tekshirish...\n');
  
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        login: true,
        name: true,
        role: true,
        active: true,
        createdAt: true
      }
    });
    
    console.log(`Jami foydalanuvchilar: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('❌ Database bo\'sh! Foydalanuvchi yo\'q.');
      console.log('\n💡 Yechim: npm run seed yoki npx tsx scripts/seed.ts ishga tushiring');
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name}`);
        console.log(`   Login: ${user.login}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Active: ${user.active}`);
        console.log(`   Created: ${user.createdAt}`);
        console.log('');
      });
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Xatolik:', error.message);
    await prisma.$disconnect();
  }
}

checkUsers();
