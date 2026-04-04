const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addTestProducts() {
  try {
    console.log('🚀 Test mahsulotlar qo\'shilmoqda...');
    
    // Test mahsulotlar
    const testProducts = [
      {
        name: 'PET Preform 28mm',
        bagType: '28mm',
        pricePerBag: 25.00,
        currentStock: 150,
        minStockLimit: 50,
        optimalStock: 200,
        maxCapacity: 500,
        productionCost: 15.00,
        unitsPerBag: 1,
        isParent: false,
        active: true
      },
      {
        name: 'PET Preform 30mm',
        bagType: '30mm',
        pricePerBag: 27.00,
        currentStock: 120,
        minStockLimit: 40,
        optimalStock: 180,
        maxCapacity: 400,
        productionCost: 16.00,
        unitsPerBag: 1,
        isParent: false,
        active: true
      },
      {
        name: 'PET Preform 32mm',
        bagType: '32mm',
        pricePerBag: 30.00,
        currentStock: 80,
        minStockLimit: 30,
        optimalStock: 150,
        maxCapacity: 350,
        productionCost: 18.00,
        unitsPerBag: 1,
        isParent: false,
        active: true
      },
      {
        name: 'Kapsula',
        bagType: 'Quti',
        pricePerBag: 5.50,
        currentStock: 500,
        minStockLimit: 100,
        optimalStock: 300,
        maxCapacity: 1000,
        productionCost: 3.00,
        unitsPerBag: 1,
        isParent: false,
        active: true
      },
      {
        name: 'Qopqoq',
        bagType: 'Soni',
        pricePerBag: 2.00,
        currentStock: 1000,
        minStockLimit: 200,
        optimalStock: 800,
        maxCapacity: 2000,
        productionCost: 1.00,
        unitsPerBag: 1,
        isParent: false,
        active: true
      }
    ];

    for (const product of testProducts) {
      await prisma.product.create({
        data: product
      });
      console.log(`✅ ${product.name} qo\'shildi`);
    }

    console.log('🎉 Barcha test mahsulotlar muvaffaqiyatli qo\'shildi!');
    
    // Jami mahsulotlar soni
    const totalProducts = await prisma.product.count();
    console.log(`📊 Jami mahsulotlar: ${totalProducts} ta`);
    
  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestProducts();
