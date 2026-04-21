const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    console.log('🔍 Database ma\'lumotlarini tekshirish...');
    
    const users = await prisma.user.count();
    const products = await prisma.product.count();
    const customers = await prisma.customer.count();
    const sales = await prisma.sale.count();
    
    console.log(`👤 Userlar: ${users}`);
    console.log(`📦 Mahsulotlar: ${products}`);
    console.log(`👥 Mijozlar: ${customers}`);
    console.log(`💰 Sotuvlar: ${sales}`);
    
    if (products > 0) {
      const firstProduct = await prisma.product.findFirst();
      console.log('📦 Birinchi mahsulot:', firstProduct?.name);
    }
    
    if (customers > 0) {
      const firstCustomer = await prisma.customer.findFirst();
      console.log('👥 Birinchi mijoz:', firstCustomer?.name);
    }
    
  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
