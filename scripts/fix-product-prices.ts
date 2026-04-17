import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixProductPrices() {
  console.log('=== Fix Product Prices ===');
  
  try {
    // 1. Get all products with pricePerBag = 0
    console.log('1. Finding products with pricePerBag = 0...');
    const productsWithZeroPrice = await prisma.product.findMany({
      where: {
        pricePerBag: 0
      }
    });
    
    console.log(`Found ${productsWithZeroPrice.length} products with pricePerBag = 0`);
    
    if (productsWithZeroPrice.length > 0) {
      // 2. Update each product with a reasonable price
      console.log('2. Updating product prices...');
      
      for (const product of productsWithZeroPrice) {
        // Calculate reasonable price based on product type
        let newPrice = 1000; // Default price
        
        if (product.name.toLowerCase().includes('15gr')) {
          newPrice = 1000; // 15gr products
        } else if (product.name.toLowerCase().includes('28mm')) {
          newPrice = 2000; // 28mm products
        } else if (product.name.toLowerCase().includes('38mm')) {
          newPrice = 3000; // 38mm products
        } else if (product.name.toLowerCase().includes('48mm')) {
          newPrice = 4000; // 48mm products
        } else if (product.name.toLowerCase().includes('55mm')) {
          newPrice = 5000; // 55mm products
        }
        
        console.log(`Updating ${product.name}: ${product.pricePerBag} -> ${newPrice}`);
        
        await prisma.product.update({
          where: { id: product.id },
          data: {
            pricePerBag: newPrice,
            pricePerPiece: newPrice / product.unitsPerBag
          }
        });
      }
      
      console.log('✅ Product prices updated successfully!');
      
      // 3. Verify updates
      console.log('3. Verifying updates...');
      const updatedProducts = await prisma.product.findMany({
        where: {
          pricePerBag: 0
        }
      });
      
      if (updatedProducts.length === 0) {
        console.log('✅ All products now have valid prices!');
      } else {
        console.log(`⚠️ Still ${updatedProducts.length} products with pricePerBag = 0`);
      }
      
      // 4. Show sample of updated products
      console.log('4. Sample of updated products:');
      const sampleProducts = await prisma.product.findMany({
        take: 5,
        orderBy: { name: 'asc' }
      });
      
      sampleProducts.forEach((product, index) => {
        console.log(`Product ${index + 1}:`);
        console.log(`  Name: ${product.name}`);
        console.log(`  Price per bag: ${product.pricePerBag}`);
        console.log(`  Price per piece: ${product.pricePerPiece}`);
        console.log(`  Units per bag: ${product.unitsPerBag}`);
      });
      
    } else {
      console.log('✅ All products already have valid prices!');
    }
    
  } catch (error) {
    console.error('❌ Error fixing product prices:', error);
  } finally {
    await prisma.$disconnect();
  }
  
  console.log('=== Fix Complete ===');
}

fixProductPrices();
