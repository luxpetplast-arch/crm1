import { prisma } from '../server/utils/prisma';

async function update38mmPrices() {
  console.log('Updating 38mm products prices...');
  
  try {
    // 38mm Ruchkalar - donasini 0.15, 1000 dona/qop
    const handles38 = [
      { name: 'Ruchka 38 Ko\'k', pricePerPiece: 0.15, unitsPerBag: 1000 },
      { name: 'Ruchka 38 Sariq', pricePerPiece: 0.15, unitsPerBag: 1000 },
      { name: 'Ruchka 38 Yashil', pricePerPiece: 0.15, unitsPerBag: 1000 },
      { name: 'Ruchka 38 Oq', pricePerPiece: 0.15, unitsPerBag: 1000 },
      { name: 'Ruchka 38 Qizil', pricePerPiece: 0.15, unitsPerBag: 1000 }
    ];
    
    for (const handle of handles38) {
      const product = await prisma.product.findFirst({
        where: { name: handle.name }
      });
      
      if (product) {
        const pricePerBag = handle.pricePerPiece * handle.unitsPerBag; // 0.15 * 1000 = 150
        
        await prisma.product.update({
          where: { id: product.id },
          data: {
            pricePerPiece: handle.pricePerPiece,
            pricePerBag: pricePerBag,
            unitsPerBag: handle.unitsPerBag
          }
        });
        
        console.log(`✅ Updated ${handle.name}: dona=${handle.pricePerPiece}$, qop=${pricePerBag}$, 1 qop=${handle.unitsPerBag} ta`);
      } else {
        console.log(`❌ Product not found: ${handle.name}`);
      }
    }
    
    // 38mm Krishkalar - donasini 0.10, 1000 dona/qop
    const caps38 = [
      { name: 'Qopqoq 38 Ko\'k', pricePerPiece: 0.10, unitsPerBag: 1000 },
      { name: 'Qopqoq 38 Sariq', pricePerPiece: 0.10, unitsPerBag: 1000 },
      { name: 'Qopqoq 38 Yashil', pricePerPiece: 0.10, unitsPerBag: 1000 },
      { name: 'Qopqoq 38 Oq', pricePerPiece: 0.10, unitsPerBag: 1000 },
      { name: 'Qopqoq 38 Qizil', pricePerPiece: 0.10, unitsPerBag: 1000 }
    ];
    
    for (const cap of caps38) {
      const product = await prisma.product.findFirst({
        where: { name: cap.name }
      });
      
      if (product) {
        const pricePerBag = cap.pricePerPiece * cap.unitsPerBag; // 0.10 * 1000 = 100
        
        await prisma.product.update({
          where: { id: product.id },
          data: {
            pricePerPiece: cap.pricePerPiece,
            pricePerBag: pricePerBag,
            unitsPerBag: cap.unitsPerBag
          }
        });
        
        console.log(`✅ Updated ${cap.name}: dona=${cap.pricePerPiece}$, qop=${pricePerBag}$, 1 qop=${cap.unitsPerBag} ta`);
      } else {
        console.log(`❌ Product not found: ${cap.name}`);
      }
    }
    
    console.log('\n✅ All 38mm products updated successfully!');
    
  } catch (error) {
    console.error('Error updating prices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

update38mmPrices();
