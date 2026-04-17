import { prisma } from '../server/utils/prisma';

async function testCustomersAPI() {
  console.log('Testing customers API data retrieval...');
  
  try {
    // Test basic customer query (same as API endpoint)
    const customers = await prisma.customer.findMany({
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
    
    console.log(`Found ${customers.length} customers in database`);
    console.log('First 5 customers:');
    customers.slice(0, 5).forEach((c, i) => {
      console.log(`${i + 1}. ${c.name} (${c.phone}) - Category: ${c.category} - Debt: ${c.debtUSD || 0} USD, ${c.debtUZS || 0} UZS`);
    });
    
    // Check if there are any customers with missing required fields
    const invalidCustomers = customers.filter(c => !c.name || !c.phone);
    if (invalidCustomers.length > 0) {
      console.log(`\nWARNING: Found ${invalidCustomers.length} customers with missing required fields:`);
      invalidCustomers.forEach(c => {
        console.log(`- ID: ${c.id}, Name: ${c.name || 'MISSING'}, Phone: ${c.phone || 'MISSING'}`);
      });
    }
    
    // Check for any customers with null/undefined critical fields
    const nullFields = customers.filter(c => 
      c.debtUSD === null || 
      c.debtUZS === null || 
      c.balanceUSD === null || 
      c.balanceUZS === null
    );
    
    if (nullFields.length > 0) {
      console.log(`\nWARNING: Found ${nullFields.length} customers with null financial fields`);
    }
    
    return customers;
    
  } catch (error) {
    console.error('Error testing customers API:', error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

testCustomersAPI();
