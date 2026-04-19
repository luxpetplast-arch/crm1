import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function update15gPreforms() {
  try {
    console.log('🔄 15g preformlarni yangilash...');

    // Yangi qiymatlar
    const NEW_UNITS_PER_BAG = 20000; // 1 qopda 20,000 ta
    const NEW_PRICE_PER_PIECE = 0.0285; // 1 dona = $0.0285
    const NEW_PRICE_PER_BAG = 570.00; // 1 qop = $570 (20000 × 0.0285)

    // 15g preformlarni topish
    const products15g = await prisma.product.findMany({
      where: {
        name: {
          contains: '15gr'
        }
      }
    });

    console.log(`🔍 Topildi: ${products15g.length} ta 15g preform`);

    for (const product of products15g) {
      // Hozirgi qop sonini hisoblash (yangi unitsPerBag asosida)
      const currentTotalUnits = product.currentUnits || 0;
      const newBagCount = currentTotalUnits / NEW_UNITS_PER_BAG;

      console.log(`\n📦 ${product.name}:`);
      console.log(`   Hozirgi: ${currentTotalUnits} dona, ${product.currentStock} qop (eski: ${product.unitsPerBag} dona/qop)`);
      console.log(`   Yangi: ${currentTotalUnits} dona, ${newBagCount} qop (${NEW_UNITS_PER_BAG} dona/qop)`);
      console.log(`   Narx: $${NEW_PRICE_PER_BAG}/qop, $${NEW_PRICE_PER_PIECE}/dona`);

      // Mahsulotni yangilash
      await prisma.product.update({
        where: { id: product.id },
        data: {
          unitsPerBag: NEW_UNITS_PER_BAG,
          pricePerBag: NEW_PRICE_PER_BAG,
          pricePerPiece: NEW_PRICE_PER_PIECE,
          currentStock: newBagCount,
          minStockLimit: Math.ceil(newBagCount * 0.2), // 20%
          optimalStock: Math.ceil(newBagCount * 0.5),  // 50%
          maxCapacity: Math.ceil(newBagCount * 1.5),   // 150%
        }
      });

      console.log(`   ✅ Yangilandi`);
    }

    console.log('\n🎉 Barcha 15g preformlar yangilandi!');
    console.log(`\n📊 Yangi parametrlar:`);
    console.log(`   - 1 qop = ${NEW_UNITS_PER_BAG.toLocaleString()} dona`);
    console.log(`   - 1 dona = $${NEW_PRICE_PER_PIECE}`);
    console.log(`   - 1 qop narxi = $${NEW_PRICE_PER_BAG}`);
    console.log(`   - Tekshiruv: ${NEW_UNITS_PER_BAG} × $${NEW_PRICE_PER_PIECE} = $${(NEW_UNITS_PER_BAG * NEW_PRICE_PER_PIECE).toFixed(2)}`);

    // Yangilangan mahsulotlarni ko'rsatish
    const updatedProducts = await prisma.product.findMany({
      where: {
        name: {
          contains: '15gr'
        }
      },
      select: {
        name: true,
        currentStock: true,
        currentUnits: true,
        unitsPerBag: true,
        pricePerBag: true,
        pricePerPiece: true
      }
    });

    console.log('\n📋 Yangilangan mahsulotlar:');
    updatedProducts.forEach(p => {
      console.log(`   ${p.name}:`);
      console.log(`      ${p.currentStock} qop × ${p.unitsPerBag} dona = ${p.currentUnits} dona`);
      console.log(`      $${p.pricePerBag}/qop, $${p.pricePerPiece}/dona`);
    });

  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script ni ishga tushirish
update15gPreforms();

export { update15gPreforms };
