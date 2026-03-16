// 80mm qog'oz test - Uzbek version
import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function test80mmPaper() {
    console.log('📏 80mm qog\'oz testi boshlandi...\n');
    
    // Create 80mm width test (max 48 characters per line)
    console.log('1. 80mm qog\'oz uchun test yaratish...');
    const cheque80mm = `
****************************************
*           LUX PET PLAST              *
*         TOSHKENT DO'KONI              *
****************************************
Sana: 15/03/2026  Vaqt: 13:28
Kassir: Admin      Mijoz: Mijoz
----------------------------------------
Mahsulot                Soni Narx Jami
----------------------------------------
Plastik butilka 1.5L     3  12000 36000
Plastik qop 5kg         2  8000  16000
Plastik qop 10kg        1  15000 15000
Qadoq qop              10  1000  10000
----------------------------------------
Jami tovarlar: 16 ta
Umumiy summa: 77000 so'm
Chegirma: 2000 so'm
To'lov: 75000 so'm
Naqd to'lov: 75000 so'm
Qaytim: 0 so'm
----------------------------------------
Qo'shimcha xizmatlar:
* Qadoqlash bepul
* Yetkazib berish 2 kun
****************************************
FOYDALANUVCHI MA'LUMOTLARI:
Ism: [Mijoz ismi]
Tel: [Telefon]
Manzil: [Yetkazib berish]
****************************************
XARIDINGIZ UCHUN RAHMAT!
Qaytib kelishingizni kutamiz!
****************************************
ID: CHK-1773563104883
Vaqt: 15/03/2026 13:28:45
****************************************
    `.trim();
    
    const testFile = './80mm-cheque-test.txt';
    fs.writeFileSync(testFile, cheque80mm, 'utf8');
    console.log('✅ 80mm test fayli yaratildi');
    
    // Print the test
    console.log('\n2. 80mm qog\'ozga chop etish...');
    try {
        await execAsync(`powershell -Command "Get-Content '${testFile}' | Out-Printer -Name 'Xprinter XP-365B'"`);
        console.log('✅ 80mm chop etish yuborildi');
    } catch (error) {
        console.error('❌ Chop etish xatolik:', error.message);
    }
    
    console.log('\n📄 Printerdan 80mm qog\'oz chiqishini tekshiring!');
    console.log('🎯 Qog\'oz to\'liq chiqishi kerak (48 harf enida)');
    
    console.log('\n✨ 80mm test tugadi!');
}

// Run the 80mm test
test80mmPaper().catch(console.error);