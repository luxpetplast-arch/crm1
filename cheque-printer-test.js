// Cheque printer test - Uzbek version
import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testChequePrinter() {
    console.log('🧾 Cheque printer testi boshlandi...\n');
    
    // Check Xprinter XP-365B specific settings
    console.log('1. Xprinter XP-365B holatini tekshirish...');
    try {
        const { stdout } = await execAsync('powershell -Command "Get-Printer | Where-Object {$_.Name -like \"*Xprinter*\"} | Select-Object Name, DriverName, PortName, PrinterStatus"');
        console.log('✅ Cheque printer holati:');
        console.log(stdout);
    } catch (error) {
        console.error('❌ Cheque printer holatini olishda xatolik:', error);
    }
    
    // Create cheque-style test (thermal printer format)
    console.log('\n2. Cheque formatli test yaratish...');
    const chequeContent = `
===========================================
        LUX PET PLAST
===========================================
Sana: ${new Date().toLocaleDateString('uz-UZ')}
Vaqt: ${new Date().toLocaleTimeString('uz-UZ')}
-------------------------------------------
Mahsulot          Soni   Narx   Jami
-------------------------------------------
Plastik butilka   2      15000  30000
Qop               5      5000   25000
-------------------------------------------
Jami summa:                     55000
To'lov:                         55000
Qaytim:                         0
===========================================
Rahmat! Xaridingiz uchun!
===========================================
    `.trim();
    
    const chequeFile = './cheque-test.txt';
    fs.writeFileSync(chequeFile, chequeContent, 'utf8');
    console.log('✅ Cheque test fayli yaratildi:', chequeFile);
    
    // Test thermal printer settings
    console.log('\n3. Thermal printer sozlamalarini tekshirish...');
    try {
        // Check if printer supports continuous paper
        const { stdout } = await execAsync('powershell -Command "Get-PrinterProperty -PrinterName \'Xprinter XP-365B\' | Select-Object Name, Value"');
        console.log('✅ Printer xususiyatlari:');
        console.log(stdout);
    } catch (error) {
        console.log('⚠️ Printer xususiyatlarini olish muvaffaqiyatsiz');
    }
    
    // Try different print methods for thermal printer
    console.log('\n4. Cheque printerga chop etish...');
    
    // Method 1: Direct to printer
    try {
        console.log('Usul 1: To\'g\'ridan-to\'g\'ri printerga...');
        await execAsync(`powershell -Command "Get-Content '${chequeFile}' | Out-Printer -Name 'Xprinter XP-365B'"`);
        console.log('✅ To\'g\'ridan-to\'g\'ri chop etish yuborildi');
    } catch (error) {
        console.error('❌ To\'g\'ridan-to\'g\'ri chop etish xatolik:', error.message);
    }
    
    // Method 2: Raw print (for thermal printers)
    try {
        console.log('Usul 2: Raw print (thermal printer uchun)...');
        const rawContent = '\x1B@' + chequeContent + '\x1Bd\x00'; // ESC sequences for thermal printer
        const rawFile = './cheque-raw.txt';
        fs.writeFileSync(rawFile, rawContent, 'latin1');
        
        await execAsync(`copy /b "${rawFile}" "\\\\localhost\\Xprinter XP-365B"`);
        console.log('✅ Raw print yuborildi');
    } catch (error) {
        console.error('❌ Raw print xatolik:', error.message);
    }
    
    // Method 3: Notepad with specific settings
    try {
        console.log('Usul 3: Notepad bilan...');
        await execAsync(`notepad /p "${chequeFile}"`);
        console.log('✅ Notepad orqali chop etish yuborildi');
    } catch (error) {
        console.error('❌ Notepad chop etish xatolik:', error.message);
    }
    
    console.log('\n🔍 Cheque printer uchun maxsus tekshirishlar:');
    console.log('1. Qog\'oz o\'rash to\'g\'ri yo\'nalishda ekanligini tekshiring');
    console.log('2. Qog\'oz qutisi to\'lganligini tekshiring');
    console.log('3. Printer kartriji (termal head) toza ekanligini tekshiring');
    console.log('4. Qog\'oz tiqilib qolmaganligini tekshiring');
    console.log('5. Printer sozlamalarida qog\'oz o\'lchami to\'g\'ri tanlangan');
    console.log('6. Windows > Qurilmalar > Printerlar > Xprinter > Boshqaruv > Sozlamalar');
    console.log('7. "Qog\'oz manbai" > "Kesilgan qog\'oz" yoki "Rulon qog\'oz" tanlang');
    
    console.log('\n🧾 Cheque printer testi tugadi!');
    console.log('📄 Printerdan cheque chiqishini tekshiring');
}

// Run the cheque printer test
testChequePrinter().catch(console.error);
