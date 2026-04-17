const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCustomers() {
  try {
    const count = await prisma.customer.count();
    console.log(`Total customers: ${count}`);
    
    if (count > 0) {
      const customers = await prisma.customer.findMany({
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          createdAt: true
        },
        take: 5
      });
      
      console.log('First 5 customers:');
      customers.forEach(c => {
        console.log(`- ${c.name} (${c.phone}) - ${c.address}`);
      });
    } else {
      console.log('No customers found in database');
    }
  } catch (error) {
    console.error('Error checking customers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCustomers();
