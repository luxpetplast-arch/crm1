const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVariants() {
  try {
    console.log('🎨 TURLAR HOLATI:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const variants = await prisma.productVariant.findMany({
      include: {
        parent: true
      }
    });
    
    console.log(`📊 Jami turlar: ${variants.length} ta`);
    console.log('');
    
    variants.forEach((variant, index) => {
      console.log(`${index + 1}. ${variant.parent.name} - ${variant.variantName}`);
      console.log(`   📦 Stock: ${variant.currentStock} dona`);
      console.log(`   💰 Price: ${variant.pricePerBag} so'm`);
      console.log(`   🆔 ID: ${variant.id}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVariants();
