const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { login: 'admin' },
      update: {},
      create: {
        login: 'admin',
        password: adminPassword,
        name: 'Admin',
        role: 'ADMIN',
      },
    });
    console.log('✅ Admin user created: admin');

    // Create test user
    const testPassword = await bcrypt.hash('test123', 10);
    const testUser = await prisma.user.upsert({
      where: { login: 'testuser' },
      update: {},
      create: {
        login: 'testuser',
        password: testPassword,
        name: 'Test User',
        role: 'ADMIN',
      },
    });
    console.log('✅ Test user created: testuser');

    // Create cashier users
    const cashier1Password = await bcrypt.hash('cashier123', 10);
    const cashier1 = await prisma.user.upsert({
      where: { login: 'cashier1' },
      update: {},
      create: {
        login: 'cashier1',
        password: cashier1Password,
        name: 'Kassir 1',
        role: 'CASHIER',
      },
    });
    console.log('✅ Cashier 1 created: cashier1');

    const cashier2Password = await bcrypt.hash('kassir123', 10);
    const cashier2 = await prisma.user.upsert({
      where: { login: 'kassir' },
      update: {},
      create: {
        login: 'kassir',
        password: cashier2Password,
        name: 'Kassir 2',
        role: 'CASHIER',
      },
    });
    console.log('✅ Cashier 2 created: kassir');

    // Create sample products
    const products = [
      {
        name: 'PET Preform 28mm',
        bagType: 'Katta qop',
        unitsPerBag: 1000,
        minStockLimit: 50,
        optimalStock: 200,
        maxCapacity: 500,
        currentStock: 150,
        currentUnits: 150000,
        pricePerBag: 250000,
        productionCost: 200000,
      },
      {
        name: 'PET Preform 38mm',
        bagType: 'O\'rta qop',
        unitsPerBag: 800,
        minStockLimit: 40,
        optimalStock: 150,
        maxCapacity: 400,
        currentStock: 80,
        currentUnits: 64000,
        pricePerBag: 300000,
        productionCost: 240000,
      },
    ];

    for (const product of products) {
      await prisma.product.upsert({
        where: { name: product.name },
        update: {},
        create: product,
      });
    }
    console.log('✅ Sample products created');

    // Create sample customers
    const customers = [
      {
        name: 'Toshkent Savdo',
        phone: '+998901234567',
        category: 'VIP',
        balance: 5000000,
        debt: 0,
      },
      {
        name: 'Samarqand Distribyutor',
        phone: '+998901234568',
        category: 'NORMAL',
        balance: 2000000,
        debt: 500000,
      },
    ];

    for (const customer of customers) {
      await prisma.customer.upsert({
        where: { name: customer.name },
        update: {},
        create: customer,
      });
    }
    console.log('✅ Sample customers created');

    console.log('\n🎉 Seeding completed!');
    console.log('\n📋 Login ma\'lumotlari:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👨‍💼 ADMIN | Login: admin | Parol: admin123');
    console.log('👨‍💼 ADMIN | Login: testuser | Parol: test123');
    console.log('💰 CASHIER | Login: cashier1 | Parol: cashier123');
    console.log('💰 CASHIER | Login: kassir | Parol: kassir123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
