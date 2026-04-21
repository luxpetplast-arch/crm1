const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCapsAndHandles() {
  try {
    console.log('🔍 Krishka va ruchkalarni tekshirish...\n');
    
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: 'Krishka' } },
          { name: { contains: 'Qopqoq' } },
          { name: { contains: 'Ruchka' } }
        ]
      },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        bagType: true,
        currentStock: true,
        unitsPerBag: true,
        pricePerBag: true,
        pricePerPiece: true,
        productType: {
          select: { name: true }
        }
      }
    });

    console.log(`📦 Jami ${products.length} ta krishka va ruchka topildi:\n`);

    // Krishkalar
    console.log('=== KRISHKALAR ===');
    const krishkas = products.filter(p => p.name.includes('Krishka'));
    krishkas.forEach(product => {
      console.log(`${product.name} | Stock: ${product.currentStock} | Narx: ${product.pricePerBag} so'm/qop`);
    });

    // Qopqoqlar
    console.log('\n=== QOPQOQLAR ===');
    const caps = products.filter(p => p.name.includes('Qopqoq'));
    caps.forEach(product => {
      console.log(`${product.name} | Stock: ${product.currentStock} | Narx: ${product.pricePerBag} so'm/qop`);
    });

    // Ruchkalar
    console.log('\n=== RUCHKALAR ===');
    const handles = products.filter(p => p.name.includes('Ruchka'));
    handles.forEach(product => {
      console.log(`${product.name} | Stock: ${product.currentStock} | Narx: ${product.pricePerBag} so'm/qop`);
    });

    // Kerakli krishka va ruchkalar ro'yxati
    const expectedCaps = [
      'Krishka 28mm',
      'Krishka 30mm',
      'Krishka 38mm',
      'Krishka 48mm',
      'Krishka 55mm'
    ];

    const expectedHandles = [
      'Ruchka 28mm',
      'Ruchka 30mm', 
      'Ruchka 38mm',
      'Ruchka 48mm',
      'Ruchka 55mm'
    ];

    console.log('\n=== KUTILAYOTGAN KRISHKALAR ===');
    expectedCaps.forEach(expected => {
      const found = products.find(p => p.name === expected);
      if (found) {
        console.log(`✅ ${expected} - Bor`);
      } else {
        console.log(`❌ ${expected} - Yo'q`);
      }
    });

    console.log('\n=== KUTILAYOTGAN RUCHKALAR ===');
    expectedHandles.forEach(expected => {
      const found = products.find(p => p.name === expected);
      if (found) {
        console.log(`✅ ${expected} - Bor`);
      } else {
        console.log(`❌ ${expected} - Yo'q`);
      }
    });

    console.log(`\n📊 XULOSA:`);
    console.log(`- Jami krishka va ruchkalar: ${products.length}`);
    console.log(`- Krishkalar: ${krishkas.length}`);
    console.log(`- Qopqoqlar: ${caps.length}`);
    console.log(`- Ruchkalar: ${handles.length}`);

  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCapsAndHandles();
