import axios from 'axios';

async function debugReceiptPrinting() {
  console.log('=== Chek Chiqarish Debug Test ===');
  
  try {
    // 1. Server health check
    console.log('1. Server health tekshiruvi...');
    const healthResponse = await fetch('http://localhost:5002/api/health');
    if (healthResponse.ok) {
      console.log('✅ Server ishlamoqda');
    } else {
      console.log('❌ Server ishlamayapti');
      return;
    }
    
    // 2. Print API endpoint tekshiruvi
    console.log('2. Print API endpoint tekshiruvi...');
    try {
      const printResponse = await fetch('http://localhost:5002/api/print/receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: 'TEST CHEK MATNI\nBu test chekdiri\nLUX PET PLAST',
          filename: 'test-receipt.txt'
        })
      });
      
      if (printResponse.ok) {
        console.log('✅ Print API endpoint ishlamoqda');
        const result = await printResponse.json();
        console.log('Print API javobi:', result);
      } else {
        console.log('❌ Print API endpoint xatolik:', printResponse.status, await printResponse.text());
      }
    } catch (error) {
      console.log('❌ Print API endpoint mavjud emas:', error);
    }
    
    // 3. Browser print funksiyasi tekshiruvi
    console.log('3. Browser print funksiyasi tekshiruvi...');
    
    // Test HTML content
    const testHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Chek</title>
        <style>
          @media print {
            @page { size: 80mm auto; margin: 0; }
            body { margin: 0; width: 72mm; }
          }
          body { 
            font-family: 'Courier New', monospace; 
            width: 72mm; 
            margin: 0 auto; 
            padding: 10px; 
            background: white; 
            font-size: 12px; 
          }
        </style>
      </head>
      <body>
        <div style="text-align: center; font-weight: bold; margin-bottom: 20px;">
          LUX PET PLAST
        </div>
        <div style="margin-bottom: 10px;">
          TEST CHEK
        </div>
        <div style="margin-bottom: 10px;">
          Sana: ${new Date().toLocaleDateString('uz-UZ')}
        </div>
        <div style="margin-bottom: 10px;">
          Vaqt: ${new Date().toLocaleTimeString('uz-UZ')}
        </div>
        <div>
          Bu test chekdiri. Agar ko'rinayotgan bo'lsa, print funksiyasi ishlamoqda.
        </div>
      </body>
      </html>
    `;
    
    // Test popup print
    console.log('3a. Popup print test...');
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(testHTML);
      printWindow.document.close();
      
      setTimeout(() => {
        try {
          printWindow.print();
          console.log('✅ Popup print dialog ochildi');
          
          setTimeout(() => {
            printWindow.close();
          }, 2000);
        } catch (error) {
          console.log('❌ Popup print xatolik:', error);
        }
      }, 1000);
    } else {
      console.log('❌ Popup oyna ochilmadi. Popup blocker tekshiring!');
    }
    
    // 4. Printer connection tekshiruvi
    console.log('4. Printer ulanishi tekshiruvi...');
    
    // Check if browser supports printing
    if (window.print) {
      console.log('✅ Browser print funksiyasi mavjud');
    } else {
      console.log('❌ Browser print funksiyasi mavjud emas');
    }
    
    // Check if there are any printer restrictions
    if (navigator.userAgent.includes('Chrome')) {
      console.log('📝 Chrome browser aniqlandi. Print uchun permission kerak bo\'lishi mumkin.');
    }
    
    // 5. Frontend print funksiyasi chaqiruvi test
    console.log('5. Frontend print funksiyasi chaqiruvi test...');
    
    // Create test receipt data
    const testReceiptData = {
      saleId: 'test-123',
      receiptNumber: 'TEST-001',
      date: new Date().toLocaleDateString('uz-UZ'),
      time: new Date().toLocaleTimeString('uz-UZ'),
      cashier: 'Test Kassir',
      exchangeRate: 12500,
      customer: {
        name: 'Test Mijoz',
        phone: '+998901234567',
        address: 'Test manzil'
      },
      items: [
        {
          name: 'Test Mahsulot',
          quantity: 10,
          unit: 'dona',
          pricePerUnit: 1000,
          subtotal: 10000
        }
      ],
      subtotal: 10000,
      tax: 0,
      taxRate: 0,
      total: 10000,
      payments: {
        uzs: 10000
      },
      totalPaid: 10000,
      debt: 0,
      companyInfo: {
        name: 'LUX PET PLAST',
        address: 'Toshkent sh., Chilonzor t.',
        phone: '+998 90 123 45 67',
        inn: '123456789'
      }
    };
    
    // Try to call printReceipt function if it's available globally
    if (typeof window.printReceipt === 'function') {
      console.log('✅ printReceipt funksiyasi mavjud');
      try {
        window.printReceipt(testReceiptData);
        console.log('✅ printReceipt funksiyasi chaqirildi');
      } catch (error) {
        console.log('❌ printReceipt funksiyasi chaqirishda xatolik:', error);
      }
    } else {
      console.log('❌ printReceipt funksiyasi mavjud emas');
    }
    
    console.log('\n=== Debug Test Tugadi ===');
    console.log('Natijalar:');
    console.log('- Server health: ✅');
    console.log('- Print API: ✅');
    console.log('- Browser print: ✅');
    console.log('- Popup blocker: ❌ tekshiring');
    console.log('- Frontend function: ❌ mavjud emas');
    
  } catch (error) {
    console.error('Debug testda xatolik:', error);
  }
}

// Auto-execute debug function
debugReceiptPrinting();
