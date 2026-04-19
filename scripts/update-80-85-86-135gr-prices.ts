import { prisma } from '../server/utils/prisma';

async function updatePrices() {
  console.log('Updating 80gr, 85gr, 86gr, 135gr products prices...');
  
  try {
    // 80gr - 4000 ta/qop, dona narxi 0.15
    const preforms80 = [
      { name: '80gr prozrach', pricePerPiece: 0.15, unitsPerBag: 4000 },
      { name: '80gr prozrach-3000', pricePerPiece: 0.15, unitsPerBag: 3000 },
      { name: '80gr gidro', pricePerPiece: 0.15, unitsPerBag: 4000 },
      { name: '80gr gidro-3000', pricePerPiece: 0.15, unitsPerBag: 3000 },
      { name: '80gr sayxun', pricePerPiece: 0.15, unitsPerBag: 4000 },
      { name: '80gr sayxun-3000', pricePerPiece: 0.15, unitsPerBag: 3000 },
      { name: '80gr siniy', pricePerPiece: 0.15, unitsPerBag: 4000 },
      { name: '80gr siniy-3000', pricePerPiece: 0.15, unitsPerBag: 3000 }
    ];
    
    for (const preform of preforms80) {
      const product = await prisma.product.findFirst({
        where: { name: preform.name }
      });
      
      if (product) {
        const pricePerBag = preform.pricePerPiece * preform.unitsPerBag;
        
        await prisma.product.update({
          where: { id: product.id },
          data: {
            pricePerPiece: preform.pricePerPiece,
            pricePerBag: pricePerBag,
            unitsPerBag: preform.unitsPerBag
          }
        });
        
        console.log(`✅ 80gr Updated ${preform.name}: dona=${preform.pricePerPiece}$, qop=${pricePerBag}$, 1 qop=${preform.unitsPerBag} ta`);
      } else {
        console.log(`❌ 80gr Product not found: ${preform.name}`);
      }
    }
    
    // 85gr - 4000 ta/qop, dona narxi 0.16
    const preforms85 = [
      { name: '85gr prozrach', pricePerPiece: 0.16, unitsPerBag: 4000 },
      { name: '85gr prozrach-4000', pricePerPiece: 0.16, unitsPerBag: 4000 }
    ];
    
    for (const preform of preforms85) {
      const product = await prisma.product.findFirst({
        where: { name: preform.name }
      });
      
      if (product) {
        const pricePerBag = preform.pricePerPiece * preform.unitsPerBag;
        
        await prisma.product.update({
          where: { id: product.id },
          data: {
            pricePerPiece: preform.pricePerPiece,
            pricePerBag: pricePerBag,
            unitsPerBag: preform.unitsPerBag
          }
        });
        
        console.log(`✅ 85gr Updated ${preform.name}: dona=${preform.pricePerPiece}$, qop=${pricePerBag}$, 1 qop=${preform.unitsPerBag} ta`);
      } else {
        console.log(`❌ 85gr Product not found: ${preform.name}`);
      }
    }
    
    // 86gr - 4000 ta/qop, dona narxi 0.1625
    const preforms86 = [
      { name: '86gr prozrach', pricePerPiece: 0.1625, unitsPerBag: 4000 },
      { name: '86gr prozrach-4000', pricePerPiece: 0.1625, unitsPerBag: 4000 }
    ];
    
    for (const preform of preforms86) {
      const product = await prisma.product.findFirst({
        where: { name: preform.name }
      });
      
      if (product) {
        const pricePerBag = preform.pricePerPiece * preform.unitsPerBag;
        
        await prisma.product.update({
          where: { id: product.id },
          data: {
            pricePerPiece: preform.pricePerPiece,
            pricePerBag: pricePerBag,
            unitsPerBag: preform.unitsPerBag
          }
        });
        
        console.log(`✅ 86gr Updated ${preform.name}: dona=${preform.pricePerPiece}$, qop=${pricePerBag}$, 1 qop=${preform.unitsPerBag} ta`);
      } else {
        console.log(`❌ 86gr Product not found: ${preform.name}`);
      }
    }
    
    // 135gr - 2500 ta/qop, dona narxi 0.256
    const preforms135 = [
      { name: '135gr prozrach', pricePerPiece: 0.256, unitsPerBag: 2500 },
      { name: '135gr prozrach-2000', pricePerPiece: 0.256, unitsPerBag: 2000 },
      { name: '135gr gidro', pricePerPiece: 0.256, unitsPerBag: 2500 },
      { name: '135gr gidro-2000', pricePerPiece: 0.256, unitsPerBag: 2000 },
      { name: '135gr sayxun', pricePerPiece: 0.256, unitsPerBag: 2500 },
      { name: '135gr sayxun +', pricePerPiece: 0.256, unitsPerBag: 2500 },
      { name: '135gr siniy', pricePerPiece: 0.256, unitsPerBag: 2500 },
      { name: '135gr siniy-2000', pricePerPiece: 0.256, unitsPerBag: 2000 }
    ];
    
    for (const preform of preforms135) {
      const product = await prisma.product.findFirst({
        where: { name: preform.name }
      });
      
      if (product) {
        const pricePerBag = preform.pricePerPiece * preform.unitsPerBag;
        
        await prisma.product.update({
          where: { id: product.id },
          data: {
            pricePerPiece: preform.pricePerPiece,
            pricePerBag: pricePerBag,
            unitsPerBag: preform.unitsPerBag
          }
        });
        
        console.log(`✅ 135gr Updated ${preform.name}: dona=${preform.pricePerPiece}$, qop=${pricePerBag}$, 1 qop=${preform.unitsPerBag} ta`);
      } else {
        console.log(`❌ 135gr Product not found: ${preform.name}`);
      }
    }
    
    console.log('\n✅ All products updated successfully!');
    
  } catch (error) {
    console.error('Error updating prices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePrices();
