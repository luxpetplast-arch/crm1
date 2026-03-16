// Printer test script - Uzbek version
import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testPrinter() {
    console.log('🖨️  Printerni tekshirish boshlandi...\n');
    
    // Test 1: Check if printer is connected
    console.log('1. Ulangan printerlarni tekshirish...');
    try {
        const { stdout } = await execAsync('powershell -Command "Get-WmiObject -Class Win32_Printer | Select-Object Name"');
        console.log('✅ Topilgan printerlar:');
        console.log(stdout);
    } catch (error) {
        console.error('❌ Printerlar ro\'yxatini olishda xatolik:', error);
    }
    
    // Test 2: Create a simple test file
    console.log('\n2. Test faylini yaratish...');
    const testContent = `
PRINTER TEST SAHIFASI
====================
Sana: ${new Date().toLocaleString('uz-UZ')}
Test: Printer ulanishini tekshirish
Holati: Bu printer ishlashini tekshirish uchun test sahifa

Agar siz bu yozuvlarni o\'qiy olsangiz, printeringiz ulangan va ishlayapti!
    `.trim();
    
    const testFilePath = './printer-test-uzbek.txt';
    fs.writeFileSync(testFilePath, testContent, 'utf8');
    console.log('✅ Test fayli yaratildi:', testFilePath);
    
    // Test 3: Try to print the test file
    console.log('\n3. Test faylini chop etishga urinish...');
    try {
        await execAsync(`notepad /p "${testFilePath}"`);
        console.log('✅ Chop etish buyrug\'i muvaffaqiyatli yuborildi');
        console.log('📄 Printerdan test sahifasini tekshiring');
    } catch (error) {
        console.error('❌ Chop etish muvaffaqiyatsiz:', error);
    }
    
    console.log('\n🔍 Qo\'shimcha tekshirish usullari:');
    console.log('- Test faylini ochib Notepad dan chop etishingiz mumkin');
    console.log('- Windows Sozlamalari > Qurilmalar > Printerlar va skanerlarni tekshiring');
    console.log('- Printerning asosiy printer sifatida o\'rnatilganligini tekshiring');
    
    console.log('\n✨ Test tugadi!');
}

// Run the test
testPrinter().catch(console.error);
