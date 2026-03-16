import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test chat history functionality
async function testChatHistory() {
  console.log('🔍 Testing chat history functionality...');
  
  try {
    // Test 1: Get all customers with telegram chat ID
    const customers = await prisma.customer.findMany({
      where: {
        telegramChatId: {
          not: null
        }
      },
      select: {
        id: true,
        telegramChatId: true,
        name: true,
        phone: true
      }
    });

    console.log(`📊 Found ${customers.length} customers with telegram chat ID`);

    if (customers.length === 0) {
      console.log('❌ No customers found with telegram chat ID');
      return;
    }

    // Test 2: Check existing chat history
    for (const customer of customers) {
      console.log(`\n🔍 Checking chat history for: ${customer.name}`);
      
      const messages = await prisma.customerChat.findMany({
        where: {
          customerId: customer.id
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      console.log(`📝 Found ${messages.length} messages for ${customer.name}`);

      if (messages.length === 0) {
        console.log('⚠️ No messages found, creating test message...');
        
        // Create a test message
        await prisma.customerChat.create({
          data: {
            customerId: customer.id,
            message: `Test xabar: ${customer.name} uchun salom!`,
            senderType: 'ADMIN',
            messageType: 'TEXT',
            isRead: true
          }
        });

        console.log('✅ Test message created');
      } else {
        console.log('📋 Messages:');
        messages.forEach((msg, index) => {
          console.log(`  ${index + 1}. [${msg.senderType}] ${msg.message} (${msg.createdAt})`);
        });
      }
    }

    // Test 3: Create sample chat history if needed
    console.log('\n🔧 Creating sample chat history...');
    
    const sampleCustomers = customers.slice(0, 2); // Take first 2 customers
    
    for (const customer of sampleCustomers) {
      const existingMessages = await prisma.customerChat.findMany({
        where: {
          customerId: customer.id
        }
      });

      if (existingMessages.length < 3) {
        // Create sample conversation
        await prisma.customerChat.createMany({
          data: [
            {
              customerId: customer.id,
              message: `Assalomu alaykum ${customer.name}! Buyurtma berishni istayman.`,
              senderType: 'CUSTOMER',
              messageType: 'TEXT',
              isRead: true,
              createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
            },
            {
              customerId: customer.id,
              message: `Salom ${customer.name}! Qanday mahsulot kerak?`,
              senderType: 'ADMIN',
              messageType: 'TEXT',
              isRead: true,
              createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000) // 1.5 hours ago
            },
            {
              customerId: customer.id,
              message: `Menga 50 dona mahsulot kerak, qachun tayyor bo'ladi?`,
              senderType: 'CUSTOMER',
              messageType: 'TEXT',
              isRead: false,
              createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
            }
          ]
        });

        console.log(`✅ Created sample chat history for ${customer.name}`);
      }
    }

    // Test 4: Verify chat history for API
    console.log('\n🔍 Verifying chat history for API...');
    
    const chatHistories = [];
    
    for (const customer of customers) {
      const messages = await prisma.customerChat.findMany({
        where: {
          customerId: customer.id
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      if (messages.length > 0) {
        chatHistories.push({
          customerTelegramId: customer.telegramChatId,
          customerName: customer.name,
          customerPhone: customer.phone,
          messages: messages.map(msg => ({
            id: msg.id,
            text: msg.message,
            from: msg.senderType.toLowerCase(),
            timestamp: msg.createdAt,
            customerName: customer.name,
            customerPhone: customer.phone,
            read: msg.isRead
          })),
          lastMessage: new Date(Math.max(...messages.map(m => new Date(m.createdAt).getTime()))),
          unreadCount: messages.filter(m => m.senderType === 'CUSTOMER' && !m.isRead).length
        });
      }
    }

    console.log(`📊 Prepared ${chatHistories.length} chat histories for API`);
    
    // Sort by last message time
    chatHistories.sort((a, b) => b.lastMessage.getTime() - a.lastMessage.getTime());

    console.log('\n🎉 Chat history test completed!');
    console.log('📋 Summary:');
    console.log(`- Total customers with telegram: ${customers.length}`);
    console.log(`- Chat histories created: ${chatHistories.length}`);
    console.log(`- Total messages: ${chatHistories.reduce((sum, chat) => sum + chat.messages.length, 0)}`);
    
    return chatHistories;

  } catch (error) {
    console.error('❌ Chat history test failed:', error);
    return [];
  }
}

// Main test function
async function runChatHistoryTest() {
  console.log('🚀 Starting chat history test...\n');
  
  const result = await testChatHistory();
  
  if (result.length > 0) {
    console.log('\n✅ Chat history test successful!');
    console.log('\n📋 Sample chat histories:');
    result.slice(0, 2).forEach((chat, index) => {
      console.log(`\n${index + 1}. ${chat.customerName}`);
      console.log(`   Messages: ${chat.messages.length}`);
      console.log(`   Last message: ${chat.lastMessage.toLocaleString('uz-UZ')}`);
      console.log(`   Unread: ${chat.unreadCount}`);
    });
  } else {
    console.log('\n❌ Chat history test failed!');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if customers have telegramChatId');
    console.log('2. Check if CustomerChat model exists');
    console.log('3. Check database connection');
  }
}

// Run the test
runChatHistoryTest();
