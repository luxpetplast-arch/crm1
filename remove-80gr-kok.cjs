const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function remove80grKok() {
  console.log('🗑️  80gr ko\'k (siniy) variantlarni o\'chirish...\n');
  
  const kokProducts = [
    'Preform 80gr siniy',
    'Preform 80gr siniy 3000'
  ];
  
  let deletedCount = 0;
  let notFoundCount = 0;
  let errorCount = 0;
  
  for (const name of kokProducts) {
    try {
      const product = await prisma.product.findFirst({
        where: { name: name }
      });
      
      if (product) {
        await prisma.product.delete({
          where: { id: product.id }
        });
        deletedCount++;
        console.log(`✅ ${name} o'chirildi`);
      } else {
        notFoundCount++;
        console.log(`⏭️  ${name} topilmadi`);
      }
    } catch (error) {
      errorCount++;
      console.log(`❌ ${name} - ${error.message}`);
    }
  }
  
  console.log(`\n🎉 ${deletedCount} ta ko'k mahsulot o'chirildi!`);
  if (notFoundCount > 0) {
    console.log(`⏭️  ${notFoundCount} ta topilmadi`);
  }
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} ta xatolik`);
  }
  
  // Jami preform mahsulotlar soni
  const totalPreforms = await prisma.product.count({
    where: { warehouse: 'preform' }
  });
  console.log(`📊 Jami preform mahsulotlar: ${totalPreforms} ta`);
  
  // Qolgan 80gr mahsulotlar ro'yxati
  console.log('\n📋 Qolgan 80gr mahsulotlar:');
  const remaining80gr = await prisma.product.findMany({
    where: { 
      warehouse: 'preform',
      bagType: '80GR'
    }
  });
  remaining80gr.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p.name}`);
  });
  
  await prisma.$disconnect();
}

remove80grKok().catch(async (e) => {
  console.error('❌ Xatolik:', e);
  await prisma.$disconnect();
  process.exit(1);
});
