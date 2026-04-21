const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCapsHandlesPrices() {
  try {
    console.log('🔧 Qopqoq va ruchka narxlarini to\'g\'rilash...\n');

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'Qopqoq' } },
          { name: { contains: 'Krishka' } },
          { name: { contains: 'Ruchka' } }
        ]
      },
      orderBy: { name: 'asc' }
    });

    console.log(`📦 ${products.length} ta qopqoq va ruchka topildi.\n`);

    let updatedCount = 0;

    for (const product of products) {
      let newPricePerBag = null;
      let unitsPerBag = product.unitsPerBag || 1000;

      // Qopqoq narxlari
      if (product.name.includes('Qopqoq') || product.name.includes('Krishka')) {
        if (product.name.includes('28mm')) {
          newPricePerBag = 48;  // 28mm - 48 so'm
        } else if (product.name.includes('30mm')) {
          newPricePerBag = 900000;  // 30mm - 900000 so'm
        } else if (product.name.includes('38mm')) {
          newPricePerBag = 100; // 38mm - 100 so'm
        } else if (product.name.includes('48mm')) {
          newPricePerBag = 13;  // 48mm - 13 so'm
        } else if (product.name.includes('55mm')) {
          newPricePerBag = 1000; // 55mm - 1000 so'm
        } else if (product.name.includes('28')) {
          newPricePerBag = 48;  // 28 - 48 so'm
        }
      }
      // Ruchka narxlari
      else if (product.name.includes('Ruchka')) {
        if (product.name.includes('28mm')) {
          newPricePerBag = 500; // 28mm ruchka - 500 so'm
        } else if (product.name.includes('38mm')) {
          newPricePerBag = 150; // 38mm ruchka - 150 so'm
        } else if (product.name.includes('48mm')) {
          newPricePerBag = 17;  // 48mm ruchka - 17 so'm
        } else if (product.name.includes('28')) {
          newPricePerBag = 500; // 28 ruchka - 500 so'm
        } else if (product.name.includes('Standart')) {
          newPricePerBag = 500000; // Standart ruchka - 500000 so'm
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

    console.log(`\n🎉 ${updatedCount} ta qopqoq va ruchka narxi muvaffaqiyatli yangilandi!`);

  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixCapsHandlesPrices();
