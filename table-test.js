// Table format test - Uzbek version
import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testTableFormat() {
    console.log('📋 Jadval formatli test boshlandi...\n');
    
    // Create table format test
    console.log('1. Jadval formatli test yaratish...');
    const tableReceipt = `
****************************************
*           LUX PET PLAST              *
*         TOSHKENT DO'KONI              *
****************************************
Sana: 15/03/2026  Vaqt: 20:09
Buyurtma: ORD-67890
Kassir: Admin
Mijoz: Test Mijoz
Tel: +998 90 123-45-67
========================================
+------------------+----+-----+--------+
| Mahsulot         | Qop| Narx| Jami   |
+------------------+----+-----+--------+
| Plastik butilka   |  3 |12000|  36000|
| Plastik qop 5kg  |  2 | 8000|  16000|
| Plastik qop 10kg |  1 |15000|  15000|
| Qadoq qop        | 10 | 1000|  10000|
| Katta qop 25kg   |  5 |25000| 125000|
| Orta qop 15kg    |  3 |18000|  54000|
+------------------+----+-----+--------+
Jami mahsulotlar: 6 ta
Umumiy summa: 256000 so'm
To'lov turi: Naqd
To'langan: 256000 so'm
Qaytim: 0 so'm
========================================
Qo'shimcha xizmatlar:
* Qadoqlash bepul
* Yetkazib berish 2 kun
* Kafolat 1 oy
========================================
FOYDALANUVCHI MA'LUMOTLARI:
Ism: Test Mijoz
Tel: +998 90 123-45-67
Manzil: Toshkent, Chilonzor
========================================
XARIDINGIZ UCHUN RAHMAT!
Qaytib kelishingizni kutamiz!
****************************************
ID: SLS-1773563104883
15/03/2026, 20:09:45
****************************************
    `.trim();
    
    const testFile = './table-cheque-test.txt';
    fs.writeFileSync(testFile, tableReceipt, 'utf8');
    console.log('✅ Jadval test fayli yaratildi');
    
    // Print the test
    console.log('\n2. Jadval formatli chop etish...');
    try {
        await execAsync(`powershell -Command "Get-Content '${testFile}' | Out-Printer -Name 'Xprinter XP-365B'"`);
        console.log('✅ Jadval chop etish yuborildi');
    } catch (error) {
        console.error('❌ Chop etish xatolik:', error.message);
    }
    
    console.log('\n📄 Printerdan jadval formatli chek chiqishini tekshiring!');
    console.log('🎯 Har bir mahsulot alohida qatorda, tortburchak ichida');
    
    console.log('\n📋 Jadval formati xususiyatlari:');
    console.log('- Mahsulot nomi: 16 belgi');
    console.log('- Qop soni: 2 belgi');
    console.log('- Narxi: 4 belgi');
    console.log('- Jami: 6 belgi');
    console.log('- Eni: 40 belgi (8cm uchun optimal)');
    
    console.log('\n✨ Jadval test tugadi!');
}

// Run the table test
testTableFormat().catch(console.error);
