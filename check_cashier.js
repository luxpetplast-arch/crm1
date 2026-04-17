const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCashier1() {
  try {
    const user = await prisma.user.findUnique({ 
      where: { login: 'cashier1' },
      select: { id: true, name: true, login: true, role: true, active: true }
    });
    console.log('Cashier1 user:', user);
    
    if (!user) {
      console.log('❌ cashier1 user not found');
      
      // Barcha kassir rolidagi foydalanuvchilarni ko'rsatish
      const cashiers = await prisma.user.findMany({
        where: { role: { in: ['cashier', 'seller'] } },
        select: { id: true, name: true, login: true, role: true, active: true }
      });
      console.log('All cashier users:', cashiers);
    } else {
      console.log('✅ cashier1 found, active:', user.active);
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkCashier1();
