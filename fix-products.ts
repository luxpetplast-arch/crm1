import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixProductUnits() {
  console.log('🔧 Mahsulot donalarini to\'g\'rilash...');
  
  try {
    // Barcha mahsulotlarni olish
    const products = await prisma.product.findMany();
    
    for (const product of products) {
      // currentUnits ni to'g'ri hisoblash
      const correctUnits = product.currentStock * product.unitsPerBag;
      
      if (product.currentUnits !== correctUnits) {
        console.log(`📦 ${product.name}: ${product.currentUnits} → ${correctUnits} dona`);
        
        await prisma.product.update({
          where: { id: product.id },
          data: { currentUnits: correctUnits }
        });
      }
    }
    
    console.log('✅ Mahsulot donalari to\'g\'rilandi');
  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductUnits();
