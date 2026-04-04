const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkVariants() {
  try {
    console.log('🔍 Checking products with variants...\n');
    
    const products = await prisma.product.findMany({
      include: {
        variants: true
      }
    });
    
    console.log(`📦 Total products: ${products.length}\n`);
    
    const productsWithVariants = products.filter(p => p.variants && p.variants.length > 0);
    console.log(`✅ Products with variants: ${productsWithVariants.length}\n`);
    
    if (productsWithVariants.length > 0) {
      console.log('📋 Products with variants:\n');
      productsWithVariants.forEach(p => {
        console.log(`  - ${p.name} (ID: ${p.id})`);
        console.log(`    Variants: ${p.variants.length}`);
        p.variants.forEach(v => {
          console.log(`      • ${v.variantName} - $${v.pricePerBag} (Stock: ${v.currentStock})`);
        });
        console.log('');
      });
    } else {
      console.log('⚠️  No products with variants found!');
      console.log('\n📝 Sample products:');
      products.slice(0, 5).forEach(p => {
        console.log(`  - ${p.name} (isParent: ${p.isParent}, variants: ${p.variants?.length || 0})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVariants();
