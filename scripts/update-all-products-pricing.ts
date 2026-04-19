import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mahsulot narxlarini yangilash ma'lumotlari
const productUpdates = [
  // 21 gr preformlar
  {
    searchName: '21gr',
    unitsPerBag: 15000,
    pricePerPiece: 0.04,
    pricePerBag: 600.00,
    description: '21 gr preformlar'
  },
  // 30 gr preformlar
  {
    searchName: '30gr',
    unitsPerBag: 10000,
    pricePerPiece: 0.057,
    pricePerBag: 570.00,
    description: '30 gr preformlar'
  },
  // 36 gr preformlar
  {
    searchName: '36gr',
    unitsPerBag: 10000,
    pricePerPiece: 0.0685, // 685 / 10000
    pricePerBag: 685.00,
    description: '36 gr preformlar'
  }
];

// KR (kapsula/ruchka) mahsulotlarini alohida yangilash
const krProductUpdates = [
  // 28 bezgaz (qopqoq)
  {
    searchName: '28',
    searchExclude: ['gaz', 'DKM', 'Ruchka', 'ruchka'],
    unitsPerBag: 5000,
    pricePerPiece: 0.007,
    pricePerBag: 35.00,
    description: '28 bezgaz qopqoqlar'
  },
  // 28 gazlik
  {
    searchName: '28',
    searchInclude: ['gaz'],
    searchExclude: ['DKM'],
    unitsPerBag: 6000,
    pricePerPiece: 0.008,
    pricePerBag: 48.00,
    description: '28 gazlik qopqoqlar'
  },
  // 28 OKM (o'rta katta miqdor - 6000)
  {
    searchName: '28',
    searchInclude: ['OKM', 'Okm', 'okm'],
    unitsPerBag: 6000,
    pricePerPiece: 0.007, // 42 / 6000
    pricePerBag: 42.00,
    description: '28 OKM qopqoqlar'
  },
  // 28 DKM
  {
    searchName: '28',
    searchInclude: ['DKM', 'Dkm', 'dkm'],
    unitsPerBag: 4000,
    pricePerPiece: 0.012, // 48 / 4000
    pricePerBag: 48.00,
    description: '28 DKM qopqoqlar'
  }
];

async function updateProductPricing() {
  try {
    console.log('🔄 Mahsulot narxlarini yangilash...\n');

    // 1. Preformlarni yangilash (21gr, 30gr, 36gr)
    for (const update of productUpdates) {
      console.log(`📦 ${update.description} yangilash...`);
      
      const products = await prisma.product.findMany({
        where: {
          name: {
            contains: update.searchName
          }
        }
      });

      console.log(`   Topildi: ${products.length} ta mahsulot`);

      for (const product of products) {
        const currentTotalUnits = product.currentUnits || product.currentStock * update.unitsPerBag;
        const newBagCount = currentTotalUnits / update.unitsPerBag;

        await prisma.product.update({
          where: { id: product.id },
          data: {
            unitsPerBag: update.unitsPerBag,
            pricePerBag: update.pricePerBag,
            pricePerPiece: update.pricePerPiece,
            currentStock: newBagCount,
            currentUnits: currentTotalUnits,
            minStockLimit: Math.ceil(newBagCount * 0.2),
            optimalStock: Math.ceil(newBagCount * 0.5),
            maxCapacity: Math.ceil(newBagCount * 1.5)
          }
        });

        console.log(`   ✅ ${product.name}: ${newBagCount} qop × ${update.unitsPerBag} = ${currentTotalUnits} dona | $${update.pricePerBag}/qop`);
      }
    }

    // 2. KR mahsulotlarini yangilash
    console.log('\n📦 KR (qopqoqlar) mahsulotlarini yangilash...\n');

    for (const update of krProductUpdates) {
      console.log(`🔍 ${update.description} qidirilmoqda...`);
      
      // Barcha 28mm qopqoqlarni olish
      const allProducts = await prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: '28' } },
            { name: { contains: 'Qopqoq 28' } }
          ]
        }
      });

      // Filter qilish
      let filteredProducts = allProducts;
      
      // Include filter
      if (update.searchInclude) {
        filteredProducts = filteredProducts.filter(p => 
          update.searchInclude.some(term => 
            p.name.toLowerCase().includes(term.toLowerCase())
          )
        );
      }
      
      // Exclude filter
      if (update.searchExclude) {
        filteredProducts = filteredProducts.filter(p => 
          !update.searchExclude.some(term => 
            p.name.toLowerCase().includes(term.toLowerCase())
          )
        );
      }

      console.log(`   Topildi: ${filteredProducts.length} ta mahsulot`);

      for (const product of filteredProducts) {
        const currentTotalUnits = product.currentUnits || product.currentStock * update.unitsPerBag;
        const newBagCount = currentTotalUnits / update.unitsPerBag;

        await prisma.product.update({
          where: { id: product.id },
          data: {
            unitsPerBag: update.unitsPerBag,
            pricePerBag: update.pricePerBag,
            pricePerPiece: update.pricePerPiece,
            currentStock: newBagCount,
            currentUnits: currentTotalUnits,
            minStockLimit: Math.ceil(newBagCount * 0.2),
            optimalStock: Math.ceil(newBagCount * 0.5),
            maxCapacity: Math.ceil(newBagCount * 1.5)
          }
        });

        console.log(`   ✅ ${product.name}: ${newBagCount} qop × ${update.unitsPerBag} = ${currentTotalUnits} dona | $${update.pricePerBag}/qop`);
      }
    }

    console.log('\n🎉 Barcha mahsulotlar muvaffaqiyatli yangilandi!');

    // Natijalarni ko'rsatish
    console.log('\n📊 YANGILANGAN PREFORMLAR:');
    const preforms = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: '21gr' } },
          { name: { contains: '30gr' } },
          { name: { contains: '36gr' } }
        ]
      },
      select: {
        name: true,
        currentStock: true,
        currentUnits: true,
        unitsPerBag: true,
        pricePerBag: true,
        pricePerPiece: true
      }
    });
    preforms.forEach(p => {
      console.log(`   ${p.name}: ${p.currentStock} qop × ${p.unitsPerBag} = ${p.currentUnits} dona | $${p.pricePerBag}/qop, $${p.pricePerPiece}/dona`);
    });

    console.log('\n📊 YANGILANGAN QOPQOQLAR (28mm):');
    const caps = await prisma.product.findMany({
      where: {
        name: { contains: 'Qopqoq 28' }
      },
      select: {
        name: true,
        currentStock: true,
        currentUnits: true,
        unitsPerBag: true,
        pricePerBag: true,
        pricePerPiece: true
      }
    });
    caps.forEach(p => {
      console.log(`   ${p.name}: ${p.currentStock} qop × ${p.unitsPerBag} = ${p.currentUnits} dona | $${p.pricePerBag}/qop, $${p.pricePerPiece}/dona`);
    });

  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script ni ishga tushirish
updateProductPricing();

export { updateProductPricing };
