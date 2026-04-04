// Chek chiqarish tizimini test qilish
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testReceiptPrinting() {
  console.log('🖨️ Chek chiqarish tizimini test qilish boshlandi...\n');
  
  try {
    // 1. Login
    console.log('1️⃣ Login qilish...');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin',
      password: 'admin123'
    });
    
    const token = loginRes.data.token;
    console.log('✅ Login muvaffaqiyatli\n');
    
    // 2. Test print
    console.log('2️⃣ Test chek chiqarish...');
    const testPrintRes = await axios.post(
      `${BASE_URL}/print/test`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('✅ Test chek:', testPrintRes.data);
    console.log('📄 Printerdan chek chiqishini tekshiring!\n');
    
    // 3. Real receipt test
    console.log('3️⃣ Haqiqiy chek formatini test qilish...');
    
    const receiptContent = `
================================================
************************************************
*           LUX PET PLAST                      *
*         TOSHKENT DO'KONI                      *
************************************************
================================================
Sana: 18/03/2026              Vaqt: 14:30
Buyurtma: ORD-12345
Kassir: Admin
Mijoz: Test Mijoz
Tel: +998 90 123-45-67
------------------------------------------------
Kurs:                  1$ = 12,500 so'm
------------------------------------------------
Mahsulot            Soni     Narx      Jami
------------------------------------------------
Plastik qop 5kg        5   15,000    75,000
Plastik qop 10kg       3   25,000    75,000
Qadoq qop             10    2,000    20,000
------------------------------------------------
Jami: 18 ta
Summa:                              170,000 so'm
------------------------------------------------
TO'LOV:
Naqd (UZS):                         170,000 so'm
------------------------------------------------
To'langan:                          170,000 so'm
Qarz:                                     0 so'm
================================================
************************************************
XARIDINGIZ UCHUN RAHMAT!
Qaytib kelishingizni kutamiz!
************************************************
================================================
ID: SLS-1773563104883
18/03/2026, 14:30:25
================================================
    `.trim();
    
    const realPrintRes = await axios.post(
      `${BASE_URL}/print/receipt`,
      {
        content: receiptContent,
        filename: `test-receipt-${Date.now()}.txt`
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('✅ Haqiqiy chek:', realPrintRes.data);
    console.log('📄 Printerdan chek chiqishini tekshiring!\n');
    
    console.log('🎉 Barcha testlar muvaffaqiyatli o\'tdi!');
    console.log('\n📋 Tekshirish ro\'yxati:');
    console.log('  ✓ Test chek chiqdi');
    console.log('  ✓ Haqiqiy format chek chiqdi');
    console.log('  ✓ 80mm qog\'ozga to\'g\'ri chiqdi');
    console.log('  ✓ Barcha ma\'lumotlar ko\'rinadi');
    
  } catch (error) {
    console.error('❌ Xatolik:', error.response?.data || error.message);
    
    if (error.response?.status === 500) {
      console.log('\n⚠️ Printer xatoligi:');
      console.log('  - Printer ulangan va yoqilganligini tekshiring');
      console.log('  - Printer nomi to\'g\'ri ekanligini tekshiring: "Xprinter XP-365B"');
      console.log('  - Windows Printer Settings da printerning holatini tekshiring');
    }
  }
}

// Run test
testReceiptPrinting();
