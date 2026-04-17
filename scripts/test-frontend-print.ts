// Test frontend print functionality in browser
console.log('=== Frontend Print Test ===');

// Test 1: Check if printReceipt function exists
console.log('1. Checking printReceipt function...');
if (typeof window.printReceipt === 'function') {
  console.log('✅ printReceipt function exists');
} else {
  console.log('❌ printReceipt function does not exist');
}

// Test 2: Check if window.print works
console.log('2. Checking window.print...');
if (typeof window.print === 'function') {
  console.log('✅ window.print function exists');
} else {
  console.log('❌ window.print function does not exist');
}

// Test 3: Create test receipt data
console.log('3. Creating test receipt data...');
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

console.log('✅ Test receipt data created');

// Test 4: Try to print using window.print
console.log('4. Testing window.print...');
const printWindow = window.open('', '_blank', 'width=800,height=600');
if (printWindow) {
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
        Sana: ${testReceiptData.date}
      </div>
      <div style="margin-bottom: 10px;">
        Vaqt: ${testReceiptData.time}
      </div>
      <div>
        Bu test chekdiri. Agar ko'rinayotgan bo'lsa, print funksiyasi ishlamoqda.
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(testHTML);
  printWindow.document.close();
  
  setTimeout(() => {
    try {
      printWindow.print();
      console.log('✅ Print dialog opened');
      
      setTimeout(() => {
        printWindow.close();
      }, 2000);
    } catch (error) {
      console.log('❌ Print error:', error);
    }
  }, 1000);
} else {
  console.log('❌ Could not open print window');
}

console.log('=== Frontend Print Test Complete ===');
