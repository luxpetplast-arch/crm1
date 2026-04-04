const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function clearTestProducts() {
  try {
    console.log('🗑️ Test mahsulotlar o\'chirilmoqda...');
    
    const deleted = await prisma.product.deleteMany({
      where: {
        name: {
          in: ['PET Preform 28mm', 'PET Preform 30mm', 'PET Preform 32mm', 'Kapsula', 'Qopqoq']
        }
      }
    });
    
    console.log(`✅ ${deleted.count} ta test mahsulot o\'chirildi`);
    
    const remaining = await prisma.product.count();
    console.log(`📊 Qolgan mahsulotlar: ${remaining} ta`);
    
  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearTestProducts();
