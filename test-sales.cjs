const axios = require('axios');

// API base URL
const API_BASE = 'http://localhost:5001/api';

async function testSales() {
  console.log('🧪 Sotuvlar testi boshlanmoqda...\n');

  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@luxpetplast.uz',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login muvaffaqiyatli');

    // 1. Sotuvlarni olish
    console.log('\n💰 Sotuvlar yuklanmoqda...');
    const salesResponse = await axios.get(
      `${API_BASE}/sales`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const sales = salesResponse.data;
    console.log(`📊 Jami sotuvlar: ${sales.length}`);

    if (sales.length === 0) {
      console.log('❌ Sotuvlar yo\'q! Test sotuv yaratamiz...');
      
      // Avval mahsulot va mijoz borligini tekshiramiz
      const [productsResponse, customersResponse] = await Promise.all([
        axios.get(`${API_BASE}/products`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get(`${API_BASE}/customers`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const products = productsResponse.data;
      const customers = customersResponse.data;

      console.log(`📦 Mahsulotlar: ${products.length} ta`);
      console.log(`👥 Mijozlar: ${customers.length} ta`);

      if (products.length === 0) {
        console.log('❌ Mahsulotlar yo\'q! Avval mahsulot qo\'shing.');
        return;
      }

      if (customers.length === 0) {
        console.log('❌ Mijozlar yo\'q! Avval mijoz qo\'shing.');
        return;
      }

      // Test sotuv yaratish
      const testProduct = products[0];
      const testCustomer = customers[0];

      console.log(`📋 Test mahsulot: ${testProduct.name}`);
      console.log(`👤 Test mijoz: ${testCustomer.name}`);

      const saleData = {
        customerId: testCustomer.id,
        items: [
          {
            productId: testProduct.id,
            quantity: 1,
            pricePerBag: testProduct.pricePerBag || 25
          }
        ],
        totalAmount: testProduct.pricePerBag || 25,
        paidAmount: testProduct.pricePerBag || 25,
        currency: 'USD',
        paymentStatus: 'PAID',
        paymentDetails: JSON.stringify({
          usd: testProduct.pricePerBag || 25,
          uzs: 0,
          click: 0
        })
      };

      try {
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

        console.log(`✅ Sotuv muvaffaqiyatli yaratildi: ID ${saleResponse.data.id}`);
        console.log(`   Summa: $${saleResponse.data.totalAmount}`);
        console.log(`   Mijoz: ${saleResponse.data.customer?.name}`);
        console.log(`   Status: ${saleResponse.data.paymentStatus}`);

        // Qayta yuklash
        const retryResponse = await axios.get(
          `${API_BASE}/sales`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        const retrySales = retryResponse.data;
        console.log(`📊 Yangi sotuvlar soni: ${retrySales.length}`);

      } catch (error) {
        console.error('❌ Sotuv yaratish xatosi:', error.response?.data || error.message);
        if (error.response?.data) {
          console.error('Xatolik tafsilotlari:', JSON.stringify(error.response.data, null, 2));
        }
      }

    } else {
      console.log('📋 Mavjud sotuvlar:');
      sales.forEach((sale, index) => {
        console.log(`   ${index + 1}. #${sale.orderNumber || 'N/A'} - ${sale.customer?.name || 'N/A'} - $${sale.totalAmount || 0} - ${sale.paymentStatus}`);
        console.log(`      Sana: ${new Date(sale.createdAt).toLocaleString('uz-UZ')}`);
        console.log(`      Mahsulotlar: ${sale.items?.length || 0} ta`);
      });
    }

    // 2. Sotuvlar statistikasi
    console.log('\n📈 Sotuvlar statistikasi:');
    try {
      const statsResponse = await axios.get(
        `${API_BASE}/sales/stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const stats = statsResponse.data;
      console.log(`   Bugun: ${stats.today?.count || 0} ta sotuv`);
      console.log(`   Jami summa: $${stats.total?.amount || 0}`);
      console.log(`   O'rtacha summa: $${stats.average || 0}`);

    } catch (error) {
      console.error('❌ Statistika xatosi:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Test xatolik:', error.response?.data || error.message);
  }
}

// Testni ishga tushirish
testSales();
