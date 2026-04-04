const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function add8mmPreforms() {
  try {
    // 8mm liq preformalar uchun mahsulotlar
    const preformProducts = [
      // 8mm Preform - Shaffof rangli
      { name: '8mm Shaffof Preform', bagType: '8mm-SHAFFOF', unitsPerBag: 200, pricePerBag: 12, minStock: 50, optimalStock: 300, maxCapacity: 800 },
      { name: '8mm Shaffof Preform (Sprite)', bagType: '8mm-SHAFFOF-SPRITE', unitsPerBag: 200, pricePerBag: 15, minStock: 50, optimalStock: 300, maxCapacity: 800 },
      { name: '8mm Shaffof Preform (Fanta)', bagType: '8mm-SHAFFOF-FANTA', unitsPerBag: 200, pricePerBag: 15, minStock: 50, optimalStock: 300, maxCapacity: 800 },
      
      // 8mm Preform - Oq rangli
      { name: '8mm Oq Preform', bagType: '8mm-OQ', unitsPerBag: 200, pricePerBag: 10, minStock: 50, optimalStock: 300, maxCapacity: 800 },
      { name: '8mm Oq Preform (Sprite)', bagType: '8mm-OQ-SPRITE', unitsPerBag: 200, pricePerBag: 12, minStock: 50, optimalStock: 300, maxCapacity: 800 },
      { name: '8mm Oq Preform (Fanta)', bagType: '8mm-OQ-FANTA', unitsPerBag: 200, pricePerBag: 12, minStock: 50, optimalStock: 300, maxCapacity: 800 },
      
      // 8mm Preform - Qora rangli
      { name: '8mm Qora Preform', bagType: '8mm-QORA', unitsPerBag: 200, pricePerBag: 8, minStock: 50, optimalStock: 300, maxCapacity: 800 },
      { name: '8mm Qora Preform (Sprite)', bagType: '8mm-QORA-SPRITE', unitsPerBag: 200, pricePerBag: 10, minStock: 50, optimalStock: 300, maxCapacity: 800 },
      { name: '8mm Qora Preform (Fanta)', bagType: '8mm-QORA-FANTA', unitsPerBag: 200, pricePerBag: 10, minStock: 50, optimalStock: 300, maxCapacity: 800 }
    ];

    console.log('🏭 8mm liq preformalar qo\'shilmoqda...');

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
            currentStock: Math.floor(Math.random() * 100) + 50, // Random stock between 50-150
            pricePerBag: productData.pricePerBag,
            productionCost: productData.pricePerBag * 0.5 // 50% of price is production cost
          }
        });

        console.log(`✅ ${productData.name} (${productData.bagType}) qo\'shildi - Stock: ${product.currentStock} dona (${product.currentStock * productData.unitsPerBag} ta preform)`);
      } catch (error) {
        console.error(`❌ ${productData.name} qo\'shishda xatolik:`, error);
      }
    }

    console.log('🎉 Barcha 8mm liq preformalar muvaffaqiyatli qo\'shildi!');
    console.log('📊 Jami:', preformProducts.length, 'ta mahsulot');
    console.log('🎨 Ranglar: Shaffof (3ta), Oq (3ta), Qora (3ta)');
    console.log('🥤 Ichimliklar: Sprite (3ta), Fanta (3ta)');
    console.log('📦 Har bir qopda: 200 dona (132 ta 8mm preform)');
    
  } catch (error) {
    console.error('Xatolik yuz berdi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

add8mmPreforms();
