const axios = require('axios');

async function testChatAPI() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Ijg2NDhmMWE2LWY4MDMtNDVlOC1iMWE2LTAxMjczMjgxY2Q5YyIsInJvbGUiOiJBRE1JTiIsIm5hbWUiOiJBZG1pbiIsImVtYWlsIjoiYWRtaW5AYXppenRyYWRlcy5jb20iLCJpYXQiOjE3NzM4MjY2MDgsImV4cCI6MTc3NDQzMTQwOH0.m3u5cprHkLpHLqJOI7z_DHIUKkC3dAcsMTWXUYGMFOE';
    
    console.log('Testing customer-chats API...');
    const response = await axios.get('http://localhost:5001/api/customer-chats', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    
    console.log('Chat count:', response.data.length);
    console.log('First chat:', JSON.stringify(response.data[0], null, 2));
  } catch (error) {
    console.error('Chat API error:', error.response?.data || error.message);
  }
}

testChatAPI();
