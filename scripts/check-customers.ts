import { prisma } from '../server/utils/prisma';

async function checkCustomers() {
  console.log('Checking customers in database...');
  
  try {
    const count = await prisma.customer.count();
    const customers = await prisma.customer.findMany({ 
      select: { name: true, phone: true, address: true },
      orderBy: { name: 'asc' }
    });
    
    console.log(`Total customers in database: ${count}`);
    console.log('\nFirst 10 customers:');
    customers.slice(0, 10).forEach(c => {
      console.log(`- ${c.name} (${c.phone}) - ${c.address}`);
    });
    
    // Check for specific customers from the list
    const specificNames = ['Fahri aka', 'Muxasham oil', 'Ohun eg', 'Shohi eg-G\'ijduvon'];
    console.log('\nChecking specific customers:');
    
    for (const name of specificNames) {
      const customer = await prisma.customer.findFirst({
        where: { name: name }
      });
      if (customer) {
        console.log(`- ${name}: EXISTS (${customer.phone})`);
      } else {
        console.log(`- ${name}: NOT FOUND`);
      }
    }
    
  } catch (error) {
    console.error('Error checking customers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCustomers();
