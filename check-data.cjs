const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const products = await prisma.product.count();
    const customers = await prisma.customer.count();
    const sales = await prisma.sale.count();
    
    console.log('📊 MA\'LUMOTLAR HOLATI:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 Mahsulotlar:', products, 'ta');
    console.log('👥 Mijozlar:', customers, 'ta');  
    console.log('💰 Sotuvlar:', sales, 'ta');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (products > 0) {
      const productList = await prisma.product.findMany({ take: 5 });
      console.log('📦 BIRINCHI 5 MAHSULOT:');
      productList.forEach(p => {
        console.log('  -', p.name, '| Stock:', p.currentStock, '| Price:', p.pricePerBag);
      });
    }
    
  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
