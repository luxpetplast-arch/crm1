import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed15gPreforms() {
  try {
    console.log('🌱 15g preform variantlarini yaratish...');

    // 15g preform mahsulotini topish yoki yaratish
    let preform15g = await prisma.product.findFirst({
      where: {
        name: {
          contains: '15g',
          mode: 'insensitive'
        }
      }
    });

    if (!preform15g) {
      console.log('❌ 15g preform mahsuloti topilmadi. Avval mahsulotni yarating.');
      return;
    }

    console.log(`📦 15g preform topildi: ${preform15g.name}`);

    // Kart turlari
    const cardTypes = [
      { type: 'STANDART', price: 25.00, stock: 100, units: 10000 },
      { type: 'PREMIUM', price: 28.00, stock: 50, units: 5000 },
      { type: 'ECO', price: 26.00, stock: 75, units: 7500 },
      { type: 'LUXURY', price: 32.00, stock: 25, units: 2500 }
    ];

    // Mavjud variantlarni tekshirish
    const existingVariants = await prisma.productVariant.findMany({
      where: {
        parentId: preform15g.id
      }
    });

    console.log(`🔍 Mavjud variantlar: ${existingVariants.length} ta`);

    // Har bir kart turini yaratish
    for (const cardType of cardTypes) {
      const existingVariant = existingVariants.find(v => v.cardType === cardType.type);
      
      if (existingVariant) {
        console.log(`⚠️ ${cardType.type} varianti allaqachon mavjud. Yangilanmoqda...`);
        
        await prisma.productVariant.update({
          where: { id: existingVariant.id },
          data: {
            pricePerBag: cardType.price,
            currentStock: cardType.stock,
            currentUnits: cardType.units,
            active: true
          }
        });
        
        console.log(`✅ ${cardType.type} varianti yangilandi`);
      } else {
        console.log(`➕ ${cardType.type} varianti yaratilmoqda...`);
        
        const variant = await prisma.productVariant.create({
          data: {
            parentId: preform15g.id,
            variantName: `${cardType.type} Kart`,
            cardType: cardType.type,
            pricePerBag: cardType.price,
            currentStock: cardType.stock,
            currentUnits: cardType.units,
            active: true
          }
        });
        
        console.log(`✅ ${cardType.type} varianti yaratildi: ${variant.id}`);
      }
    }

    // Mahsulotni parent qilish
    await prisma.product.update({
      where: { id: preform15g.id },
      data: {
        isParent: true,
        active: true
      }
    });

    console.log('🎉 15g preform variantlari muvaffaqiyatli yaratildi!');

    // Natijalarni ko'rsatish
    const finalVariants = await prisma.productVariant.findMany({
      where: {
        parentId: preform15g.id
      },
      include: {
        parent: {
          select: {
            name: true
          }
        }
      }
    });

    console.log('\n📋 Yaratilgan variantlar:');
    finalVariants.forEach(variant => {
      console.log(`  🃏 ${variant.cardType}: $${variant.pricePerBag}/qop, ${variant.currentStock} qop, ${variant.currentUnits} dona`);
    });

  } catch (error) {
    console.error('❌ Xatolik yuz berdi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Script ni ishga tushirish
if (require.main === module) {
  seed15gPreforms();
}

export { seed15gPreforms };
