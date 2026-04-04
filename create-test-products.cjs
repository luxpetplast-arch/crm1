const axios = require('axios');

// API base URL
const API_BASE = 'http://localhost:5001/api';

async function createTestProducts() {
  console.log('🧪 Test mahsulotlar yaratilmoqda...\n');

  try {
    // Login
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@luxpetplast.uz',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login muvaffaqiyatli');

    // Test mahsulotlar
    const testProducts = [
      {
        name: '10gr OP',
        bagType: 'OP',
        unitsPerBag: 1000,
        pricePerBag: 20,
        minStockLimit: 50,
        optimalStock: 200,
        category: '10gr'
      },
      {
        name: '10gr Gidro',
        bagType: 'Gidro',
        unitsPerBag: 1000,
        pricePerBag: 22,
        minStockLimit: 50,
        optimalStock: 200,
        category: '10gr'
      },
      {
        name: '10gr Sayhun',
        bagType: 'Sayhun',
        unitsPerBag: 1000,
        pricePerBag: 21,
        minStockLimit: 50,
        optimalStock: 200,
        category: '10gr'
      },
      {
        name: '15gr OP',
        bagType: 'OP',
        unitsPerBag: 1000,
        pricePerBag: 25,
        minStockLimit: 50,
        optimalStock: 200,
        category: '15gr'
      },
      {
        name: '15gr Gidro',
        bagType: 'Gidro',
        unitsPerBag: 1000,
        pricePerBag: 27,
        minStockLimit: 50,
        optimalStock: 200,
        category: '15gr'
      },
      {
        name: '20gr OP',
        bagType: 'OP',
        unitsPerBag: 1000,
        pricePerBag: 30,
        minStockLimit: 50,
        optimalStock: 200,
        category: '20gr'
      },
      {
        name: '20gr Gidro',
        bagType: 'Gidro',
        unitsPerBag: 1000,
        pricePerBag: 32,
        minStockLimit: 50,
        optimalStock: 200,
        category: '20gr'
      }
    ];

    console.log(`📦 ${testProducts.length} ta test mahsulot yaratilmoqda...`);

    for (let i = 0; i < testProducts.length; i++) {
      const product = testProducts[i];
      
      try {
        const response = await axios.post(
          `${API_BASE}/products`,
          product,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log(`✅ ${i + 1}. ${product.name} yaratildi - ID: ${response.data.id}`);
        
        // Omborga test miqdorni qo'shish
        const stockData = {
          quantity: 100, // 100 qop
          notes: 'Test mahsulot - omborga qo\'shildi'
        };

        try {
          const stockResponse = await axios.post(
            `${API_BASE}/products/${response.data.id}/stock`,
            stockData,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          console.log(`   📦 Omborga 100 qop qo'shildi - Jami ombor: ${stockResponse.data.currentStock}`);

        } catch (stockError) {
          console.error(`   ❌ Omborga qo'shish xatosi:`, stockError.response?.data || stockError.message);
        }

      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
          console.log(`⚠️ ${i + 1}. ${product.name} allaqachon mavjud`);
        } else {
          console.error(`❌ ${i + 1}. ${product.name} yaratish xatosi:`, error.response?.data || error.message);
        }
      }
    }

    // Natijalarni tekshirish
    console.log('\n📊 Natijalarni tekshirish...');
    const productsResponse = await axios.get(
      `${API_BASE}/products`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const products = productsResponse.data;
    console.log(`📊 Jami mahsulotlar: ${products.length}`);

    // Guruhlash
    const groups = {};
    products.forEach(product => {
      const sizeMatch = product.name.match(/(\d+)gr/i);
      const size = sizeMatch ? `${sizeMatch[1]}gr` : 'Boshqa';
      
      if (!groups[size]) {
        groups[size] = [];
      }
      groups[size].push(product);
    });

    console.log('\n📋 Guruhlangan mahsulotlar:');
    Object.keys(groups).sort((a, b) => {
      const aNum = parseInt(a.replace('gr', ''));
      const bNum = parseInt(b.replace('gr', ''));
      return aNum - bNum;
    }).forEach(size => {
      const sizeProducts = groups[size];
      const totalStock = sizeProducts.reduce((sum, p) => sum + (p.currentStock || 0), 0);
      
      console.log(`\n📏 ${size} (${sizeProducts.length} tur, ${totalStock} qop):`);
      sizeProducts.forEach(product => {
        console.log(`   📦 ${product.name} - ${product.bagType} - ${product.currentStock || 0} qop - $${product.pricePerBag}/qop`);
      });
    });

    console.log('\n🎉 Test mahsulotlar muvaffaqiyatli yaratildi!');
    console.log('📱 Endi /products sahifasida guruhlangan ko\'rinishni ko\'rishingiz mumkin.');

  } catch (error) {
    console.error('❌ Test xatolik:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Xatolik tafsilotlari:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Testni ishga tushirish
createTestProducts();
