// Printer diagnostic tool - Uzbek version
import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function diagnosePrinter() {
    console.log('🔧 Printer diagnostikasi boshlandi...\n');
    
    // Step 1: Check printer status
    console.log('1. Printer holatini tekshirish...');
    try {
        const { stdout } = await execAsync('powershell -Command "Get-WmiObject -Class Win32_Printer | Select-Object Name, PrinterStatus, Default | Format-Table -AutoSize"');
        console.log('✅ Printer holati:');
        console.log(stdout);
    } catch (error) {
        console.error('❌ Printer holatini olishda xatolik:', error);
    }
    
    // Step 2: Check print spooler service
    console.log('\n2. Print spooler xizmatini tekshirish...');
    try {
        const { stdout } = await execAsync('powershell -Command "Get-Service -Name Spooler | Select-Object Name, Status"');
        console.log('✅ Print Spooler holati:');
        console.log(stdout);
    } catch (error) {
        console.error('❌ Print Spooler holatini olishda xatolik:', error);
    }
    
    // Step 3: Check default printer
    console.log('\n3. Asosiy printerni tekshirish...');
    try {
        const { stdout } = await execAsync('powershell -Command "(Get-WmiObject -Class Win32_Printer -Filter \"Default=$true\").Name"');
        console.log('✅ Asosiy printer:');
        console.log(stdout.trim());
    } catch (error) {
        console.error('❌ Asosiy printerni olishda xatolik:', error);
    }
    
    // Step 4: Create simple test and try direct print
    console.log('\n4. To\'g\'ridan-to\'g\'ri chop etish testi...');
    const simpleTest = 'TEST - PRINTER ISHLAYAPTI';
    const testFile = './simple-test.txt';
    fs.writeFileSync(testFile, simpleTest);
    
    console.log('Test fayli yaratildi, chop etishga urinilmoqda...');
    try {
        // Try different print methods
        console.log('Usul 1: Notepad orqali...');
        await execAsync(`notepad /p "${testFile}"`);
        console.log('✅ Notepad orqali chop etish buyrug\'i yuborildi');
        
        // Wait a bit then try alternative
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('Usul 2: PowerShell orqali...');
        try {
            await execAsync(`powershell -Command "Get-Content '${testFile}' | Out-Printer"`);
            console.log('✅ PowerShell orqali chop etish buyrug\'i yuborildi');
        } catch (error) {
            console.log('⚠️ PowerShell chop etish ishlamadi');
        }
        
    } catch (error) {
        console.error('❌ Chop etishda xatolik:', error);
    }
    
    console.log('\n🔍 Tekshirish uchun tavsiyalar:');
    console.log('1. Printerning yoniq va ulanganligini tekshiring');
    console.log('2. Qog\'oz va qora siyoh (kartrij) holatini tekshiring');
    console.log('3. Printer kabeli kompyuterga to\'g\'ri ulanganligini tekshiring');
    console.log('4. Windows > Sozlamalar > Qurilmalar > Printerlar va skanerlar oching');
    console.log('5. Printerni o\'chiring va 5 soniyadan keyin yana yoqing');
    console.log('6. Print Spooler xizmatini qayta ishga tushiring:');
    console.log('   - Windows + R bosing');
    console.log('   - services.msc yozing');
    console.log('   - Print Spooler topib, o\'ng tugmasi > Qayta ishga tushirish');
    
    console.log('\n✨ Diagnostika tugadi!');
}

// Run the diagnostic
diagnosePrinter().catch(console.error);
