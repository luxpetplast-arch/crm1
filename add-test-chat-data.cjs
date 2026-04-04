const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTelegramIds() {
  try {
    // Get first few customers and add telegram chat IDs
    const customers = await prisma.customer.findMany({
      take: 5
    });
    
    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      await prisma.customer.update({
        where: { id: customer.id },
        data: { 
          telegramChatId: (987654321 + i).toString() 
        }
      });
      console.log(`Updated ${customer.name} with telegramChatId: ${987654321 + i}`);
    }
    
    // Add some test chat messages
    for (let i = 0; i < 3; i++) {
      const customer = customers[i];
      await prisma.customerChat.create({
        data: {
          customerId: customer.id,
          message: `Test xabar ${i + 1} dan ${customer.name}`,
          senderType: 'USER',
          messageType: 'TEXT',
          isRead: false
        }
      });
      
      await prisma.customerChat.create({
        data: {
          customerId: customer.id,
          message: `Test javob ${i + 1} ${customer.name} ga`,
          senderType: 'BOT',
          messageType: 'TEXT',
          isRead: true
        }
      });
    }
    
    console.log('✅ Telegram chat IDs and test messages added successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTelegramIds();
