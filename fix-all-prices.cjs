const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAllPrices() {
  try {
    console.log('🔧 Barcha mahsulot narxlarini to\'g\'rilash...\n');

    // Preform narxlari (so'm)
    const preformPrices = {
      '15gr': 570,      // 15gr preform - 570 so'm/qop
      '21gr': 600,      // 21gr preform - 600 so'm/qop
      '26gr': 650,      // 26gr preform - 650 so'm/qop
      '30gr': 570,      // 30gr preform - 570 so'm/qop
      '36gr': 685,      // 36gr preform - 685 so'm/qop
      '52gr': 800,      // 52gr preform - 800 so'm/qop
      '70gr': 900,      // 70gr preform - 900 so'm/qop
      '75gr': 950,      // 75gr preform - 950 so'm/qop
      '80gr': 1000,     // 80gr preform - 1000 so'm/qop
      '85gr': 1050,     // 85gr preform - 1050 so'm/qop
      '86gr': 1050,     // 86gr preform - 1050 so'm/qop
      '135gr': 1300,    // 135gr preform - 1300 so'm/qop
      '250gr': 1500,    // 250gr preform - 1500 so'm/qop
    };

    // Qopqoq narxlari (so'm)
    const capPrices = {
      '28mm': 48,      // 28mm qopqoq - 48 so'm/qop
      '38mm': 100,     // 38mm qopqoq - 100 so'm/qop
      '48mm': 13,      // 48mm qopqoq - 13 so'm/qop
      '55mm': 1000,    // 55mm qopqoq - 1000 so'm/qop
    };

    // Ruchka narxlari (so'm)
    const handlePrices = {
      '28mm': 500,     // 28mm ruchka - 500 so'm/qop
      '38mm': 150,     // 38mm ruchka - 150 so'm/qop
      '48mm': 17,      // 48mm ruchka - 17 so'm/qop
    };

    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });

    console.log(`📦 ${products.length} ta mahsulot narxlari yangilanmoqda...\n`);

    let updatedCount = 0;

    for (const product of products) {
      let newPricePerBag = null;
      let unitsPerBag = product.unitsPerBag || 1000;

      // Preform narxlarini belgilash
      if (product.name.includes('gr')) {
        for (const [size, price] of Object.entries(preformPrices)) {
          if (product.name.includes(size)) {
            newPricePerBag = price;
            break;
          }
        }
      }
      // Qopqoq narxlarini belgilash
      else if (product.name.includes('Qopqoq') || product.name.includes('Krishka')) {
        for (const [size, price] of Object.entries(capPrices)) {
          if (product.name.includes(size)) {
            newPricePerBag = price;
            break;
          }
        }
      }
      // Ruchka narxlarini belgilash
      else if (product.name.includes('Ruchka')) {
        for (const [size, price] of Object.entries(handlePrices)) {
          if (product.name.includes(size)) {
            newPricePerBag = price;
            break;
          }
        }
      }
      // Standart mahsulotlar
      else if (product.name.includes('Preform')) {
        if (product.name.includes('0.5L')) newPricePerBag = 2500000;
        else if (product.name.includes('1L')) newPricePerBag = 3000000;
        else if (product.name.includes('2L')) newPricePerBag = 3500000;
      }

      // Agar narx topilsa, yangilash
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
      } else if (newPricePerBag === null) {
        console.log(`⚠️  ${product.name}: Narx topilmadi`);
      }
    }

    console.log(`\n🎉 ${updatedCount} ta mahsulot narxi muvaffaqiyatli yangilandi!`);

    // Tekshirish
    const zeroPriceCount = await prisma.product.count({
      where: {
        OR: [
          { pricePerBag: null },
          { pricePerBag: 0 }
        ]
      }
    });

    console.log(`📊 Qolgan nol narxli mahsulotlar: ${zeroPriceCount} ta`);

  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllPrices();
