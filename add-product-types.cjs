const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addProductsWithTypes() {
  try {
    // Mahsulot turlari bo'yicha ma'lumotlar
    const productTypes = [
      { type: '15mg', name: '15mg Sprite', unitsPerBag: 100, pricePerBag: 25, minStock: 50, optimalStock: 200, maxCapacity: 500 },
      { type: '15mg', name: '15mg Fanta', unitsPerBag: 100, pricePerBag: 25, minStock: 50, optimalStock: 200, maxCapacity: 500 },
      { type: '15mg', name: '15mg Coca-Cola', unitsPerBag: 100, pricePerBag: 25, minStock: 50, optimalStock: 200, maxCapacity: 500 },
      
      { type: '30mg', name: '30mg Sprite', unitsPerBag: 50, pricePerBag: 35, minStock: 30, optimalStock: 150, maxCapacity: 300 },
      { type: '30mg', name: '30mg Fanta', unitsPerBag: 50, pricePerBag: 35, minStock: 30, optimalStock: 150, maxCapacity: 300 },
      { type: '30mg', name: '30mg Coca-Cola', unitsPerBag: 50, pricePerBag: 35, minStock: 30, optimalStock: 150, maxCapacity: 300 },
      
      { type: '60mg', name: '60mg Sprite', unitsPerBag: 25, pricePerBag: 50, minStock: 20, optimalStock: 100, maxCapacity: 200 },
      { type: '60mg', name: '60mg Fanta', unitsPerBag: 25, pricePerBag: 50, minStock: 20, optimalStock: 100, maxCapacity: 200 },
      { type: '60mg', name: '60mg Coca-Cola', unitsPerBag: 25, pricePerBag: 50, minStock: 20, optimalStock: 100, maxCapacity: 200 }
    ];

    console.log('🏭 Mahsulot turlariga ko\'ra qo\'shilmoqda...');

    for (const productData of productTypes) {
      try {
        const product = await prisma.product.create({
          data: {
            name: productData.name,
            bagType: productData.type,
            unitsPerBag: productData.unitsPerBag,
            minStockLimit: productData.minStock,
            optimalStock: productData.optimalStock,
            maxCapacity: productData.maxCapacity,
            currentStock: Math.floor(Math.random() * 100) + 50, // Random stock between 50-150
            pricePerBag: productData.pricePerBag,
            productionCost: productData.pricePerBag * 0.7 // 70% of price is production cost
          }
        });

        console.log(`✅ ${productData.name} (${productData.type}) qo\'shildi - Stock: ${product.currentStock}`);
      } catch (error) {
        console.error(`❌ ${productData.name} qo\'shishda xatolik:`, error);
      }
    }

    console.log('🎉 Barcha mahsulot turlari muvaffaqiyatli qo\'shildi!');
    console.log('📊 Jami:', productTypes.length, 'ta mahsulot');
    console.log('📦 Turlar: 15mg (3ta), 30mg (3ta), 60mg (3ta)');
    
  } catch (error) {
    console.error('Xatolik yuz berdi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addProductsWithTypes();
