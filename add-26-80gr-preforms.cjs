const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// 26gr va 80gr preform mahsulotlar
const preforms26and80gr = [
  // 26 gr products (12,000 dona = 12 qop)
  { size: '26gr', name: 'Preform 26gr yashil', variant: 'yashil', quantity: 0, bags: 0, unitsPerBag: 1000, pricePerBag: 0, pricePerPiece: 0 },
  { size: '26gr', name: 'Preform 26gr yashil gaz', variant: 'yashil gaz', quantity: 0, bags: 0, unitsPerBag: 1000, pricePerBag: 0, pricePerPiece: 0 },
  
  // 80 gr products (4,000 dona = 4 qop va 3,000 dona = 3 qop)
  { size: '80gr', name: 'Preform 80gr prozrach', variant: 'prozrach', quantity: 0, bags: 0, unitsPerBag: 1000, pricePerBag: 0, pricePerPiece: 0 },
  { size: '80gr', name: 'Preform 80gr prozrach 3000', variant: 'prozrach 3000', quantity: 0, bags: 0, unitsPerBag: 1000, pricePerBag: 0, pricePerPiece: 0 },
  { size: '80gr', name: 'Preform 80gr gidro', variant: 'gidro', quantity: 0, bags: 0, unitsPerBag: 1000, pricePerBag: 0, pricePerPiece: 0 },
  { size: '80gr', name: 'Preform 80gr gidro 3000', variant: 'gidro 3000', quantity: 0, bags: 0, unitsPerBag: 1000, pricePerBag: 0, pricePerPiece: 0 },
  { size: '80gr', name: 'Preform 80gr sayhun', variant: 'sayhun', quantity: 0, bags: 0, unitsPerBag: 1000, pricePerBag: 0, pricePerPiece: 0 },
  { size: '80gr', name: 'Preform 80gr sayhun 3000', variant: 'sayhun 3000', quantity: 0, bags: 0, unitsPerBag: 1000, pricePerBag: 0, pricePerPiece: 0 },
  { size: '80gr', name: 'Preform 80gr siniy', variant: 'siniy', quantity: 0, bags: 0, unitsPerBag: 1000, pricePerBag: 0, pricePerPiece: 0 },
  { size: '80gr', name: 'Preform 80gr siniy 3000', variant: 'siniy 3000', quantity: 0, bags: 0, unitsPerBag: 1000, pricePerBag: 0, pricePerPiece: 0 },
];

async function addPreforms() {
  console.log('📦 26gr va 80gr preform mahsulotlar qo\'shilmoqda...\n');
  
  let addedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (const product of preforms26and80gr) {
    try {
      // Tekshirish - mahsulot bormi
      const existing = await prisma.product.findFirst({
        where: { name: product.name }
      });
      
      if (existing) {
        skippedCount++;
        console.log(`⏭️  ${product.name} allaqachon mavjud`);
        continue;
      }
      
      // Mahsulot qo'shish
      await prisma.product.create({
        data: {
          name: product.name,
          bagType: product.size.toUpperCase(),
          unitsPerBag: product.unitsPerBag,
          minStockLimit: 50,
          optimalStock: 200,
          maxCapacity: 1000,
          currentStock: product.bags,
          currentUnits: product.quantity,
          pricePerBag: product.pricePerBag,
          pricePerPiece: product.pricePerPiece,
          productionCost: 0,
          warehouse: 'preform',
          variantName: product.variant,
          subType: product.variant,
          active: true,
          isParent: false
        }
      });
      
      addedCount++;
      console.log(`✅ ${addedCount}. ${product.name} (${product.size})`);
      
    } catch (error) {
      errorCount++;
      console.log(`❌ ${product.name} - ${error.message}`);
    }
  }
  
  console.log(`\n🎉 ${addedCount} ta mahsulot qo'shildi!`);
  if (skippedCount > 0) {
    console.log(`⏭️  ${skippedCount} ta allaqachon mavjud`);
  }
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} ta xatolik`);
  }
  
  // Jami preform mahsulotlar soni
  const totalPreforms = await prisma.product.count({
    where: { warehouse: 'preform' }
  });
  console.log(`📊 Jami preform mahsulotlar: ${totalPreforms} ta`);
  
  await prisma.$disconnect();
}

addPreforms().catch(async (e) => {
  console.error('❌ Xatolik:', e);
  await prisma.$disconnect();
  process.exit(1);
});
