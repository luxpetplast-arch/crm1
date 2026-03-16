// Logo receipt test - Uzbek version
import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testLogoReceipt() {
    console.log('🎨 Logo li chek testi boshlandi...\n');
    
    // Create logo receipt test
    console.log('1. Logo li chek yaratish...');
    const logoReceipt = `${fs.readFileSync('./src/logo.txt', 'utf8')}
****************************************
Sana: 15/03/2026  Vaqt: 20:13
Buyurtma: ORD-88888
Kassir: Admin
========================================
MIJOZ MA'LUMOTLARI:
Ismi: Ali Valiyev
Telefon: +998 90 123-45-67
Manzil: Toshkent, Chilonzor tumani
Holati: VIP mijoz
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
To'lov turi: Qisman to'lov
To'langan: 200000 so'm
Qaytim: 0 so'm
========================================
MIJOZ QARZ HOLATI:
Joriy qarz: 150000 so'm
Bu sotuvdan keyin: 206000 so'm
Qarz sanalari: 10/02/2026, 25/02/2026, 15/03/2026
Balans: -50000 so'm
Chegirma limiti: 100000 so'm
========================================
Qo'shimcha xizmatlar:
* Qadoqlash bepul
* Yetkazib berish 2 kun
* Kafolat 1 oy
* Qarzga sotish mavjud
========================================
XARIDINGIZ UCHUN RAHMAT!
Qaytib kelishingizni kutamiz!
****************************************
ID: SLS-1773563104883
15/03/2026, 20:13:45
****************************************
    `.trim();
    
    const testFile = './logo-receipt-test.txt';
    fs.writeFileSync(testFile, logoReceipt, 'utf8');
    console.log('✅ Logo li chek fayli yaratildi');
    
    // Print the test
    console.log('\n2. Logo li chek chop etish...');
    try {
        await execAsync(`powershell -Command "Get-Content '${testFile}' | Out-Printer -Name 'Xprinter XP-365B'"`);
        console.log('✅ Logo li chek chop etish yuborildi');
    } catch (error) {
        console.error('❌ Chop etish xatolik:', error.message);
    }
    
    console.log('\n📄 Printerdan logo li chek chiqishini tekshiring!');
    console.log('🎯 Eng tepada kompaniya logosi va ASCII art bor');
    
    console.log('\n🎨 Logo li chek xususiyatlari:');
    console.log('- Eng tepada: Kompaniya logosi (ASCII art)');
    console.log('- Logo ostida: Kompaniya ma\'lumotlari');
    console.log('- Keyin: Sana, vaqt, buyurtma raqami');
    console.log('- Markazda: Mijoz ma\'lumotlari va mahsulotlar');
    console.log('- Pastda: Qarz holati va balans');
    
    console.log('\n✨ Logo li chek test tugadi!');
}

// Run the logo receipt test
testLogoReceipt().catch(console.error);
