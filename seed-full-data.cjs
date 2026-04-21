const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seedFullData() {
  try {
    console.log('🌱 To\'liq ma\'lumotlar bazasini yaratish...');

    // 1. Userlar (allaqachon bor, lekin tekshiramiz)
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { login: 'admin@aziztrades.com' },
      update: {},
      create: {
        login: 'admin@aziztrades.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'ADMIN',
        active: true,
      },
    });

    const cashierPassword = await bcrypt.hash('cashier123', 10);
    const cashier = await prisma.user.upsert({
      where: { login: 'cashier' },
      update: {},
      create: {
        login: 'cashier',
        password: cashierPassword,
        name: 'Kassir',
        role: 'CASHIER',
        active: true,
      },
    });

    console.log('✅ Userlar yaratildi');

    // 2. Mahsulot turlari
    const productTypes = await Promise.all([
      prisma.productType.upsert({
        where: { name: 'Preform' },
        update: {},
        create: { name: 'Preform', description: 'PET preform mahsulotlari' }
      }),
      prisma.productType.upsert({
        where: { name: 'Krishka' },
        update: {},
        create: { name: 'Krishka', description: 'Plastik krishkalar' }
      }),
      prisma.productType.upsert({
        where: { name: 'Ruchka' },
        update: {},
        create: { name: 'Ruchka', description: 'Plastik ruchkalar' }
      })
    ]);

    console.log('✅ Mahsulot turlari yaratildi');

    // 3. Mahsulotlar
    const products = await Promise.all([
      // Preform mahsulotlari
      prisma.product.upsert({
        where: { name: 'Preform 0.5L' },
        update: {},
        create: {
          name: 'Preform 0.5L',
          bagType: '0.5L',
          unitsPerBag: 1000,
          pricePerBag: 2500000,
          pricePerPiece: 2500,
          currentStock: 50000,
          currentUnits: 50000000,
          minStockLimit: 10000,
          optimalStock: 30000,
          maxCapacity: 100000,
          productTypeId: productTypes[0].id,
          active: true
        }
      }),
      prisma.product.upsert({
        where: { name: 'Preform 1L' },
        update: {},
        create: {
          name: 'Preform 1L',
          bagType: '1L',
          unitsPerBag: 500,
          pricePerBag: 3000000,
          pricePerPiece: 6000,
          currentStock: 25000,
          currentUnits: 12500000,
          minStockLimit: 5000,
          optimalStock: 20000,
          maxCapacity: 50000,
          productTypeId: productTypes[0].id,
          active: true
        }
      }),
      prisma.product.upsert({
        where: { name: 'Preform 2L' },
        update: {},
        create: {
          name: 'Preform 2L',
          bagType: '2L',
          unitsPerBag: 250,
          pricePerBag: 3500000,
          pricePerPiece: 14000,
          currentStock: 15000,
          currentUnits: 3750000,
          minStockLimit: 3000,
          optimalStock: 12000,
          maxCapacity: 30000,
          productTypeId: productTypes[0].id,
          active: true
        }
      }),
      // Krishka mahsulotlari
      prisma.product.upsert({
        where: { name: 'Krishka 28mm' },
        update: {},
        create: {
          name: 'Krishka 28mm',
          bagType: '28mm',
          unitsPerBag: 2000,
          pricePerBag: 800000,
          pricePerPiece: 400,
          currentStock: 100000,
          currentUnits: 200000000,
          minStockLimit: 20000,
          optimalStock: 80000,
          maxCapacity: 200000,
          productTypeId: productTypes[1].id,
          active: true
        }
      }),
      prisma.product.upsert({
        where: { name: 'Krishka 30mm' },
        update: {},
        create: {
          name: 'Krishka 30mm',
          bagType: '30mm',
          unitsPerBag: 1800,
          pricePerBag: 900000,
          pricePerPiece: 500,
          currentStock: 90000,
          currentUnits: 162000000,
          minStockLimit: 18000,
          optimalStock: 72000,
          maxCapacity: 180000,
          productTypeId: productTypes[1].id,
          active: true
        }
      }),
      // Ruchka mahsulotlari
      prisma.product.upsert({
        where: { name: 'Ruchka Standart' },
        update: {},
        create: {
          name: 'Ruchka Standart',
          bagType: 'Standart',
          unitsPerBag: 1000,
          pricePerBag: 500000,
          pricePerPiece: 500,
          currentStock: 50000,
          currentUnits: 50000000,
          minStockLimit: 10000,
          optimalStock: 40000,
          maxCapacity: 100000,
          productTypeId: productTypes[2].id,
          active: true
        }
      })
    ]);

    console.log('✅ Mahsulotlar yaratildi');

    // 4. Mijozlar
    const customers = await Promise.all([
      prisma.customer.upsert({
        where: { email: 'azizbek@example.com' },
        update: {},
        create: {
          name: 'Azizbek Karimov',
          email: 'azizbek@example.com',
          phone: '+998901234567',
          address: 'Toshkent shahar, Chilonzor tumani',
          category: 'VIP',
          balance: 0,
          balanceUZS: 0,
          balanceUSD: 0,
          debt: 0,
          debtUZS: 0,
          debtUSD: 0,
          creditLimit: 10000000,
          paymentTermDays: 30,
          discountPercent: 5,
          pricePerBag: 2500000,
          notificationsEnabled: true
        }
      }),
      prisma.customer.upsert({
        where: { email: 'jahongir@example.com' },
        update: {},
        create: {
          name: 'Jahongir Alimov',
          email: 'jahongir@example.com',
          phone: '+998902345678',
          address: 'Toshkent shahar, Mirzo Ulug\'bek tumani',
          category: 'Regular',
          balance: 0,
          balanceUZS: 0,
          balanceUSD: 0,
          debt: 0,
          debtUZS: 0,
          debtUSD: 0,
          creditLimit: 5000000,
          paymentTermDays: 15,
          discountPercent: 2,
          pricePerBag: 2600000,
          notificationsEnabled: true
        }
      }),
      prisma.customer.upsert({
        where: { email: 'dilnoza@example.com' },
        update: {},
        create: {
          name: 'Dilnoza Raximova',
          email: 'dilnoza@example.com',
          phone: '+998903456789',
          address: 'Toshkent shahar, Yashnobod tumani',
          category: 'Regular',
          balance: 0,
          balanceUZS: 0,
          balanceUSD: 0,
          debt: 0,
          debtUZS: 0,
          debtUSD: 0,
          creditLimit: 3000000,
          paymentTermDays: 7,
          discountPercent: 0,
          pricePerBag: 2700000,
          notificationsEnabled: true
        }
      }),
      prisma.customer.create({
        data: {
          name: 'Sardor Kamolov',
          email: null, // Email yo'q, shu sababli create ishlatamiz
          phone: '+998904567890',
          address: 'Toshkent shahar, Shayxontohur tumani',
          category: 'VIP',
          balance: 0,
          balanceUZS: 0,
          balanceUSD: 0,
          debt: 0,
          debtUZS: 0,
          debtUSD: 0,
          creditLimit: 15000000,
          paymentTermDays: 45,
          discountPercent: 8,
          pricePerBag: 2400000,
          notificationsEnabled: true
        }
      }),
      prisma.customer.create({
        data: {
          name: 'Gulnora Karimova',
          email: null, // Email yo'q, shu sababli create ishlatamiz
          phone: '+998905678901',
          address: 'Toshkent shahar, Olmazor tumani',
          category: 'Regular',
          balance: 0,
          balanceUZS: 0,
          balanceUSD: 0,
          debt: 0,
          debtUZS: 0,
          debtUSD: 0,
          creditLimit: 4000000,
          paymentTermDays: 14,
          discountPercent: 3,
          pricePerBag: 2650000,
          notificationsEnabled: true
        }
      })
    ]);

    console.log('✅ Mijozlar yaratildi');

    // 5. Sotuvlar (oxirgi 10 kunlik)
    const sales = [];
    const today = new Date();
    
    for (let i = 0; i < 20; i++) {
      const saleDate = new Date(today);
      saleDate.setDate(today.getDate() - i);
      
      const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 10) + 1;
      const totalAmount = quantity * randomProduct.pricePerBag;
      
      const sale = await prisma.sale.create({
        data: {
          receiptNumber: i + 1,
          customerId: randomCustomer.id,
          productId: randomProduct.id,
          userId: cashier.id,
          quantity: quantity,
          pricePerBag: randomProduct.pricePerBag,
          bagType: randomProduct.bagType,
          totalAmount: totalAmount,
          paidAmount: totalAmount,
          currency: 'UZS',
          paymentStatus: 'PAID',
          paymentDetails: JSON.stringify({ method: 'cash', paidAt: saleDate }),
          driverPaymentStatus: 'PENDING',
          factoryShare: Math.floor(totalAmount * 0.7),
          customerShare: Math.floor(totalAmount * 0.3),
          isKocha: Math.random() > 0.5,
          createdAt: saleDate
        }
      });
      
      sales.push(sale);
    }

    console.log('✅ Sotuvlar yaratildi');

    // 6. Xarajatlar
    const expenses = await Promise.all([
      prisma.expense.create({
        data: {
          amount: 5000000,
          currency: 'UZS',
          category: 'UTILITIES',
          description: 'Elektr energiyasi to\'lovi',
          userId: admin.id,
          createdAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000)
        }
      }),
      prisma.expense.create({
        data: {
          amount: 3000000,
          currency: 'UZS',
          category: 'SUPPLIES',
          description: 'Kanselyariya tovarlari',
          userId: admin.id,
          createdAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
        }
      }),
      prisma.expense.create({
        data: {
          amount: 7000000,
          currency: 'UZS',
          category: 'RENT',
          description: 'Ijara to\'lovi',
          userId: admin.id,
          createdAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000)
        }
      })
    ]);

    console.log('✅ Xarajatlar yaratildi');

    console.log('\n🎉 BARCHA MA\'LUMOTLAR MUVAFFAQIYATLI YARATILDI!');
    console.log('\n📊 YARATILGAN MA\'LUMOTLAR:');
    console.log(`👤 Userlar: 2 ta`);
    console.log(`📦 Mahsulotlar: ${products.length} ta`);
    console.log(`👥 Mijozlar: ${customers.length} ta`);
    console.log(`💰 Sotuvlar: ${sales.length} ta`);
    console.log(`💳 Xarajatlar: ${expenses.length} ta`);

  } catch (error) {
    console.error('❌ Xatolik:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedFullData();
