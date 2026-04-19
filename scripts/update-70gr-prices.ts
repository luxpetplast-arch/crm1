import { prisma } from '../server/utils/prisma';

async function update70grPrices() {
  console.log('Updating 70gr products prices to 0.1321 per piece...');
  
  try {
    // 70gr preformlar - donasini 0.1321
    // 70gr preformlar 1 qopda 4500 ta (setup-preform-products.ts dan)
    const preforms70 = [
      { name: '70gr prozrach', pricePerPiece: 0.1321, unitsPerBag: 4500 },
      { name: '70gr gidro', pricePerPiece: 0.1321, unitsPerBag: 4500 },
      { name: '70gr sayxun', pricePerPiece: 0.1321, unitsPerBag: 4500 },
      { name: '70gr siniy', pricePerPiece: 0.1321, unitsPerBag: 4500 }
    ];
    
    for (const preform of preforms70) {
      const product = await prisma.product.findFirst({
        where: { name: preform.name }
      });
      
      if (product) {
        const pricePerBag = preform.pricePerPiece * preform.unitsPerBag; // 0.1321 * 4500 = 594.45
        
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
    
    // 70gr bilan boshlangan barcha mahsulotlarni qidirish
    const all70grProducts = await prisma.product.findMany({
      where: { 
        name: { contains: '70gr' }
      }
    });
    
    console.log(`\nFound ${all70grProducts.length} products with '70gr' in name:`);
    for (const product of all70grProducts) {
      console.log(`  - ${product.name}: current price=${product.pricePerPiece}`);
    }
    
    console.log('\n✅ All 70gr products updated successfully!');
    
  } catch (error) {
    console.error('Error updating prices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

update70grPrices();
