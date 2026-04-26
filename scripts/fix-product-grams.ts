import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Ombordagi barcha preform mahsulotlarini to'g'ri gram bilan bog'lash
 * Bu skript mahsulot nomidan gramajni aniqlab, sizeId maydonini yangilaydi
 */
async function fixProductGrams() {
  console.log('=== Ombordagi mahsulotlarni gram bilan boglash ===\n');

  try {
    // 1. Barcha ProductSize larni olish
    const productSizes = await prisma.productSize.findMany({
      include: { category: true }
    });
    console.log(`Mavjud ProductSize lar soni: ${productSizes.length}`);

    // Gram -> SizeId map yaratish
    const gramToSizeMap: { [key: string]: string } = {};
    for (const size of productSizes) {
      const gramKey = `${Math.floor(size.value)}gr`;
      gramToSizeMap[gramKey] = size.id;
      // Alternativ kalitlar
      gramToSizeMap[`${Math.floor(size.value)}g`] = size.id;
      gramToSizeMap[`${Math.floor(size.value)}`] = size.id;
    }
    console.log('Gram -> Size map yaratildi:', Object.keys(gramToSizeMap).filter(k => k.endsWith('gr')).join(', '));

    // 2. Barcha preform omboridagi mahsulotlarni olish
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { warehouse: 'preform' },
          { name: { contains: 'gr' } },
          { name: { contains: 'preform' } }
        ],
        active: true
      }
    });

    console.log(`\nJami tekshiriladigan mahsulotlar: ${products.length}\n`);

    let updated = 0;
    let alreadyCorrect = 0;
    let failed = 0;
    let noGramFound = 0;

    // 3. Har bir mahsulotni tekshirish
    for (const product of products) {
      const name = product.name.toLowerCase();

      // Mahsulot nomidan gramajni aniqlash
      // Masalan: "15gr prozrach", "21gr gidro", "26gr yog", "30g sprite"
      const gramMatch = name.match(/(\d+)\s*(gr|g|gramm?)/i);

      if (!gramMatch) {
        console.log(`⚠️  Gram topilmadi: ${product.name}`);
        noGramFound++;
        continue;
      }

      const gramValue = parseInt(gramMatch[1]);
      const gramKey = `${gramValue}gr`;
      const correctSizeId = gramToSizeMap[gramKey];

      if (!correctSizeId) {
        console.log(`❌ Mos ProductSize topilmadi: ${product.name} (gram: ${gramValue})`);
        failed++;
        continue;
      }

      // Agar sizeId allaqachon to'g'ri bo'lsa
      if (product.sizeId === correctSizeId) {
        console.log(`✅ Allaqachon to'g'ri: ${product.name} (${gramValue}gr)`);
        alreadyCorrect++;
        continue;
      }

      // Yangilash kerak
      try {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            sizeId: correctSizeId,
            categoryId: productSizes.find(s => s.id === correctSizeId)?.categoryId || product.categoryId
          }
        });

        const prevSize = product.sizeId ? `(${product.sizeId.slice(0, 8)}...)` : '(yo\'q)';
        console.log(`✅ Yangilandi: ${product.name} ${gramValue}gr - sizeId ${prevSize} -> ${correctSizeId.slice(0, 8)}...`);
        updated++;
      } catch (error) {
        console.log(`❌ Xatolik: ${product.name} -`, error);
        failed++;
      }
    }

    // 4. Statistikani chiqarish
    console.log('\n=== NATIJA ===');
    console.log(`✅ Yangilandi: ${updated} ta`);
    console.log(`✅ Allaqachon to'g'ri: ${alreadyCorrect} ta`);
    console.log(`⚠️  Gram topilmadi: ${noGramFound} ta`);
    console.log(`❌ Xatolik: ${failed} ta`);
    console.log(`Jami: ${products.length} ta mahsulot tekshirildi`);

    // 5. Tekshirish - hali sizeId yo'q mahsulotlar
    const withoutSizeId = await prisma.product.findMany({
      where: {
        OR: [
          { warehouse: 'preform' },
          { name: { contains: 'gr' } }
        ],
        sizeId: null,
        active: true
      }
    });

    if (withoutSizeId.length > 0) {
      console.log(`\n⚠️  Hali sizeId yo'q mahsulotlar (${withoutSizeId.length} ta):`);
      withoutSizeId.forEach(p => console.log(`   - ${p.name}`));
    } else {
      console.log('\n✅ Barcha mahsulotlarda sizeId maydoni to\'ldirilgan!');
    }

  } catch (error) {
    console.error('❌ Xatolik:', error);
  } finally {
    await prisma.$disconnect();
  }

  console.log('\n=== Tugadi ===');
}

fixProductGrams();
