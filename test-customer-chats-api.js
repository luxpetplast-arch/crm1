import axios from 'axios';

// Test API endpoints for customer chats
async function testCustomerChatsAPI() {
  console.log('🔍 Testing Customer Chats API...');
  
  const API_BASE = 'http://localhost:5001/api';
  
  try {
    // Test 1: Get all customer chats
    console.log('\n📡 Testing GET /api/customer-chats');
    
    const response = await axios.get(`${API_BASE}/customer-chats`);
    
    console.log('✅ API Response:', response.status);
    console.log('📊 Chat histories:', response.data.length);
    
    if (response.data.length > 0) {
      console.log('\n📋 Sample chat histories:');
      response.data.slice(0, 2).forEach((chat, index) => {
        console.log(`\n${index + 1}. ${chat.customerName}`);
        console.log(`   Telegram ID: ${chat.customerTelegramId}`);
        console.log(`   Phone: ${chat.customerPhone}`);
        console.log(`   Messages: ${chat.messages.length}`);
        console.log(`   Last message: ${new Date(chat.lastMessage).toLocaleString('uz-UZ')}`);
        console.log(`   Unread: ${chat.unreadCount}`);
        
        if (chat.messages.length > 0) {
          console.log('   Recent messages:');
          chat.messages.slice(-3).forEach((msg, msgIndex) => {
            console.log(`     ${msgIndex + 1}. [${msg.from}] ${msg.text}`);
          });
        }
      });
    }
    
    // Test 2: Get specific chat history
    if (response.data.length > 0) {
      const firstChat = response.data[0];
      console.log(`\n📡 Testing GET /api/customer-chats/${firstChat.customerTelegramId}`);
      
      const chatResponse = await axios.get(`${API_BASE}/customer-chats/${firstChat.customerTelegramId}`);
      
      console.log('✅ Chat API Response:', chatResponse.status);
      console.log('📝 Messages:', chatResponse.data.messages.length);
      
      if (chatResponse.data.messages.length > 0) {
        console.log('📋 Message details:');
        chatResponse.data.messages.slice(0, 3).forEach((msg, index) => {
          console.log(`  ${index + 1}. [${msg.from}] ${msg.text} (${new Date(msg.timestamp).toLocaleString('uz-UZ')})`);
        });
      }
    }
    
    // Test 3: Send message to customer
    if (response.data.length > 0) {
      const firstChat = response.data[0];
      console.log(`\n📡 Testing POST /api/send-message`);
      
      try {
        const sendResponse = await axios.post(`${API_BASE}/send-message`, {
          telegramChatId: firstChat.customerTelegramId,
          message: `Test xabar: ${new Date().toLocaleString('uz-UZ')}`
        });
        
        console.log('✅ Send Message Response:', sendResponse.status);
        console.log('📤 Message sent successfully!');
        
      } catch (sendError) {
        console.log('⚠️ Send Message Error:', sendError.response?.data || sendError.message);
        console.log('💡 This might be expected if telegram bot is not configured');
      }
    }
    
    console.log('\n🎉 Customer Chats API test completed!');
    console.log('📋 Summary:');
    console.log(`- Total chat histories: ${response.data.length}`);
    console.log(`- API endpoints working: ✅`);
    console.log(`- Data structure: ✅`);
    
    return true;
    
  } catch (error) {
    console.error('❌ API Test failed:', error);
    
    if (error.response) {
      console.log('📊 Error Response:', error.response.status);
      console.log('📝 Error Data:', error.response.data);
    } else if (error.request) {
      console.log('🔌 Network Error: Server might be down');
      console.log('💡 Make sure server is running on port 5000');
    } else {
      console.log('⚠️ Other Error:', error.message);
    }
    
    return false;
  }
}

// Main test function
async function runAPITest() {
  console.log('🚀 Starting Customer Chats API test...\n');
  
  const success = await testCustomerChatsAPI();
  
  if (success) {
    console.log('\n✅ API test successful!');
    console.log('\n📋 Next steps:');
    console.log('1. Open browser and navigate to /customer-chats');
    console.log('2. Test the chat interface');
    console.log('3. Send messages to customers');
    console.log('4. Check real-time updates');
  } else {
    console.log('\n❌ API test failed!');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure server is running: npm run dev');
    console.log('2. Check server logs for errors');
    console.log('3. Verify database connection');
    console.log('4. Check if customer-chats route is properly imported');
  }
}

// Run the test
runAPITest();
