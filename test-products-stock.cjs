const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkProducts() {
  try {
    console.log('📦 MAHSULOTLAR TEKSHIRUVI\n');
    
    // Barcha mahsulotlar
    const allProducts = await prisma.product.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log(`📊 Jami mahsulotlar: ${allProducts.length} ta\n`);
    
    if (allProducts.length === 0) {
      console.log('❌ BAZADA MAHSULOTLAR YO\'Q!\n');
      console.log('💡 Mahsulot qo\'shish uchun saytga kiring:\n');
      console.log('   http://localhost:3000/products\n');
      return;
    }
    
    // Omborda mavjud mahsulotlar
    const inStockProducts = allProducts.filter(p => p.currentStock > 0);
    console.log(`✅ Omborda mavjud: ${inStockProducts.length} ta\n`);
    
    // Omborda yo'q mahsulotlar
    const outOfStockProducts = allProducts.filter(p => p.currentStock === 0);
    console.log(`❌ Omborda yo\'q: ${outOfStockProducts.length} ta\n`);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Har bir mahsulot haqida ma'lumot
    allProducts.forEach((product, index) => {
      const status = product.currentStock > 0 ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${product.name}`);
      console.log(`   📦 Omborda: ${product.currentStock} qop`);
      console.log(`   🔢 Bir qopda: ${product.unitsPerBag} dona`);
      console.log(`   💰 Narx: ${product.pricePerBag.toLocaleString()} so'm/qop`);
      console.log('');
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (inStockProducts.length === 0) {
      console.log('⚠️ DIQQAT: Omborda mahsulotlar yo\'q!\n');
      console.log('💡 Mahsulot qo\'shish uchun:\n');
      console.log('   1. Saytga kiring: http://localhost:3000');
      console.log('   2. "Mahsulotlar" bo\'limiga o\'ting');
      console.log('   3. Mahsulot qo\'shing yoki ombor holatini yangilang\n');
    } else {
      console.log('✅ Bot uchun mahsulotlar mavjud!\n');
      console.log('🤖 Botda ko\'rinadigan mahsulotlar:\n');
      inStockProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (${product.currentStock} qop)`);
      });
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Xatolik:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();
