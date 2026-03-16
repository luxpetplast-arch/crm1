// Driver installation check - Uzbek version
import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function checkPrinterDriver() {
    console.log('🔍 Printer driver tekshiruvi boshlandi...\n');
    
    // Step 1: Check if Xprinter driver is properly installed
    console.log('1. Xprinter XP-365B driver holatini tekshirish...');
    try {
        const { stdout } = await execAsync('powershell -Command "Get-WmiObject -Class Win32_PrinterDriver | Where-Object {$_.Name -like \"*Xprinter*\"} | Select-Object Name, DriverPath, DriverVersion, SupportedPlatform"');
        console.log('✅ Xprinter driver ma\'lumotlari:');
        console.log(stdout);
    } catch (error) {
        console.error('❌ Driver ma\'lumotlarini olishda xatolik:', error.message);
    }
    
    // Step 2: Check all installed printer drivers
    console.log('\n2. Barcha o\'rnatilgan printer driverlar...');
    try {
        const { stdout } = await execAsync('powershell -Command "Get-WmiObject -Class Win32_PrinterDriver | Select-Object Name, DriverVersion | Format-Table -AutoSize"');
        console.log('✅ Barcha driverlar:');
        console.log(stdout);
    } catch (error) {
        console.error('❌ Driverlar ro\'yxatini olishda xatolik:', error.message);
    }
    
    // Step 3: Check printer properties and driver details
    console.log('\n3. Xprinter XP-365B xususiyatlari va driver tafsilotlari...');
    try {
        const { stdout } = await execAsync('powershell -Command "Get-Printer -Name \'Xprinter XP-365B\' | Select-Object Name, DriverName, DriverVersion, PortName, Shared, Published"');
        console.log('✅ Printer xususiyatlari:');
        console.log(stdout);
    } catch (error) {
        console.error('❌ Printer xususiyatlarini olishda xatolik:', error.message);
    }
    
    // Step 4: Check if driver files exist
    console.log('\n4. Driver fayllarining mavjudligini tekshirish...');
    try {
        const { stdout } = await execAsync('powershell -Command "Get-Printer -Name \'Xprinter XP-365B\' | Select-Object -ExpandProperty DriverName"');
        const driverName = stdout.trim();
        console.log(`Driver nomi: ${driverName}`);
        
        // Check Windows driver store
        const { stdout: driverStore } = await execAsync('powershell -Command "Get-ChildItem -Path \"$env:windir\\System32\\DriverStore\\FileRepository\" -Recurse -Filter \"*printer*\" | Select-Object Name, FullName | Format-Table -AutoSize"');
        console.log('✅ Driver fayllari ombori:');
        console.log(driverStore);
        
    } catch (error) {
        console.error('❌ Driver fayllarini tekshirishda xatolik:', error.message);
    }
    
    // Step 5: Check for driver issues in Device Manager
    console.log('\n5. Qurilma menejerida printer holatini tekshirish...');
    try {
        const { stdout } = await execAsync('powershell -Command "Get-PnpDevice -Class \'Printer\' | Where-Object {$_.FriendlyName -like \"*Xprinter*\"} | Select-Object FriendlyName, Status, ProblemCode"');
        console.log('✅ Qurilma menejer holati:');
        console.log(stdout);
    } catch (error) {
        console.log('⚠️ Qurilma menejerini tekshirib bo\'lmadi');
    }
    
    // Step 6: Try to reinstall driver automatically
    console.log('\n6. Driver qayta o\'rnatish imkoniyatini tekshirish...');
    try {
        console.log('Avval printerni olib tashlaymiz...');
        await execAsync('powershell -Command "Remove-Printer -Name \'Xprinter XP-365B\' -ErrorAction SilentlyContinue"');
        
        console.log('Keyin qayta qo\'shamiz...');
        await execAsync('powershell -Command "Add-Printer -Name \'Xprinter XP-365B\' -DriverName \'Xprinter XP-365B\' -PortName \'USB001\'"');
        console.log('✅ Printer qayta qo\'shildi');
        
    } catch (error) {
        console.error('❌ Driver qayta o\'rnatishda xatolik:', error.message);
        console.log('⚠️ Driver qo\'lda o\'rnatish kerak bo\'lishi mumkin');
    }
    
    console.log('\n🔧 Driver o\'rnatish uchun tavsiyalar:');
    console.log('1. Xprinter rasmiy saytidan driver yuklab oling');
    console.log('2. Windows + R > devmgmt.msc > Printerlar > Xprinter > Driver yangilash');
    console.log('3. Driver faylini o\'ng tugmasi > "Qurilmani olib tashlash"');
    console.log('4. Kompyuterni qayta ishga tushiring');
    console.log('5. Driver o\'rnatish faylini oching > Administrator sifatida ishga tushiring');
    console.log('6. Printer ulang > Windows driver avtop topishi kerak');
    
    console.log('\n🌐 Xprinter driver yuklash manzillari:');
    console.log('- Rasmiy sayt: xprinter.com.cn');
    console.log('- XP-365B modeli uchun driver');
    console.log('- Windows 10/11 64-bit versiyasi');
    
    console.log('\n✨ Driver tekshiruvi tugadi!');
}

// Run the driver check
checkPrinterDriver().catch(console.error);
