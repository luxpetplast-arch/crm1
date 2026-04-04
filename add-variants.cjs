const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addProductVariants() {
  try {
    console.log('🎨 Mahsulot turlari qo\'shilmoqda...');
    
    // Barcha mahsulotlarni parent qilish
    const products = await prisma.product.findMany({
      where: { isParent: false }
    });
    
    for (const product of products) {
      console.log(`📦 ${product.name} uchun turlar qo\'shilmoqda...`);
      
      // Mahsulotni parent qilish
      await prisma.product.update({
        where: { id: product.id },
        data: { isParent: true }
      });
      
      // Turlar yaratish
      const variants = [
        {
          parentId: product.id,
          variantName: 'Oq',
          currentStock: Math.floor(product.currentStock * 0.4),
          currentUnits: Math.floor(product.currentUnits * 0.4),
          pricePerBag: product.pricePerBag,
          active: true
        },
        {
          parentId: product.id,
          variantName: 'Qora',
          currentStock: Math.floor(product.currentStock * 0.3),
          currentUnits: Math.floor(product.currentUnits * 0.3),
          pricePerBag: product.pricePerBag * 1.1,
          active: true
        },
        {
          parentId: product.id,
          variantName: 'Sariq',
          currentStock: Math.floor(product.currentStock * 0.2),
          currentUnits: Math.floor(product.currentUnits * 0.2),
          pricePerBag: product.pricePerBag * 1.05,
          active: true
        },
        {
          parentId: product.id,
          variantName: 'Gidro',
          currentStock: Math.floor(product.currentStock * 0.1),
          currentUnits: Math.floor(product.currentUnits * 0.1),
          pricePerBag: product.pricePerBag * 1.15,
          active: true
        }
      ];
      
      for (const variant of variants) {
        if (variant.currentStock > 0) {
          await prisma.productVariant.create({
            data: variant
          });
          console.log(`  ✅ ${variant.variantName} - ${variant.currentStock} dona - ${variant.pricePerBag} so'm`);
        }
      }
    }
    
    console.log('🎉 Barcha mahsulot turlari muvaffaqiyatli qo\'shildi!');
    
    // Jami variantlar soni
    const totalVariants = await prisma.productVariant.count();
    console.log(`📊 Jami turlar: ${totalVariants} ta`);
    
  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addProductVariants();
