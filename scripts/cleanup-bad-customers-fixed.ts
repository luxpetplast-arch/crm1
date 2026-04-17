import { prisma } from '../server/utils/prisma';

async function cleanupBadCustomers() {
  console.log('Cleaning up customers with missing names...');
  
  try {
    // Find all customers first, then filter for bad ones
    const allCustomers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        phone: true
      }
    });
    
    const badCustomers = allCustomers.filter(c => !c.name || c.name.trim() === '');
    
    console.log(`Found ${badCustomers.length} customers with missing names`);
    
    if (badCustomers.length > 0) {
      // Delete customers with missing names
      for (const customer of badCustomers) {
        console.log(`Deleting customer: ID ${customer.id}, Phone: ${customer.phone}`);
        await prisma.customer.delete({
          where: { id: customer.id }
        });
      }
      
      console.log(`Deleted ${badCustomers.length} bad customers`);
    }
    
    // Check remaining customers
    const remainingCount = await prisma.customer.count();
    console.log(`Remaining customers: ${remainingCount}`);
    
    // Show sample of good customers
    const sampleCustomers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        category: true
      },
      orderBy: { name: 'asc' },
      take: 5
    });
    
    console.log('\nSample of remaining customers:');
    sampleCustomers.forEach((c, i) => {
      console.log(`${i + 1}. ${c.name} (${c.phone}) - ${c.category}`);
    });
    
    return remainingCount;
    
  } catch (error) {
    console.error('Error cleaning up customers:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupBadCustomers();
