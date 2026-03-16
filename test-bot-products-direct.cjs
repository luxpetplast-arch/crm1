const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBotQuery() {
  try {
    console.log('🤖 BOT QUERY TESTI\n');
    
    // Bot ishlatadigan query
    const products = await prisma.product.findMany({
      where: {
        currentStock: {
          gt: 0
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`📊 Topilgan mahsulotlar: ${products.length} ta\n`);
    
    if (products.length === 0) {
      console.log('❌ MAHSULOTLAR TOPILMADI!\n');
      return;
    }
    
    console.log('✅ MAHSULOTLAR RO\'YXATI:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    products.forEach((product, index) => {
      const stockStatus = product.currentStock > 50 ? '✅' : product.currentStock > 10 ? '⚠️' : '🔴';
      const buttonText = `${stockStatus} ${product.name} (${product.currentStock} qop) - ${product.pricePerBag.toLocaleString()} so'm`;
      
      console.log(`${index + 1}. ${buttonText}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Callback: order_product_${product.id}`);
      console.log('');
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Query ishlayapti!\n');
    console.log('💡 Agar botda mahsulotlar ko\'rinmasa:\n');
    console.log('   1. Serverni qayta ishga tushiring');
    console.log('   2. Botni /start bilan qayta boshlang');
    console.log('   3. "🛒 Smart Buyurtma" tugmasini bosing\n');
    
  } catch (error) {
    console.error('❌ Xatolik:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testBotQuery();
