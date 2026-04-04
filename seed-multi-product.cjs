const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedData() {
  try {
    console.log('🌱 Seeding multi-product structure...');

    // 1. ProductType larni yaratish (agar yo'q bo'lsa)
    const preformType = await prisma.productType.upsert({
      where: { name: 'Preform' },
      update: {},
      create: {
        name: 'Preform',
        description: 'Preform mahsulotlari',
        active: true
      }
    });

    const qopqoqType = await prisma.productType.upsert({
      where: { name: 'Qopqoq' },
      update: {},
      create: {
        name: 'Qopqoq',
        description: 'Qopqoq mahsulotlari',
        active: true
      }
    });

    const qopType = await prisma.productType.upsert({
      where: { name: 'Qop' },
      update: {},
      create: {
        name: 'Qop',
        description: 'Qop mahsulotlari',
        active: true
      }
    });

    console.log('✅ ProductTypes created');

    // 2. ProductCategory larni yaratish
    const preformCategory = await prisma.productCategory.create({
      data: {
        name: 'Preform',
        description: 'Preform mahsulotlari',
        icon: '🔷',
        color: '#3B82F6',
        productTypeId: preformType.id,
        active: true
      }
    });

    const qopqoqCategory = await prisma.productCategory.create({
      data: {
        name: 'Qopqoq',
        description: 'Qopqoq mahsulotlari',
        icon: '🔒',
        color: '#8B5CF6',
        productTypeId: qopqoqType.id,
        active: true
      }
    });

    const qopCategory = await prisma.productCategory.create({
      data: {
        name: 'Qop',
        description: 'Qop mahsulotlari',
        icon: '📦',
        color: '#10B981',
        productTypeId: qopType.id,
        active: true
      }
    });

    console.log('✅ ProductCategories created');

    // 3. ProductSize larni yaratish
    // Preform o'lchamlari
    await prisma.productSize.createMany({
      data: [
        { name: '15gr', description: '15 gram preform', unit: 'gr', value: 15, categoryId: preformCategory.id, active: true },
        { name: '25gr', description: '25 gram preform', unit: 'gr', value: 25, categoryId: preformCategory.id, active: true },
        { name: '50gr', description: '50 gram preform', unit: 'gr', value: 50, categoryId: preformCategory.id, active: true }
      ]
    });

    // Qopqoq o'lchamlari
    await prisma.productSize.createMany({
      data: [
        { name: '15gr', description: '15 gram qopqoq', unit: 'gr', value: 15, categoryId: qopqoqCategory.id, active: true },
        { name: '25gr', description: '25 gram qopqoq', unit: 'gr', value: 25, categoryId: qopqoqCategory.id, active: true },
        { name: '50gr', description: '50 gram qopqoq', unit: 'gr', value: 50, categoryId: qopqoqCategory.id, active: true }
      ]
    });

    // Qop o'lchamlari
    await prisma.productSize.createMany({
      data: [
        { name: '5kg', description: '5 kilogram qop', unit: 'kg', value: 5, categoryId: qopCategory.id, active: true },
        { name: '10kg', description: '10 kilogram qop', unit: 'kg', value: 10, categoryId: qopCategory.id, active: true },
        { name: '25kg', description: '25 kilogram qop', unit: 'kg', value: 25, categoryId: qopCategory.id, active: true }
      ]
    });

    console.log('✅ ProductSizes created');

    // 4. Namuna mahsulotlar yaratish
    // 15gr Preformlar
    const preform15grSizes = await prisma.productSize.findMany({
      where: { categoryId: preformCategory.id, name: '15gr' }
    });

    if (preform15grSizes.length > 0) {
      await prisma.product.createMany({
        data: [
          {
            name: '15gr Preform Gidro',
            bagType: '15G',
            unitsPerBag: 1000,
            minStockLimit: 50,
            optimalStock: 200,
            maxCapacity: 1000,
            currentStock: 150,
            pricePerBag: 25.00,
            productionCost: 15.00,
            categoryId: preformCategory.id,
            sizeId: preform15grSizes[0].id,
            subType: 'gidro',
            active: true
          },
          {
            name: '15gr Preform Karbonat',
            bagType: '15G',
            unitsPerBag: 1000,
            minStockLimit: 50,
            optimalStock: 200,
            maxCapacity: 1000,
            currentStock: 120,
            pricePerBag: 27.00,
            productionCost: 16.00,
            categoryId: preformCategory.id,
            sizeId: preform15grSizes[0].id,
            subType: 'karbonat',
            active: true
          }
        ]
      });
    }

    console.log('✅ Sample products created');
    console.log('🎉 Multi-product structure seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedData();
