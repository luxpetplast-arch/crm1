// 8cm (80mm) qog'oz test - Uzbek version
import { exec } from 'child_process';
import fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function test8cmPaper() {
    console.log('📏 8cm (80mm) qog\'oz testi boshlandi...\n');
    
    // Create 8cm width test (max 42 characters per line for 8cm paper)
    console.log('1. 8cm qog\'oz uchun test yaratish...');
    const cheque8cm = `
****************************************
*           LUX PET PLAST              *
*         TOSHKENT DO'KONI              *
****************************************
Sana: 15/03/2026  Vaqt: 13:43
Buyurtma: ORD-12345
Kassir: Admin
Mijoz: Test Mijoz
Tel: +998 90 123-45-67
----------------------------------------
Mahsulot              Soni Narx Jami
----------------------------------------
Plastik butilka 1.5L   3  12000 36000
Plastik qop 5kg       2  8000  16000
Plastik qop 10kg      1  15000 15000
Qadoq qop           10  1000  10000
----------------------------------------
Jami: 16 ta
Summa: 77000 so'm
To'lov: Naqd
To'langan: 77000 so'm
Qaytim: 0 so'm
----------------------------------------
Qo'shimcha xizmatlar:
* Qadoqlash bepul
* Yetkazib berish 2 kun
* Kafolat 1 oy
****************************************
FOYDALANUVCHI MA'LUMOTLARI:
Ism: Test Mijoz
Tel: +998 90 123-45-67
Manzil: Toshkent, Chilonzor
****************************************
XARIDINGIZ UCHUN RAHMAT!
Qaytib kelishingizni kutamiz!
****************************************
ID: SLS-1773563104883
15/03/2026, 13:43:25
****************************************
    `.trim();
    
    const testFile = './8cm-cheque-test.txt';
    fs.writeFileSync(testFile, cheque8cm, 'utf8');
    console.log('✅ 8cm test fayli yaratildi');
    
    // Print the test
    console.log('\n2. 8cm qog\'ozga chop etish...');
    try {
        await execAsync(`powershell -Command "Get-Content '${testFile}' | Out-Printer -Name 'Xprinter XP-365B'"`);
        console.log('✅ 8cm chop etish yuborildi');
    } catch (error) {
        console.error('❌ Chop etish xatolik:', error.message);
    }
    
    console.log('\n📄 Printerdan 8cm qog\'oz chiqishini tekshiring!');
    console.log('🎯 Qog\'oz to\'liq chiqishi kerak (42 harf enida)');
    
    console.log('\n📏 8cm qog\'oz xususiyatlari:');
    console.log('- Eni: 80mm (8cm)');
    console.log('- Maksimum belgilar: 42 ta per line');
    console.log('- Mahsulot nomi: 18 belgigacha');
    console.log('- Optimal font size: 12pt');
    
    console.log('\n✨ 8cm test tugadi!');
}

// Run the 8cm test
test8cmPaper().catch(console.error);
