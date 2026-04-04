const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addPreformProducts() {
  try {
    // 15mg liq preformalar uchun mahsulot variantlari
    const preformProducts = [
      // Qora rangli variantlar
      { name: '15mg Qora Preform', bagType: '15mg-QORA', unitsPerBag: 100, pricePerBag: 15, minStock: 100, optimalStock: 500, maxCapacity: 1000 },
      { name: '15mg Qora Preform (Sprite)', bagType: '15mg-QORA-SPRITE', unitsPerBag: 100, pricePerBag: 18, minStock: 100, optimalStock: 500, maxCapacity: 1000 },
      { name: '15mg Qora Preform (Fanta)', bagType: '15mg-QORA-FANTA', unitsPerBag: 100, pricePerBag: 18, minStock: 100, optimalStock: 500, maxCapacity: 1000 },
      
      // Oq rangli variantlar
      { name: '15mg Oq Preform', bagType: '15mg-OQ', unitsPerBag: 100, pricePerBag: 15, minStock: 100, optimalStock: 500, maxCapacity: 1000 },
      { name: '15mg Oq Preform (Sprite)', bagType: '15mg-OQ-SPRITE', unitsPerBag: 100, pricePerBag: 18, minStock: 100, optimalStock: 500, maxCapacity: 1000 },
      { name: '15mg Oq Preform (Fanta)', bagType: '15mg-OQ-FANTA', unitsPerBag: 100, pricePerBag: 18, minStock: 100, optimalStock: 500, maxCapacity: 1000 },
      
      // Shaffof rangli variantlar
      { name: '15mg Shaffof Preform', bagType: '15mg-SHAFFOF', unitsPerBag: 100, pricePerBag: 15, minStock: 100, optimalStock: 500, maxCapacity: 1000 },
      { name: '15mg Shaffof Preform (Sprite)', bagType: '15mg-SHAFFOF-SPRITE', unitsPerBag: 100, pricePerBag: 18, minStock: 100, optimalStock: 500, maxCapacity: 1000 },
      { name: '15mg Shaffof Preform (Fanta)', bagType: '15mg-SHAFFOF-FANTA', unitsPerBag: 100, pricePerBag: 18, minStock: 100, optimalStock: 500, maxCapacity: 1000 }
    ];

    console.log('🏭 15mg liq preformalar qo\'shilmoqda...');

    for (const productData of preformProducts) {
      try {
        const product = await prisma.product.create({
          data: {
            name: productData.name,
            bagType: productData.bagType,
            unitsPerBag: productData.unitsPerBag,
            minStockLimit: productData.minStock,
            optimalStock: productData.optimalStock,
            maxCapacity: productData.maxCapacity,
            currentStock: Math.floor(Math.random() * 200) + 100, // Random stock between 100-300
            pricePerBag: productData.pricePerBag,
            productionCost: productData.pricePerBag * 0.6 // 60% of price is production cost
          }
        });

        console.log(`✅ ${productData.name} (${productData.bagType}) qo\'shildi - Stock: ${product.currentStock}`);
      } catch (error) {
        console.error(`❌ ${productData.name} qo\'shishda xatolik:`, error);
      }
    }

    console.log('🎉 Barcha 15mg liq preformalar muvaffaqiyatli qo\'shildi!');
    console.log('📊 Jami:', preformProducts.length, 'ta mahsulot');
    console.log('🎨 Ranglar: Qora (3ta), Oq (3ta), Shaffof (3ta)');
    console.log('🥤 Ichimliklar: Sprite (3ta), Fanta (3ta)');
    
  } catch (error) {
    console.error('Xatolik yuz berdi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addPreformProducts();
