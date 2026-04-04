const axios = require('axios');

// API base URL
const API_BASE = 'http://localhost:5001/api';

async function testAuditLogs() {
  console.log('🧪 Audit logs testi boshlanmoqda...\n');

  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@luxpetplast.uz',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login muvaffaqiyatli');

    // 1. Audit log larni olish
    console.log('\n📋 Audit log larni yuklanmoqda...');
    try {
      const auditResponse = await axios.get(
        `${API_BASE}/audit-logs`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const auditLogs = auditResponse.data;
      console.log(`📊 Jami audit log lar: ${auditLogs.length}`);

      if (auditLogs.length > 0) {
        console.log('📋 Oxirgi audit log lar:');
        auditLogs.slice(0, 5).forEach((log, index) => {
          console.log(`   ${index + 1}. ${log.action} - ${log.user?.name || 'Unknown'} - ${new Date(log.createdAt).toLocaleString('uz-UZ')}`);
          console.log(`      Entity: ${log.entityId} | IP: ${log.ipAddress || 'N/A'}`);
        });
      } else {
        console.log('ℹ️ Audit log lar yo\'q. Bu normal, chunki audit loglar faqat muhim amallar uchun yoziladi.');
      }

    } catch (error) {
      console.error('❌ Audit log larni olish xatosi:', error.response?.data || error.message);
      if (error.response?.status === 403) {
        console.log('⚠️ Siz admin emassiz, audit log larni ko\'ra olmaysiz.');
      }
    }

    // 2. Sotuv yaratib audit log ni tekshirish
    console.log('\n💰 Sotuv yaratib audit log ni tekshiramiz...');
    
    // Mahsulot va mijoz olish
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

    if (products.length > 0 && customers.length > 0) {
      const testProduct = products[0];
      const testCustomer = customers[0];

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

        console.log(`✅ Sotuv yaratildi: ID ${saleResponse.data.id}`);

        // Audit log larni qayta tekshirish
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 soniya kutamiz

        const auditResponse2 = await axios.get(
          `${API_BASE}/audit-logs`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        const newAuditLogs = auditResponse2.data;
        console.log(`📊 Yangi audit log lar soni: ${newAuditLogs.length}`);

        if (newAuditLogs.length > 0) {
          console.log('📋 Oxirgi audit log (sotuv yaratilgandan keyin):');
          const latestLog = newAuditLogs[0];
          console.log(`   Action: ${latestLog.action}`);
          console.log(`   User: ${latestLog.user?.name}`);
          console.log(`   Entity: ${latestLog.entityId}`);
          console.log(`   Time: ${new Date(latestLog.createdAt).toLocaleString('uz-UZ')}`);
          
          if (latestLog.details) {
            console.log(`   Details: ${JSON.stringify(latestLog.details, null, 2)}`);
          }
        }

      } catch (error) {
        console.error('❌ Sotuv yaratish xatosi:', error.response?.data || error.message);
      }

    } else {
      console.log('❌ Mahsulot yoki mijoz yo\'q, audit log testini o\'tkazib bo\'lmaydi.');
    }

  } catch (error) {
    console.error('❌ Test xatolik:', error.response?.data || error.message);
  }
}

// Testni ishga tushirish
testAuditLogs();
