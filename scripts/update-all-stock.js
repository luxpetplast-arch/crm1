const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAllStockTo300() {
  try {
    console.log('🔍 Barcha mahsulotlar olinmoqda...');
    
    // Barcha mahsulotlarni olish
    const allProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        currentStock: true,
        currentUnits: true,
        unitsPerBag: true,
        warehouse: true
      }
    });

    console.log(`📦 Jami ${allProducts.length} ta mahsulot topildi:`);
    console.log('\n📋 Joriy zaxiralar:');
    
    allProducts.forEach(product => {
      console.log(`- ${product.name}: ${product.currentStock} qop (${product.currentUnits} dona) [${product.warehouse}]`);
    });

    console.log('\n❓ Barcha mahsulotlarni 300 qopga yangilashni tasdiqlaysizmi? (y/n)');
    
    // Barcha mahsulotlarni 300 qopga yangilash
    const updatePromises = allProducts.map(async (product) => {
      const unitsPerBag = product.unitsPerBag || 2000;
      const newTotalUnits = 300 * unitsPerBag;
      
      return await prisma.product.update({
        where: { id: product.id },
        data: {
          currentStock: 300,
          currentUnits: newTotalUnits
        }
      });
    });

    const updatedProducts = await Promise.all(updatePromises);
    
    console.log('\n✅ Barcha mahsulotlar muvaffaqiyatli yangilandi:');
    updatedProducts.forEach(product => {
      console.log(`- ${product.name}: ${product.currentStock} qop (${product.currentUnits} dona)`);
    });

    console.log(`\n🎉 ${updatedProducts.length} ta mahsulot 300 qopga yangilandi!`);
    
  } catch (error) {
    console.error('❌ Xatolik yuz berdi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Scriptni ishga tushurish
updateAllStockTo300();
