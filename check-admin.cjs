const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const users = await prisma.user.findMany();
    console.log('📋 Foydalanuvchilar:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });
    
    if (users.length === 0) {
      console.log('\n❌ Foydalanuvchilar yo\'q!');
      console.log('💡 Seed qiling: npm run seed');
    }
  } catch (error) {
    console.error('Xatolik:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
