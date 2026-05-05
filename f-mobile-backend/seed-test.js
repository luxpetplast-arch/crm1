const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('./config/database');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Branch = require('./models/Branch');
const Product = require('./models/Product');
const Customer = require('./models/Customer');

const seedTestData = async () => {
  try {
    console.log('🌱 Test data seeding started...');

    // Wait for database connection
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Branch.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});

    // Create 5 branches
    console.log('📍 Creating 5 branches...');
    const branches = [];
    for (let i = 1; i <= 5; i++) {
      const branch = await Branch.create({
        name: `Filial ${i}`,
        address: `Tashkent, Street ${i}`,
        phone: `+998901234${String(i).padStart(3, '0')}`,
        manager: `Manager ${i}`
      });
      branches.push(branch);
      console.log(`  ✓ Branch ${i} created`);
    }

    // Create admin user
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('101110', 10);
    await User.create({
      username: 'admin',
      password: adminPassword,
      name: 'Administrator',
      role: 'admin',
      isActive: true
    });
    console.log(`  ✓ Admin user created`);

    // Create 5 cashiers
    console.log('👤 Creating 5 cashiers...');
    for (let i = 1; i <= 5; i++) {
      const hashedPassword = await bcrypt.hash('cashier123', 10);
      await User.create({
        username: `cashier${i}`,
        password: hashedPassword,
        name: `Kassir ${i}`,
        role: 'cashier',
        branch: branches[i - 1]._id,
        isActive: true
      });
      console.log(`  ✓ Cashier ${i} created`);
    }

    // Create 10 products
    console.log('📦 Creating 10 products...');
    for (let i = 1; i <= 10; i++) {
      const branch = branches[Math.floor(Math.random() * branches.length)];
      await Product.create({
        name: `Mahsulot ${i}`,
        sku: `SKU-${String(i).padStart(5, '0')}`,
        category: `Kategoriya ${Math.ceil(i / 2)}`,
        stock: Math.floor(Math.random() * 100) + 10,
        costPrice: Math.floor(Math.random() * 50) + 10,
        sellPrice: Math.floor(Math.random() * 100) + 50,
        imeiList: [],
        branch: branch._id,
        currency: 'USD',
        sellCurrency: 'USD'
      });
      console.log(`  ✓ Product ${i} created`);
    }

    // Create 5 customers
    console.log('👥 Creating 5 customers...');
    for (let i = 1; i <= 5; i++) {
      await Customer.create({
        name: `Mijoz ${i}`,
        phone: `+998901234${String(i).padStart(3, '0')}`,
        address: `Address ${i}`,
        debt: Math.floor(Math.random() * 5000000),
        createdAt: new Date()
      });
      console.log(`  ✓ Customer ${i} created`);
    }

    console.log('✅ Test data seeding completed!');
    console.log('📊 Summary:');
    console.log('  - 5 Branches created');
    console.log('  - 1 Admin user created (admin/101110)');
    console.log('  - 5 Cashiers created (cashier1-5/cashier123)');
    console.log('  - 10 Products created');
    console.log('  - 5 Customers created');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
};

seedTestData();
