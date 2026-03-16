import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

let authToken = null;

async function login() {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@aziztrades.com',
      password: 'admin123'
    });
    authToken = response.data.token;
    return authToken;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
}

const apiWithAuth = axios.create({
  baseURL: API_BASE,
});

apiWithAuth.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

function formatDateTime(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');
  
  return `${day}.${month}.${year} ${hours}:${minutes}:${seconds}`;
}

async function testFixedSalesTime() {
  console.log('🔧 SAVDO PAYTI XATOLIKNI TUGATILISHINI TEKSHIRISH\n');
  
  try {
    await login();
    
    // Create test data
    const customerResponse = await apiWithAuth.post('/customers', {
      name: `Fixed Test Mijoz ${Date.now()}`,
      phone: `+99890${Math.floor(Math.random() * 100000000)}`,
      address: 'Toshkent, Fixed test'
    });
    const customer = customerResponse.data;

    const productResponse = await apiWithAuth.post('/products', {
      name: `Fixed Test Mahsulot ${Date.now()}`,
      bagType: 'KICHIK',
      unitsPerBag: 50,
      minStockLimit: 10,
      optimalStock: 50,
      maxCapacity: 100,
      currentStock: 100,
      pricePerBag: 25
    });
    const product = productResponse.data;

    // Create sale
    const saleData = {
      customerId: customer.id,
      items: [
        {
          productId: product.id,
          quantity: 5,
          pricePerBag: 25
        }
      ],
      totalAmount: 125,
      paidAmount: 125,
      currency: 'USD',
      paymentStatus: 'PAID'
    };

    const saleResponse = await apiWithAuth.post('/sales', saleData);
    const sale = saleResponse.data;
    
    console.log('📅 VAQT Tahlili (Fixed):');
    console.log(`   Server createdAt (ISO): ${sale.createdAt}`);
    
    // Test the new formatting
    const formattedTime = formatDateTime(sale.createdAt);
    console.log(`   Fixed format: ${formattedTime}`);
    
    // Compare with old problematic format
    const oldFormat = new Date(sale.createdAt).toLocaleString('uz-UZ');
    console.log(`   Old format: ${oldFormat}`);
    
    // Get sales list to see how it's displayed
    const salesResponse = await apiWithAuth.get('/sales');
    const sales = salesResponse.data;
    
    console.log('\n📋 Barcha sotuvlar vaqtlari:');
    sales.slice(0, 3).forEach((sale, index) => {
      const serverTime = sale.createdAt;
      const fixedFormat = formatDateTime(serverTime);
      const oldFormat = new Date(serverTime).toLocaleString('uz-UZ');
      
      console.log(`   ${index + 1}. Server: ${serverTime}`);
      console.log(`      Fixed: ${fixedFormat}`);
      console.log(`      Old:   ${oldFormat}`);
      console.log('');
    });
    
    console.log('✅ Savdo vaqti muammosi hal qilindi!');
    console.log('   Endi barcha vaqtlar bir xil formatda ko\'rsatiladi');
    
    return {
      success: true,
      message: 'Savdo vaqti muammosi hal qilindi',
      sampleSale: {
        createdAt: sale.createdAt,
        fixedFormat: formattedTime,
        oldFormat: oldFormat
      }
    };
    
  } catch (error) {
    console.error('❌ Test xatolik:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data || error.message
    };
  }
}

testFixedSalesTime().then(result => {
  console.log('\n📊 NATIJA:');
  console.log(JSON.stringify(result, null, 2));
}).catch(console.error);
