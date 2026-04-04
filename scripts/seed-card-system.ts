import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCardSystem() {
  try {
    console.log('🌱 Kart tizimi uchun test ma\'lumotlarini yaratish...');

    // 1. Mahsulot turlarini yaratish
    console.log('📦 Mahsulot turlari yaratilmoqda...');
    const productTypes = [
      { name: 'Preform', description: 'PET preform mahsulotlari', defaultCard: 'Standart' },
      { name: 'Qop', description: 'Turli xil qoplar', defaultCard: 'Standart' },
      { name: 'Qopqoq', description: 'Qopqoq mahsulotlari', defaultCard: 'Standart' },
      { name: 'Stiker', description: 'Brend stikerlar', defaultCard: 'Premium' },
      { name: 'Aksessuar', description: 'Qo\'shhimcha aksessuarlar', defaultCard: 'Luxury' }
    ];

    for (const type of productTypes) {
      await prisma.$executeRaw`
        INSERT OR REPLACE INTO ProductType (id, name, description, defaultCard, active, createdAt, updatedAt)
        VALUES (
          lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))),
          ${type.name},
          ${type.description},
          ${type.defaultCard},
          true,
          datetime('now'),
          datetime('now')
        )
      `;
      console.log(`✅ ${type.name} turi yaratildi`);
    }

    // 2. Kartlarni yaratish
    console.log('\n🃏 Kartlar yaratilmoqda...');
    const cards = [
      { name: 'Standart', description: 'Oddiy kart qadoq', price: 0 },
      { name: 'Premium', description: 'Sifatli kart qadoq', price: 5.00 },
      { name: 'Ekologik', description: 'Ekologik toza kart', price: 3.00 },
      { name: 'Luxury', description: 'Hashamatli kart qadoq', price: 10.00 }
    ];

    for (const card of cards) {
      await prisma.$executeRaw`
        INSERT OR REPLACE INTO Card (id, name, description, price, active, createdAt, updatedAt)
        VALUES (
          lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))),
          ${card.name},
          ${card.description},
          ${card.price},
          true,
          datetime('now'),
          datetime('now')
        )
      `;
      console.log(`✅ ${card.name} karti yaratildi`);
    }

    // 3. Test mahsulotlarni yaratish
    console.log('\n📦 Test mahsulotlar yaratilmoqda...');
    const testProducts = [
      // Preformlar
      { name: '15g Preform', bagType: '15G', unitsPerBag: 1000, pricePerBag: 25.00, typeName: 'Preform' },
      { name: '20g Preform', bagType: '20G', unitsPerBag: 1000, pricePerBag: 28.00, typeName: 'Preform' },
      { name: '25g Preform', bagType: '25G', unitsPerBag: 1000, pricePerBag: 32.00, typeName: 'Preform' },
      
      // Qoplar
      { name: '5kg Qop', bagType: '5KG', unitsPerBag: 1, pricePerBag: 15.00, typeName: 'Qop' },
      { name: '10kg Qop', bagType: '10KG', unitsPerBag: 1, pricePerBag: 25.00, typeName: 'Qop' },
      { name: '20kg Qop', bagType: '20KG', unitsPerBag: 1, pricePerBag: 40.00, typeName: 'Qop' },
      
      // Qopqoqlar
      { name: 'Oddiy Qopqoq', bagType: 'QOPQOQ', unitsPerBag: 100, pricePerBag: 5.00, typeName: 'Qopqoq' },
      { name: 'Sifatli Qopqoq', bagType: 'QOPQOQ', unitsPerBag: 100, pricePerBag: 8.00, typeName: 'Qopqoq' },
      { name: 'Hashamatli Qopqoq', bagType: 'QOPQOQ', unitsPerBag: 100, pricePerBag: 12.00, typeName: 'Qopqoq' },
      
      // Stikerlar
      { name: 'Brend Stiker', bagType: 'STIKER', unitsPerBag: 50, pricePerBag: 2.00, typeName: 'Stiker' },
      { name: 'ECO Stiker', bagType: 'STIKER', unitsPerBag: 50, pricePerBag: 2.50, typeName: 'Stiker' },
      { name: 'Oltin Stiker', bagType: 'STIKER', unitsPerBag: 50, pricePerBag: 5.00, typeName: 'Stiker' },
      
      // Aksessuarlar
      { name: 'Gift Box', bagType: 'BOX', unitsPerBag: 20, pricePerBag: 15.00, typeName: 'Aksessuar' }
    ];

    for (const product of testProducts) {
      // Mahsulot turi ID sini olish
      const productType = await prisma.$queryRaw`
        SELECT id FROM ProductType WHERE name = ${product.typeName}
      ` as any[];
      
      if (productType.length > 0) {
        await prisma.$executeRaw`
          INSERT OR REPLACE INTO Product (
            id, name, bagType, unitsPerBag, minStockLimit, optimalStock, maxCapacity,
            currentStock, pricePerBag, productionCost, isParent, productTypeId, active, createdAt, updatedAt
          ) VALUES (
            lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))),
            ${product.name},
            ${product.bagType},
            ${product.unitsPerBag},
            50,
            200,
            1000,
            100,
            ${product.pricePerBag},
            0,
            false,
            ${productType[0].id},
            true,
            datetime('now'),
            datetime('now')
          )
        `;
        console.log(`✅ ${product.name} mahsuloti yaratildi`);
      }
    }

    // 4. Kartlarga mahsulotlarni qo'shish
    console.log('\n🃏 Kartlarga mahsulotlar qo\'shilmoqda...');
    
    // Standart kart
    await addProductsToCard('Standart', [
      '15g Preform', '20g Preform', '5kg Qop', 'Oddiy Qopqoq'
    ]);
    
    // Premium kart
    await addProductsToCard('Premium', [
      '15g Preform', '20g Preform', '5kg Qop', 'Sifatli Qopqoq', 'Brend Stiker'
    ]);
    
    // Ekologik kart
    await addProductsToCard('Ekologik', [
      '15g Preform', '20g Preform', '5kg Qop', 'ECO Stiker'
    ]);
    
    // Luxury kart
    await addProductsToCard('Luxury', [
      '15g Preform', '20g Preform', '10kg Qop', 'Hashamatli Qopqoq', 'Oltin Stiker', 'Gift Box'
    ]);

    console.log('\n🎉 Kart tizimi muvaffaqiyatli yaratildi!');

  } catch (error) {
    console.error('❌ Xatolik yuz berdi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function addProductsToCard(cardName: string, productNames: string[]) {
  const card = await prisma.$queryRaw`
    SELECT id FROM Card WHERE name = ${cardName}
  ` as any[];

  if (card.length === 0) return;

  for (const productName of productNames) {
    const product = await prisma.$queryRaw`
      SELECT id FROM Product WHERE name = ${productName}
    ` as any[];

    if (product.length > 0) {
      await prisma.$executeRaw`
        INSERT OR REPLACE INTO CardProduct (id, cardId, productId, quantity, active, createdAt)
        VALUES (
          lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))),
          ${card[0].id},
          ${product[0].id},
          1,
          true,
          datetime('now')
        )
      `;
      console.log(`  ✅ ${productName} → ${cardName} kartiga qo\'shildi`);
    }
  }
}

// Script ni ishga tushirish
seedCardSystem();

export { seedCardSystem };
