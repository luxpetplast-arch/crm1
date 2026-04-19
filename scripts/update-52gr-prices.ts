import { prisma } from '../server/utils/prisma';

async function update52grPrices() {
  console.log('Updating 52gr products prices to 0.0983 per piece...');
  
  try {
    // 52gr preformlar - donasini 0.0983
    // 52gr preformlar 1 qopda 6000 ta (setup-preform-products.ts dan)
    const preforms52 = [
      { name: '52gr prozrach', pricePerPiece: 0.0983, unitsPerBag: 6000 },
      { name: '52gr ok', pricePerPiece: 0.0983, unitsPerBag: 6000 }
    ];
    
    for (const preform of preforms52) {
      const product = await prisma.product.findFirst({
        where: { name: preform.name }
      });
      
      if (product) {
        const pricePerBag = preform.pricePerPiece * preform.unitsPerBag; // 0.0983 * 6000 = 589.8
        
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
    
    // 52gr bilan boshlangan barcha mahsulotlarni qidirish
    const all52grProducts = await prisma.product.findMany({
      where: { 
        name: { contains: '52gr' }
      }
    });
    
    console.log(`\nFound ${all52grProducts.length} products with '52gr' in name:`);
    for (const product of all52grProducts) {
      console.log(`  - ${product.name}: current price=${product.pricePerPiece}`);
    }
    
    console.log('\n✅ All 52gr products updated successfully!');
    
  } catch (error) {
    console.error('Error updating prices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

update52grPrices();
