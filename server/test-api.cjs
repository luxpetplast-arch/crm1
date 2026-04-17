const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

async function testCustomersAPI() {
  try {
    // Simulate the API logic
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
      }
    });
    
    console.log(`Found ${customers.length} customers`);
    console.log('First customer structure:', JSON.stringify(customers[0], null, 2));
    
    // Test JWT
    const testUser = { id: 'test', name: 'Test User' };
    const token = jwt.sign(testUser, process.env.JWT_SECRET || 'test-secret');
    console.log('Test token generated');
    
  } catch (error) {
    console.error('Error testing API:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCustomersAPI();
