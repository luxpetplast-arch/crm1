import { prisma } from '../server/utils/prisma';

async function checkCashierCustomers() {
  console.log('Checking customers for cashier system...');
  
  try {
    // Check total customer count
    const totalCount = await prisma.customer.count();
    console.log(`Total customers in database: ${totalCount}`);
    
    // Check recent customers
    const recentCustomers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        phone: true,
        address: true,
        category: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });
    
    console.log('\nRecent 10 customers:');
    recentCustomers.forEach((c, i) => {
      console.log(`${i + 1}. ${c.name} (${c.phone}) - ${c.category} - Created: ${c.createdAt.toLocaleDateString()}`);
    });
    
    // Check for any customers with missing required fields
    const invalidCustomers = await prisma.customer.findMany({
      where: {
        OR: [
          { name: '' },
          { name: null },
          { phone: '' },
          { phone: null }
        ]
      }
    });
    
    if (invalidCustomers.length > 0) {
      console.log(`\nWARNING: Found ${invalidCustomers.length} customers with missing required fields`);
    }
    
    // Test API query exactly as cashier would see it
    console.log('\nTesting API query as cashier would see it...');
    const apiCustomers = await prisma.customer.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        telegramChatId: true,
        telegramUsername: true,
        notificationsEnabled: true,
        category: true,
        balance: true,
        balanceUZS: true,
        balanceUSD: true,
        debt: true,
        debtUZS: true,
        debtUSD: true,
        creditLimit: true,
        paymentTermDays: true,
        discountPercent: true,
        pricePerBag: true,
        productPrices: true,
        lastPurchase: true,
        lastPayment: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { sales: true } }
      },
      orderBy: { name: 'asc' }
    });
    
    console.log(`API query returns: ${apiCustomers.length} customers`);
    
    return {
      totalCount,
      recentCustomers,
      apiCustomers,
      invalidCustomers
    };
    
  } catch (error) {
    console.error('Error checking customers:', error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

checkCashierCustomers();
