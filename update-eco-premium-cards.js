// Ekologik va Premium kartlarni to'ldirish
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5003/api',
});

async function updateEcoPremiumCards() {
  let authToken = null;
  
  try {
    console.log('🌱 Ekologik va Premium kartlarini yangilash...');

    // Login
    console.log('\n🔐 Login qilinmoqda...');
    try {
      const loginRes = await api.post('/auth/login', {
        email: 'admin@luxpetplast.uz',
        password: 'admin123'
      });
      authToken = loginRes.data.token;
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      console.log('✅ Login muvaffaqiyatli');
    } catch (loginError) {
      console.log('⚠️ Login xatoligi, test token bilan davom etilmoqda...');
      api.defaults.headers.common['Authorization'] = 'Bearer test-token';
    }

    // 1. Ekologik kart uchun mahsulotlar
    console.log('\n🌱 Ekologik kart uchun yangi mahsulotlar yaratilmoqda...');
    
    const ecoProducts = [
      { name: '15g ECO Preform', bagType: '15G_ECO', unitsPerBag: 1000, pricePerBag: 27.00 },
      { name: '20g ECO Preform', bagType: '20G_ECO', unitsPerBag: 1000, pricePerBag: 30.00 },
      { name: '25g ECO Preform', bagType: '25G_ECO', unitsPerBag: 1000, pricePerBag: 34.00 },
      { name: 'Qayta ishlangan 5kg Qop', bagType: '5KG_RECYCLED', unitsPerBag: 1, pricePerBag: 18.00 },
      { name: 'Qayta ishlangan 10kg Qop', bagType: '10KG_RECYCLED', unitsPerBag: 1, pricePerBag: 28.00 },
      { name: 'ECO Qopqoq', bagType: 'ECO_CAP', unitsPerBag: 100, pricePerBag: 6.00 },
      { name: 'Ekologik Stiker', bagType: 'ECO_STICKER', unitsPerBag: 50, pricePerBag: 3.00 },
      { name: 'Biodegradable Paket', bagType: 'BIO_BAG', unitsPerBag: 200, pricePerBag: 8.00 }
    ];

    // 2. Premium kart uchun mahsulotlar
    console.log('\n⭐ Premium kart uchun yangi mahsulotlar yaratilmoqda...');
    
    const premiumProducts = [
      { name: '15g Premium Preform', bagType: '15G_PREMIUM', unitsPerBag: 1000, pricePerBag: 29.00 },
      { name: '20g Premium Preform', bagType: '20G_PREMIUM', unitsPerBag: 1000, pricePerBag: 33.00 },
      { name: '25g Premium Preform', bagType: '25G_PREMIUM', unitsPerBag: 1000, pricePerBag: 37.00 },
      { name: 'Premium 5kg Qop', bagType: '5KG_PREMIUM', unitsPerBag: 1, pricePerBag: 20.00 },
      { name: 'Premium 10kg Qop', bagType: '10KG_PREMIUM', unitsPerBag: 1, pricePerBag: 35.00 },
      { name: 'Premium Qopqoq', bagType: 'PREMIUM_CAP', unitsPerBag: 100, pricePerBag: 10.00 },
      { name: 'Brend Stiker', bagType: 'BRAND_STICKER', unitsPerBag: 50, pricePerBag: 4.00 },
      { name: 'Premium Etiketka', bagType: 'PREMIUM_LABEL', unitsPerBag: 100, pricePerBag: 5.00 },
      { name: 'Sifatli Paket', bagType: 'QUALITY_BAG', unitsPerBag: 150, pricePerBag: 12.00 }
    ];

    // Mahsulot turlarini olish
    const typesRes = await api.get('/product-types');
    const preformType = typesRes.data.find(t => t.name === 'Preform');
    const bagType = typesRes.data.find(t => t.name === 'Qop');
    const capType = typesRes.data.find(t => t.name === 'Qopqoq');
    const stickerType = typesRes.data.find(t => t.name === 'Stiker');
    const accessoryType = typesRes.data.find(t => t.name === 'Aksessuar');

    // Ekologik mahsulotlarni yaratish
    console.log('\n🌱 ECO mahsulotlari yaratilmoqda...');
    for (const product of ecoProducts) {
      let productTypeId = null;
      
      // Mahsulot turini aniqlash
      if (product.name.toLowerCase().includes('preform')) {
        productTypeId = preformType?.id;
      } else if (product.name.toLowerCase().includes('qop')) {
        productTypeId = bagType?.id;
      } else if (product.name.toLowerCase().includes('qopqoq')) {
        productTypeId = capType?.id;
      } else if (product.name.toLowerCase().includes('stiker') || product.name.toLowerCase().includes('etiketka')) {
        productTypeId = stickerType?.id;
      } else {
        productTypeId = accessoryType?.id;
      }

      const productData = {
        name: product.name,
        bagType: product.bagType,
        unitsPerBag: product.unitsPerBag,
        minStockLimit: 50,
        optimalStock: 200,
        maxCapacity: 1000,
        currentStock: 100,
        pricePerBag: product.pricePerBag,
        productionCost: product.pricePerBag * 0.7,
        isParent: false,
        productTypeId: productTypeId,
        active: true
      };

      try {
        const productRes = await api.post('/products', productData);
        console.log(`✅ ECO mahsulot yaratildi: ${productRes.data.name}`);
      } catch (error) {
        console.log(`❌ ${product.name} yaratish xatoligi:`, error.response?.data?.error || error.message);
      }
    }

    // Premium mahsulotlarni yaratish
    console.log('\n⭐ Premium mahsulotlari yaratilmoqda...');
    for (const product of premiumProducts) {
      let productTypeId = null;
      
      // Mahsulot turini aniqlash
      if (product.name.toLowerCase().includes('preform')) {
        productTypeId = preformType?.id;
      } else if (product.name.toLowerCase().includes('qop')) {
        productTypeId = bagType?.id;
      } else if (product.name.toLowerCase().includes('qopqoq')) {
        productTypeId = capType?.id;
      } else if (product.name.toLowerCase().includes('stiker') || product.name.toLowerCase().includes('etiketka')) {
        productTypeId = stickerType?.id;
      } else {
        productTypeId = accessoryType?.id;
      }

      const productData = {
        name: product.name,
        bagType: product.bagType,
        unitsPerBag: product.unitsPerBag,
        minStockLimit: 50,
        optimalStock: 200,
        maxCapacity: 1000,
        currentStock: 100,
        pricePerBag: product.pricePerBag,
        productionCost: product.pricePerBag * 0.65,
        isParent: false,
        productTypeId: productTypeId,
        active: true
      };

      try {
        const productRes = await api.post('/products', productData);
        console.log(`✅ Premium mahsulot yaratildi: ${productRes.data.name}`);
      } catch (error) {
        console.log(`❌ ${product.name} yaratish xatoligi:`, error.response?.data?.error || error.message);
      }
    }

    // 3. Kartlarni ko'rish
    console.log('\n🃏 Kartlar holati:');
    const cardsRes = await api.get('/cards');
    cardsRes.data.forEach(card => {
      console.log(`🃏 ${card.name}: ${card.productCount} mahsulot, narxi: $${card.price}`);
    });

    console.log('\n🎉 Ekologik va Premium kartlar muvaffaqiyatli yangilandi!');

  } catch (error) {
    console.error('❌ Xatolik:', error.response?.data || error.message);
  }
}

updateEcoPremiumCards();
