const axios = require('axios');

// API base URL
const API_BASE = 'http://localhost:5001/api';

async function testOrders() {
  console.log('🧪 Buyurtmalar testi boshlanmoqda...\n');

  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@luxpetplast.uz',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login muvaffaqiyatli');

    // 1. Barcha buyurtmalarni olish
    console.log('\n📋 Barcha buyurtmalar yuklanmoqda...');
    const ordersResponse = await axios.get(
      `${API_BASE}/orders`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const orders = ordersResponse.data;
    console.log(`📊 Jami buyurtmalar: ${orders.length}`);

    if (orders.length > 0) {
      console.log('\n📋 Mavjud buyurtmalar:');
      orders.forEach((order, index) => {
        console.log(`   ${index + 1}. #${order.orderNumber || order.id} - ${order.customer?.name || 'N/A'}`);
        console.log(`      Status: ${order.status}`);
        console.log(`      Summa: $${order.totalAmount || 0}`);
        console.log(`      Sana: ${new Date(order.createdAt).toLocaleString('uz-UZ')}`);
        console.log(`      Mahsulotlar: ${order.items?.length || 0} ta`);
        if (order.items && order.items.length > 0) {
          order.items.forEach((item, itemIndex) => {
            console.log(`         ${itemIndex + 1}. ${item.product?.name} - ${item.quantity} qop - $${item.pricePerBag}/qop`);
          });
        }
        console.log('');
      });
    } else {
      console.log('ℹ️ Buyurtmalar yo\'q');
    }

    // 2. Buyurtma yaratish testi
    console.log('\n➕ Yangi buyurtma yaratish testi...');
    
    // Mahsulot va mijozlarni olish
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

    if (products.length > 0 && customers.length > 0) {
      const testProduct = products[0];
      const testCustomer = customers[0];

      console.log(`\n📋 Test mahsulot: ${testProduct.name}`);
      console.log(`👤 Test mijoz: ${testCustomer.name}`);

      const orderData = {
        customerId: testCustomer.id,
        items: [
          {
            productId: testProduct.id,
            quantityBags: 3, // 3 qop
            quantityUnits: 3 * (testProduct.unitsPerBag || 1000), // 3 qopdagi donalar
            pricePerBag: testProduct.pricePerBag || 25
          }
        ],
        deliveryAddress: 'Test manzil, Toshkent shahri',
        notes: 'Test buyurtma',
        status: 'PENDING',
        currency: 'USD',
        totalAmount: 3 * (testProduct.pricePerBag || 25)
      };

      try {
        const orderResponse = await axios.post(
          `${API_BASE}/orders`,
          orderData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log(`✅ Buyurtma muvaffaqiyatli yaratildi: ID ${orderResponse.data.order?.id || orderResponse.data.id}`);
        console.log(`   Summa: $${orderResponse.data.order?.totalAmount || orderResponse.data.totalAmount}`);
        console.log(`   Status: ${orderResponse.data.order?.status || orderResponse.data.status}`);
        console.log(`   Mijoz: ${orderResponse.data.order?.customer?.name || orderResponse.data.customer?.name}`);

        // Qayta yuklash
        const retryResponse = await axios.get(
          `${API_BASE}/orders`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        const retryOrders = retryResponse.data;
        console.log(`📊 Yangi buyurtmalar soni: ${retryOrders.length}`);

      } catch (error) {
        console.error('❌ Buyurtma yaratish xatosi:', error.response?.data || error.message);
        if (error.response?.data) {
          console.error('Xatolik tafsilotlari:', JSON.stringify(error.response.data, null, 2));
        }
      }

    } else {
      console.log('❌ Mahsulot yoki mijoz yo\'q, buyurtma yaratib bo\'lmaydi.');
    }

    // 3. Buyurtma statuslarini tekshirish
    console.log('\n📊 Buyurtma statuslari:');
    try {
      const statusResponse = await axios.get(
        `${API_BASE}/orders/stats`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const stats = statusResponse.data;
      console.log(`   Jami: ${stats.total || 0}`);
      console.log(`   Kutilayotgan: ${stats.pending || 0}`);
      console.log(`   Tasdiqlangan: ${stats.confirmed || 0}`);
      console.log(`   Yuborilgan: ${stats.shipped || 0}`);
      console.log(`   Yetkazilgan: ${stats.delivered || 0}`);
      console.log(`   Bekor qilingan: ${stats.cancelled || 0}`);

    } catch (error) {
      console.error('❌ Statistika xatosi:', error.response?.data || error.message);
    }

    // 4. Buyurtma yangilash testi
    if (orders.length > 0) {
      console.log('\n📝 Buyurtma yangilash testi...');
      const firstOrder = orders[0];
      
      try {
        const updateResponse = await axios.put(
          `${API_BASE}/orders/${firstOrder.id}/status`,
          {
            status: 'PROCESSING',
            notes: 'Test yangilash - ishlab chiqarilmoqda'
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log(`✅ Buyurtma yangilandi: ${updateResponse.data.status}`);
        console.log(`   Eski status: ${firstOrder.status}`);
        console.log(`   Yangi status: ${updateResponse.data.status}`);

      } catch (error) {
        console.error('❌ Buyurtma yangilash xatosi:', error.response?.data || error.message);
      }
    }

  } catch (error) {
    console.error('❌ Test xatolik:', error.response?.data || error.message);
  }
}

// Testni ishga tushirish
testOrders();
