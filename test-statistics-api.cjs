const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Login qilish
async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    return response.data.token;
  } catch (error) {
    console.error('❌ Login xatolik:', error.message);
    return null;
  }
}

// Statistika olish
async function testStatistics() {
  console.log('🧪 STATISTIKA API TEST\n');
  
  const token = await login();
  if (!token) {
    console.log('❌ Login muvaffaqiyatsiz');
    return;
  }
  
  console.log('✅ Login muvaffaqiyatli\n');
  
  try {
    console.log('📊 Statistika yuklanmoqda...');
    const response = await axios.get(`${API_URL}/statistics/comprehensive?days=30`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Statistika muvaffaqiyatli yuklandi!\n');
    console.log('📈 UMUMIY KO\'RSATKICHLAR:');
    console.log('  Daromad:', response.data.overview?.totalRevenue || 0);
    console.log('  Foyda:', response.data.overview?.netProfit || 0);
    console.log('  Sotuvlar:', response.data.overview?.totalOrders || 0);
    console.log('  Mijozlar:', response.data.overview?.totalCustomers || 0);
    
    console.log('\n📦 MAHSULOTLAR:');
    console.log('  Top mahsulotlar:', response.data.products?.topSelling?.length || 0);
    console.log('  Tez ketayotgan:', response.data.products?.fastMoving?.length || 0);
    console.log('  Sekin ketayotgan:', response.data.products?.slowMoving?.length || 0);
    
    console.log('\n👥 MIJOZLAR:');
    console.log('  Jami:', response.data.customers?.total || 0);
    console.log('  Faol:', response.data.customers?.active || 0);
    console.log('  Yangi:', response.data.customers?.new || 0);
    console.log('  VIP:', response.data.customers?.vip || 0);
    
    console.log('\n💰 MOLIYAVIY:');
    console.log('  Daromad:', response.data.financial?.totalRevenue || 0);
    console.log('  Xarajatlar:', response.data.financial?.totalExpenses || 0);
    console.log('  Foyda:', response.data.financial?.netProfit || 0);
    console.log('  Foyda marjasi:', response.data.financial?.profitMargin?.toFixed(1) || 0, '%');
    
    console.log('\n📊 TRENDLAR:');
    console.log('  Kunlik ma\'lumotlar:', response.data.trends?.daily?.length || 0, 'kun');
    
    console.log('\n✅ TEST MUVAFFAQIYATLI!');
    
  } catch (error) {
    console.error('\n❌ XATOLIK:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      console.log('\n⚠️ Endpoint topilmadi. Server ishga tushganmi?');
    }
  }
}

testStatistics();
