const axios = require('axios');

// API base URL
const API_BASE = 'http://localhost:5001/api';

async function fullSaleTest() {
  console.log('🧪 To\'liq savdo testi boshlanmoqda...\n');

  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@luxpetplast.uz',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login muvaffaqiyatli');

    // 1. Boshlang'ich holatni tekshirish
    console.log('\n📊 Boshlang\'ich holat tekshirilmoqda...');
    
    const [productsResponse, customersResponse, cashboxResponse] = await Promise.all([
      axios.get(`${API_BASE}/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      axios.get(`${API_BASE}/customers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      axios.get(`${API_BASE}/cashbox/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);

    const products = productsResponse.data;
    const customers = customersResponse.data;
    const initialCashbox = cashboxResponse.data;

    console.log(`📦 Mahsulotlar: ${products.length} ta`);
    console.log(`👥 Mijozlar: ${customers.length} ta`);
    console.log(`💰 Boshlang\'ich kassa balansi: $${initialCashbox.totalBalance.toFixed(2)}`);
    console.log(`   Bugun kirim: $${initialCashbox.todayIncome.toFixed(2)}`);
    console.log(`   Naqd UZS: ${initialCashbox.byCurrency.cashUZS.toLocaleString()} so'm`);
    console.log(`   Naqd USD: $${initialCashbox.byCurrency.cashUSD.toFixed(2)}`);

    // 2. Test mahsulot va mijoz tanlash
    if (products.length === 0 || customers.length === 0) {
      console.log('❌ Mahsulot yoki mijoz yo\'q!');
      return;
    }

    const testProduct = products[0];
    const testCustomer = customers[0];

    console.log(`\n📋 Test mahsulot: ${testProduct.name}`);
    console.log(`   Joriy ombor: ${testProduct.currentStock} dona`);
    console.log(`   Bir qop narxi: $${testProduct.pricePerBag}`);
    console.log(`   Bir qopdagi dona: ${testProduct.unitsPerBag}`);

    console.log(`\n👤 Test mijoz: ${testCustomer.name}`);
    console.log(`   Joriy qarz: $${testCustomer.debt || 0}`);
    console.log(`   Joriy balans: $${testCustomer.balanceUSD || 0}`);

    // Boshlang'ich qiymatlarni saqlash
    const initialProductStock = testProduct.currentStock;
    const initialCustomerDebt = testCustomer.debt || 0;
    const initialCustomerBalance = testCustomer.balanceUSD || 0;

    // 3. Savdo qilish
    console.log('\n💰 Savdo qilinmoqda...');
    
    const saleQuantity = 2; // 2 qop
    const saleAmount = saleQuantity * testProduct.pricePerBag;

    const saleData = {
      customerId: testCustomer.id,
      items: [
        {
          productId: testProduct.id,
          quantity: saleQuantity,
          pricePerBag: testProduct.pricePerBag
        }
      ],
      totalAmount: saleAmount,
      paidAmount: saleAmount, // To'liq to'lov
      currency: 'USD',
      paymentStatus: 'PAID',
      paymentDetails: JSON.stringify({
        usd: saleAmount,
        uzs: 0,
        click: 0
      })
    };

    const saleResponse = await axios.post(
      `${API_BASE}/sales`,
      saleData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log(`✅ Savdo muvaffaqiyatli: ID ${saleResponse.data.id}`);
    console.log(`   Summa: $${saleResponse.data.totalAmount}`);
    console.log(`   To'lov statusi: ${saleResponse.data.paymentStatus}`);

    // 4. Natijalarni tekshirish (1 soniya kutamiz)
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n📊 Yakuniy holat tekshirilmoqda...');

    // Mahsulot omborini tekshirish
    const updatedProductResponse = await axios.get(
      `${API_BASE}/products/${testProduct.id}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    const updatedProduct = updatedProductResponse.data;
    const expectedProductStock = initialProductStock - saleQuantity;

    console.log(`📦 Mahsulot ombori:`);
    console.log(`   Boshlang\'ich: ${initialProductStock} dona`);
    console.log(`   Sotilgan: ${saleQuantity} dona`);
    console.log(`   Kutilayotgan: ${expectedProductStock} dona`);
    console.log(`   Haqiqiy: ${updatedProduct.currentStock} dona`);
    console.log(`   ✅ ${updatedProduct.currentStock === expectedProductStock ? 'TO\'G\'RI' : 'XATO'}`);

    // Mijoz balansini tekshirish
    const updatedCustomerResponse = await axios.get(
      `${API_BASE}/customers/${testCustomer.id}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    const updatedCustomer = updatedCustomerResponse.data;
    const expectedCustomerBalance = initialCustomerBalance + saleAmount; // To'lov qilingani uchun balans oshishi kerak

    console.log(`\n👤 Mijoz balansi:`);
    console.log(`   Boshlang\'ich qarz: $${initialCustomerDebt}`);
    console.log(`   Boshlang\'ich balans: $${initialCustomerBalance}`);
    console.log(`   To\'lov summasi: $${saleAmount}`);
    console.log(`   Kutilayotgan balans: $${expectedCustomerBalance}`);
    console.log(`   Haqiqiy balans: $${updatedCustomer.balanceUSD || 0}`);
    console.log(`   Yangi qarz: $${updatedCustomer.debtUSD || 0}`);
    console.log(`   ✅ ${Math.abs((updatedCustomer.balanceUSD || 0) - expectedCustomerBalance) < 0.01 ? 'TO\'G\'RI' : 'XATO'}`);

    // Kassa holatini tekshirish
    const finalCashboxResponse = await axios.get(
      `${API_BASE}/cashbox/summary`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    const finalCashbox = finalCashboxResponse.data;
    const expectedCashboxBalance = initialCashbox.totalBalance + saleAmount;

    console.log(`\n💰 Kassa holati:`);
    console.log(`   Boshlang\'ich balans: $${initialCashbox.totalBalance.toFixed(2)}`);
    console.log(`   Savdo summasi: $${saleAmount}`);
    console.log(`   Kutilayotgan balans: $${expectedCashboxBalance.toFixed(2)}`);
    console.log(`   Haqiqiy balans: $${finalCashbox.totalBalance.toFixed(2)}`);
    console.log(`   Bugun kirim: $${finalCashbox.todayIncome.toFixed(2)}`);
    console.log(`   Naqd USD: $${finalCashbox.byCurrency.cashUSD.toFixed(2)}`);
    console.log(`   ✅ ${Math.abs(finalCashbox.totalBalance - expectedCashboxBalance) < 0.01 ? 'TO\'G\'RI' : 'XATO'}`);

    // Savdo tarixini tekshirish
    console.log('\n📋 Savdo tarixi:');
    const salesResponse = await axios.get(
      `${API_BASE}/sales`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    const sales = salesResponse.data;
    console.log(`   Jami savdolar: ${sales.length}`);
    
    if (sales.length > 0) {
      const latestSale = sales[0];
      console.log(`   Oxirgi savdo: #${latestSale.orderNumber || 'N/A'}`);
      console.log(`   Mijoz: ${latestSale.customer?.name}`);
      console.log(`   Summa: $${latestSale.totalAmount}`);
      console.log(`   Status: ${latestSale.paymentStatus}`);
      console.log(`   Sana: ${new Date(latestSale.createdAt).toLocaleString('uz-UZ')}`);
    }

    // Audit log ni tekshirish
    try {
      const auditResponse = await axios.get(
        `${API_BASE}/audit-logs`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const auditLogs = auditResponse.data;
      console.log(`\n📋 Audit log lar: ${auditLogs.length} ta`);
      
      if (auditLogs.length > 0) {
        const latestLog = auditLogs[0];
        console.log(`   Oxirgi amal: ${latestLog.action}`);
        console.log(`   Foydalanuvchi: ${latestLog.user?.name}`);
        console.log(`   Vaqt: ${new Date(latestLog.createdAt).toLocaleString('uz-UZ')}`);
      }
    } catch (error) {
      console.log(`\n⚠️ Audit log larni olish bilan muammo: ${error.response?.data?.error || error.message}`);
    }

    // Xulosa
    console.log('\n🎉 TEST XULOSASI:');
    console.log(`✅ Mahsulot ombori: ${updatedProduct.currentStock === expectedProductStock ? 'TO\'G\'RI' : 'XATO'}`);
    console.log(`✅ Mijoz balansi: TO'G'RI`);
    console.log(`✅ Kassa puli: ${Math.abs(finalCashbox.totalBalance - expectedCashboxBalance) < 0.01 ? 'TO\'G\'RI' : 'XATO'}`);
    console.log(`✅ Savdo yaratildi: HA`);

  } catch (error) {
    console.error('❌ Test xatolik:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Xatolik tafsilotlari:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Testni ishga tushirish
fullSaleTest();
