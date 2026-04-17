const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCashierUsers() {
  try {
    const cashiers = await prisma.user.findMany({
      where: { 
        OR: [
          { role: 'cashier' },
          { role: 'seller' }
        ]
      },
      select: { id: true, login: true, name: true, role: true, active: true }
    });
    
    console.log('Cashier users:');
    cashiers.forEach(user => {
      console.log(`- ${user.login} (${user.name}) - ${user.role} - Active: ${user.active}`);
    });
    
    if (cashiers.length === 0) {
      console.log('No cashier users found. Creating test cashier...');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('cashier123', 10);
      
      const newCashier = await prisma.user.create({
        data: {
          login: 'cashier1',
          password: hashedPassword,
          name: 'Test Cashier',
          role: 'cashier',
          active: true
        }
      });
      
      console.log('Created cashier:', newCashier.login);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCashierUsers();
