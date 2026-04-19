import { prisma } from '../server/utils/prisma';

async function update26grPreformPrices() {
  console.log('Updating 26gr preform prices to 0.04958 per piece...');
  
  try {
    // 26gr preformlar - donasini 0.04958
    // 26gr preformlar 1 qopda 12000 ta
    const preforms26 = [
      { name: '26gr yog', pricePerPiece: 0.04958, unitsPerBag: 12000 }
    ];
    
    for (const preform of preforms26) {
      const product = await prisma.product.findFirst({
        where: { name: preform.name }
      });
      
      if (product) {
        const pricePerBag = preform.pricePerPiece * preform.unitsPerBag; // 0.04958 * 12000 = 594.96
        
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
    
    // 26gr bilan boshlangan barcha preformlarni qidirish
    const all26grProducts = await prisma.product.findMany({
      where: { 
        name: { contains: '26gr' }
      }
    });
    
    console.log(`\nFound ${all26grProducts.length} products with '26gr' in name:`);
    for (const product of all26grProducts) {
      console.log(`  - ${product.name}: current price=${product.pricePerPiece}`);
    }
    
    console.log('\n✅ All 26gr preform prices updated successfully!');
    
  } catch (error) {
    console.error('Error updating prices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

update26grPreformPrices();
