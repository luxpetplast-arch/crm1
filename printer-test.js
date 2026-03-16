// Printer test script
import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testPrinter() {
    console.log('🖨️  Printer testing started...\n');
    
    // Test 1: Check if printer is connected
    console.log('1. Checking connected printers...');
    try {
        const { stdout } = await execAsync('wmic printer get name');
        console.log('✅ Found printers:');
        console.log(stdout);
    } catch (error) {
        console.error('❌ Error getting printer list:', error);
    }
    
    // Test 2: Create a simple test file
    console.log('\n2. Creating test file...');
    const testContent = `
PRINTER TEST PAGE
=================
Date: ${new Date().toLocaleString()}
Test: Printer connectivity check
Status: This is a test page to verify your printer is working

If you can read this, your printer is connected and working!
    `.trim();
    
    const testFilePath = './printer-test-page.txt';
    fs.writeFileSync(testFilePath, testContent);
    console.log('✅ Test file created:', testFilePath);
    
    // Test 3: Try to print the test file
    console.log('\n3. Attempting to print test file...');
    try {
        await execAsync(`notepad /p "${testFilePath}"`);
        console.log('✅ Print command sent successfully');
        console.log('📄 Check your printer for the test page');
    } catch (error) {
        console.error('❌ Failed to print:', error);
    }
    
    console.log('\n🔍 Alternative test methods:');
    console.log('- You can also open the test file manually and print from Notepad');
    console.log('- Check Windows Settings > Devices > Printers & scanners');
    console.log('- Make sure your printer is set as default');
    
    console.log('\n✨ Test completed!');
}

// Run the test
testPrinter().catch(console.error);
