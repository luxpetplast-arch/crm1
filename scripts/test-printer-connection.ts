import axios from 'axios';

async function testPrinterConnection() {
  console.log('=== Printer Connection Test ===');
  
  try {
    // 1. Test print API without authentication
    console.log('1. Testing print API without authentication...');
    const response1 = await fetch('http://localhost:5002/api/print/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test: true
      })
    });
    
    if (response1.ok) {
      console.log('✅ Print API test endpoint works');
      const result1 = await response1.json();
      console.log('Test result:', result1);
    } else {
      console.log('❌ Print API test endpoint failed:', response1.status);
    }
    
    // 2. Test print API with authentication
    console.log('2. Testing print API with authentication...');
    
    // First login to get token
    const loginResponse = await axios.post('http://localhost:5002/api/auth/login', {
      login: 'admin@aziztrades.com',
      password: 'admin123'
    });
    
    if (loginResponse.data.token) {
      console.log('✅ Login successful, got token');
      
      const response2 = await fetch('http://localhost:5002/api/print/receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginResponse.data.token}`
        },
        body: JSON.stringify({
          content: 'TEST CHEK WITH AUTH\nBu test chekdiri\nLUX PET PLAST',
          filename: 'test-receipt-auth.txt'
        })
      });
      
      if (response2.ok) {
        console.log('✅ Print API with authentication works');
        const result2 = await response2.json();
        console.log('Auth test result:', result2);
      } else {
        console.log('❌ Print API with authentication failed:', response2.status);
      }
    } else {
      console.log('❌ Login failed');
    }
    
    // 3. Check if printer is available
    console.log('3. Checking printer availability...');
    
    try {
      const { exec } = require('child_process');
      const execAsync = require('util').promisify(exec);
      
      // Check if printer is recognized
      const printerCheck = await execAsync('powershell -Command "Get-Printer | Where-Object {$_.Name -like \'*XP-365*\'}"');
      
      if (printerCheck.stdout && printerCheck.stdout.includes('XP-365B')) {
        console.log('✅ Printer Xprinter XP-365B found');
      } else {
        console.log('❌ Printer Xprinter XP-365B not found');
        console.log('Available printers:', printerCheck.stdout);
      }
    } catch (error) {
      console.log('❌ Printer check failed:', error);
    }
    
    console.log('\n=== Printer Connection Test Complete ===');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testPrinterConnection();
