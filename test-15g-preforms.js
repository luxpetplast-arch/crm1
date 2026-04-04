// 15g preform uchun test ma'lumotlarini yaratish
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function create15gPreformVariants() {
  try {
    console.log('🔍 15g preform mahsulotini qidirish...');

    // 15g preform mahsulotini topish
    const preform15g = await prisma.product.findFirst({
      where: {
        name: {
          contains: '15g'
        }
      }
    });

    if (!preform15g) {
      console.log('❌ 15g preform mahsuloti topilmadi');
      
      // Yangi 15g preform mahsulotini yaratish
      console.log('➕ Yangi 15g preform mahsuloti yaratilmoqda...');
      const newPreform = await prisma.product.create({
        data: {
          name: '15g Preform',
          bagType: '15G',
          unitsPerBag: 1000,
          minStockLimit: 50,
          optimalStock: 200,
          maxCapacity: 1000,
          currentStock: 0,
          pricePerBag: 25.00,
          isParent: true,
          active: true
        }
      });
      
      console.log('✅ Yangi 15g preform yaratildi:', newPreform.id);
      return;
    }

    console.log('✅ 15g preform topildi:', preform15g.name);

    // Mahsulotni parent qilish
    await prisma.product.update({
      where: { id: preform15g.id },
      data: { isParent: true }
    });

    // Kart turlarini yaratish (to'g'ridan-to'g'ri SQL orqali)
    const cardTypes = [
      { type: 'STANDART', price: 25.00, stock: 100, units: 100000 },
      { type: 'PREMIUM', price: 28.00, stock: 50, units: 50000 },
      { type: 'ECO', price: 26.00, stock: 75, units: 75000 },
      { type: 'LUXURY', price: 32.00, stock: 25, units: 25000 }
    ];

    console.log('🃏 Kart turlari yaratilmoqda...');

    for (const cardType of cardTypes) {
      try {
        // ProductVariant yaratish (to'g'ridan-to'g'ri SQL)
        await prisma.$executeRaw`
          INSERT OR REPLACE INTO ProductVariant (
            id, parentId, variantName, cardType, currentStock, currentUnits, 
            pricePerBag, active, createdAt, updatedAt
          ) VALUES (
            lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))),
            ${preform15g.id},
            ${cardType.type + ' Kart'},
            ${cardType.type},
            ${cardType.stock},
            ${cardType.units},
            ${cardType.price},
            true,
            datetime('now'),
            datetime('now')
          )
        `;
        
        console.log(`✅ ${cardType.type} kart turi yaratildi`);
      } catch (error) {
        console.log(`⚠️ ${cardType.type} uchun xatolik:`, error.message);
      }
    }

    // Natijani tekshirish
    const variants = await prisma.$queryRaw`
      SELECT id, variantName, cardType, pricePerBag, currentStock, currentUnits 
      FROM ProductVariant 
      WHERE parentId = ${preform15g.id}
    `;

    console.log('\n📋 Yaratilgan variantlar:');
    variants.forEach(variant => {
      console.log(`  🃏 ${variant.cardType}: $${variant.pricePerBag}/qop, ${variant.currentStock} qop`);
    });

  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }
}

create15gPreformVariants();
