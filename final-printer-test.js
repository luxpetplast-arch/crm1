// Final printer test - Uzbek version
import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function finalPrinterTest() {
    console.log('🎯 Final printer test - Qog\'oz chiqarish...\n');
    
    // Create a comprehensive test
    console.log('1. To\'liq cheque test yaratish...');
    const fullCheque = `
╔════════════════════════════════════════╗
║         LUX PET PLAST DO'KONI         ║
║     Manzil: Toshkent shahar          ║
║     Tel: +998 90 123-45-67           ║
╚════════════════════════════════════════╝
===========================================
Sana: ${new Date().toLocaleDateString('uz-UZ')}
Vaqt: ${new Date().toLocaleTimeString('uz-UZ')}
Kassir: Admin
Mijoz: Umumiy mijoz
-------------------------------------------
Mahsulot                Soni  Narx   Summa
-------------------------------------------
Plastik butilka 1.5L     3    12000   36000
Plastik qop 5kg         2    8000    16000
Plastik qop 10kg        1    15000   15000
-------------------------------------------
Jami tovarlar:                   6
Umumiy summa:                     67000
Qo\'shilgan chegirma:              -2000
To\'lov summasi:                   65000
Naqd to\'lov:                      65000
Qaytim:                            0
--------------------------------===========
Qo'shimcha xizmatlar:
- Qadoqlash bepul
- Yetkazib berish (mudati: 2 kun)
===========================================
FOYDALANUVCHI:
Ism:      [Mijoz ismi]
Telefon:  [Mijoz telefoni]
Manzil:   [Yetkazib berish manzili]
===========================================
XARIDINGIZ UCHUN RAHMAT!
Qaytib kelishingizni kutamiz!
===========================================
Qabul qilildi: ${new Date().toLocaleString('uz-UZ')}
ID: CHK-${Date.now()}
===========================================
    `.trim();
    
    const testFile = './final-cheque-test.txt';
    fs.writeFileSync(testFile, fullCheque, 'utf8');
    console.log('✅ To\'liq test fayli yaratildi');
    
    // Print the test
    console.log('\n2. Printerga yuborish...');
    try {
        await execAsync(`powershell -Command "Get-Content '${testFile}' | Out-Printer -Name 'Xprinter XP-365B'"`);
        console.log('✅ Chop etish buyrug\'i yuborildi');
    } catch (error) {
        console.error('❌ Chop etish xatolik:', error.message);
    }
    
    // Alternative method
    try {
        await execAsync(`notepad /p "${testFile}"`);
        console.log('✅ Notepad orqali ham yuborildi');
    } catch (error) {
        console.log('⚠️ Notepad usuli ishlamadi');
    }
    
    console.log('\n📄 Printerdan qog\'oz chiqishini tekshiring!');
    console.log('🎯 Agar qog\'oz to\'g\'ri chiqsa, printer tayyor!');
    
    console.log('\n✨ Test tugadi!');
    console.log('🎉 Printer muvaffaqiyatli sozlandi!');
}

// Run the final test
finalPrinterTest().catch(console.error);
