const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixRemainingPrices() {
  try {
    console.log('🔧 Qolgan barcha narxlarni to\'g\'rilash...\n');

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: '38' } },
          { name: { contains: '48' } },
          { name: { contains: '55' } }
        ]
      },
      orderBy: { name: 'asc' }
    });

    console.log(`📦 ${products.length} ta mahsulot topildi.\n`);

    let updatedCount = 0;

    for (const product of products) {
      let newPricePerBag = null;
      let unitsPerBag = product.unitsPerBag || 1000;

      // Qopqoq narxlari
      if (product.name.includes('Qopqoq')) {
        if (product.name.includes('38')) {
          newPricePerBag = 100; // 38mm qopqoq - 100 so'm
        } else if (product.name.includes('48')) {
          newPricePerBag = 13;  // 48mm qopqoq - 13 so'm
        } else if (product.name.includes('55')) {
          newPricePerBag = 1000; // 55mm qopqoq - 1000 so'm
        }
      }
      // Ruchka narxlari
      else if (product.name.includes('Ruchka')) {
        if (product.name.includes('38')) {
          newPricePerBag = 150; // 38mm ruchka - 150 so'm
        } else if (product.name.includes('48')) {
          newPricePerBag = 17;  // 48mm ruchka - 17 so'm
        }
      }

      // Agar narx topilsa va u hozirgi narxdan farq qilsa, yangilash
      if (newPricePerBag && newPricePerBag !== product.pricePerBag) {
        const pricePerPiece = unitsPerBag > 0 ? newPricePerBag / unitsPerBag : 0;

        await prisma.product.update({
          where: { id: product.id },
          data: {
            pricePerBag: newPricePerBag,
            pricePerPiece: pricePerPiece,
            unitsPerBag: unitsPerBag
          }
        });

        console.log(`✅ ${product.name}: ${product.pricePerBag} → ${newPricePerBag} so'm/qop | ${pricePerPiece} so'm/dona`);
        updatedCount++;
      } else if (!newPricePerBag) {
        console.log(`⚠️  ${product.name}: Narx topilmadi`);
      } else {
        console.log(`➖ ${product.name}: Narx o'zgarmas (${newPricePerBag} so'm/qop)`);
      }
    }

    console.log(`\n🎉 ${updatedCount} ta mahsulot narxi muvaffaqiyatli yangilandi!`);

  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixRemainingPrices();
