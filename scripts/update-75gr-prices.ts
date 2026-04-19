import { prisma } from '../server/utils/prisma';

async function update75grPrices() {
  console.log('Updating 75gr products prices...');
  
  try {
    // 75gr 4000 ta/qop - donasini 0.14125
    const preforms75_4000 = [
      { name: '75gr prozrach', pricePerPiece: 0.14125, unitsPerBag: 4000 },
      { name: '75gr sayxun', pricePerPiece: 0.14125, unitsPerBag: 4000 },
      { name: '75gr gidro', pricePerPiece: 0.14125, unitsPerBag: 4000 },
      { name: '75gr siniy', pricePerPiece: 0.14125, unitsPerBag: 4000 }
    ];
    
    for (const preform of preforms75_4000) {
      const product = await prisma.product.findFirst({
        where: { name: preform.name }
      });
      
      if (product) {
        const pricePerBag = preform.pricePerPiece * preform.unitsPerBag; // 0.14125 * 4000 = 565
        
        await prisma.product.update({
          where: { id: product.id },
          data: {
            pricePerPiece: preform.pricePerPiece,
            pricePerBag: pricePerBag,
            unitsPerBag: preform.unitsPerBag
          }
        });
        
        console.log(`✅ Updated ${preform.name}: dona=${preform.pricePerPiece}$, qop=${pricePerBag}$, 1 qop=${preform.unitsPerBag} ta`);
      } else {
        console.log(`❌ Product not found: ${preform.name}`);
      }
    }
    
    // 75gr 3000 ta/qop - hali narxi aytilmadi, shuning uchun faqat unitsPerBag yangilanadi
    const preforms75_3000 = [
      { name: '75gr prozrach-3000', unitsPerBag: 3000 },
      { name: '75gr gidro-3000', unitsPerBag: 3000 },
      { name: '75gr siniy-3000', unitsPerBag: 3000 }
    ];
    
    for (const preform of preforms75_3000) {
      const product = await prisma.product.findFirst({
        where: { name: preform.name }
      });
      
      if (product) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            unitsPerBag: preform.unitsPerBag
          }
        });
        
        console.log(`✅ Updated ${preform.name}: 1 qop=${preform.unitsPerBag} ta (narx o'zgarmadi)`);
      } else {
        console.log(`❌ Product not found: ${preform.name}`);
      }
    }
    
    // 75gr bilan boshlangan barcha mahsulotlarni qidirish
    const all75grProducts = await prisma.product.findMany({
      where: { 
        name: { contains: '75gr' }
      }
    });
    
    console.log(`\nFound ${all75grProducts.length} products with '75gr' in name:`);
    for (const product of all75grProducts) {
      console.log(`  - ${product.name}: current price=${product.pricePerPiece}`);
    }
    
    console.log('\n✅ All 75gr products updated successfully!');
    
  } catch (error) {
    console.error('Error updating prices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

update75grPrices();
