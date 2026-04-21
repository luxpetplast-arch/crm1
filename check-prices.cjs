const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPrices() {
  try {
    console.log('🔍 Mahsulot narxlarini tekshirish...\n');
    
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        bagType: true,
        currentStock: true,
        unitsPerBag: true,
        pricePerBag: true,
        pricePerPiece: true,
        productType: {
          select: { name: true }
        }
      }
    });

    console.log(`📦 Jami ${products.length} ta mahsulot topildi:\n`);

    // Preformlar
    console.log('=== PREFORMLAR ===');
    const preforms = products.filter(p => p.productType?.name === 'Preform');
    preforms.forEach(product => {
      const pricePerPiece = product.pricePerPiece || 0;
      const pricePerBag = product.pricePerBag || 0;
      console.log(`${product.name} | Stock: ${product.currentStock} | Narx: ${pricePerBag} so'm/qop | ${pricePerPiece} so'm/dona`);
    });

    // Qopqoqlar
    console.log('\n=== QOPQOQLAR ===');
    const caps = products.filter(p => p.name.includes('Qopqoq') || p.name.includes('Krishka'));
    caps.forEach(product => {
      const pricePerPiece = product.pricePerPiece || 0;
      const pricePerBag = product.pricePerBag || 0;
      console.log(`${product.name} | Stock: ${product.currentStock} | Narx: ${pricePerBag} so'm/qop | ${pricePerPiece} so'm/dona`);
    });

    // Ruchkalar
    console.log('\n=== RUCHKALAR ===');
    const handles = products.filter(p => p.name.includes('Ruchka'));
    handles.forEach(product => {
      const pricePerPiece = product.pricePerPiece || 0;
      const pricePerBag = product.pricePerBag || 0;
      console.log(`${product.name} | Stock: ${product.currentStock} | Narx: ${pricePerBag} so'm/qop | ${pricePerPiece} so'm/dona`);
    });

    // Nol narxli mahsulotlar
    const zeroPriceProducts = products.filter(p => !p.pricePerBag || p.pricePerBag === 0);
    if (zeroPriceProducts.length > 0) {
      console.log('\n❌ NOL NARXLI MAHSULOTLAR:');
      zeroPriceProducts.forEach(product => {
        console.log(`- ${product.name}`);
      });
    }

    console.log(`\n📊 XULOSA:`);
    console.log(`- Jami mahsulotlar: ${products.length}`);
    console.log(`- Nol narxli: ${zeroPriceProducts.length}`);
    console.log(`- Preformlar: ${preforms.length}`);
    console.log(`- Qopqoqlar: ${caps.length}`);
    console.log(`- Ruchkalar: ${handles.length}`);

  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPrices();
