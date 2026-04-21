const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addMissingCapsAndHandles() {
  try {
    console.log('➕ Qo\'shimcha krishka va ruchkalarni qo\'shish...\n');

    // Product types va categories ni olish
    const krishkaType = await prisma.productType.findFirst({ where: { name: 'Krishka' } }) ||
                        await prisma.productType.create({ data: { name: 'Krishka' } });
    
    const qopqoqType = await prisma.productType.findFirst({ where: { name: 'Qopqoq' } }) ||
                      await prisma.productType.create({ data: { name: 'Qopqoq' } });
    
    const ruchkaType = await prisma.productType.findFirst({ where: { name: 'Ruchka' } }) ||
                      await prisma.productType.create({ data: { name: 'Ruchka' } });

    const standardCategory = await prisma.productCategory.findFirst({ where: { name: 'Standard' } }) ||
                            await prisma.productCategory.create({ data: { name: 'Standard' } });

    // Qo'shimcha krishkalar
    const missingKrishkas = [
      { name: 'Krishka 38mm', stock: 300, price: 100, units: 1000 },
      { name: 'Krishka 48mm', stock: 200, price: 13, units: 1000 },
      { name: 'Krishka 55mm', stock: 100, price: 1000, units: 500 }
    ];

    // Qo'shimcha ruchkalar
    const missingHandles = [
      { name: 'Ruchka 28mm', stock: 2000, price: 500, units: 1000 },
      { name: 'Ruchka 30mm', stock: 1500, price: 400, units: 1000 },
      { name: 'Ruchka 38mm', stock: 3000, price: 150, units: 1000 },
      { name: 'Ruchka 48mm', stock: 2000, price: 17, units: 1000 },
      { name: 'Ruchka 55mm', stock: 800, price: 25, units: 1000 }
    ];

    let addedCount = 0;

    // Krishkalarni qo'shish
    console.log('=== QO\'SHIMCHA KRISHKALAR ===');
    for (const krishka of missingKrishkas) {
      const exists = await prisma.product.findFirst({ where: { name: krishka.name } });
      
      if (!exists) {
        const product = await prisma.product.create({
          data: {
            name: krishka.name,
            bagType: krishka.name.split(' ')[1],
            unitsPerBag: krishka.units,
            currentStock: krishka.stock,
            currentUnits: krishka.stock * krishka.units,
            pricePerBag: krishka.price,
            pricePerPiece: krishka.price / krishka.units,
            minStockLimit: 50,
            optimalStock: 200,
            maxCapacity: 1000,
            productTypeId: krishkaType.id,
            categoryId: standardCategory.id,
            active: true
          }
        });
        
        console.log(`✅ ${product.name} yaratildi - Stock: ${krishka.stock} | Narx: ${krishka.price} so'm/qop`);
        addedCount++;
      } else {
        console.log(`➖ ${krishka.name} allaqachon bor`);
      }
    }

    // Ruchkalarni qo'shish
    console.log('\n=== QO\'SHIMCHA RUCHKALAR ===');
    for (const ruchka of missingHandles) {
      const exists = await prisma.product.findFirst({ where: { name: ruchka.name } });
      
      if (!exists) {
        const product = await prisma.product.create({
          data: {
            name: ruchka.name,
            bagType: ruchka.name.split(' ')[1],
            unitsPerBag: ruchka.units,
            currentStock: ruchka.stock,
            currentUnits: ruchka.stock * ruchka.units,
            pricePerBag: ruchka.price,
            pricePerPiece: ruchka.price / ruchka.units,
            minStockLimit: 50,
            optimalStock: 200,
            maxCapacity: 1000,
            productTypeId: ruchkaType.id,
            categoryId: standardCategory.id,
            active: true
          }
        });
        
        console.log(`✅ ${product.name} yaratildi - Stock: ${ruchka.stock} | Narx: ${ruchka.price} so'm/qop`);
        addedCount++;
      } else {
        console.log(`➖ ${ruchka.name} allaqachon bor`);
      }
    }

    console.log(`\n🎉 ${addedCount} ta qo\'shimcha krishka va ruchka muvaffaqiyatli qo\'shildi!`);

  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingCapsAndHandles();
