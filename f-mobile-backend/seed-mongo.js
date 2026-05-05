const mongoose = require('mongoose');
const dns = require('dns');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Google DNS ishlatish
dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require('./models/User');
const Branch = require('./models/Branch');
const Product = require('./models/Product');
const Customer = require('./models/Customer');

const seedDB = async () => {
  try {
    console.log('📊 Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✓ Connected to MongoDB');

    // Check if data already exists
    const existingUsers = await User.countDocuments();
    
    if (existingUsers > 0) {
      console.log('✓ Database already has users. Skipping seed to prevent data loss.');
      console.log(`   Existing users: ${existingUsers}`);
      process.exit(0);
    }

    console.log('📝 Seeding database with initial data...');

    // Create branches first
    const branch1 = await Branch.create({
      name: 'Toshkent',
      address: 'Toshkent shahar, Mirzo Ulugbek tumani',
      phone: '+998901234567'
    });

    const branch2 = await Branch.create({
      name: 'Gijduvon',
      address: 'Gijduvon tumani, Bukhara viloyati',
      phone: '+998902345678'
    });

    console.log('✓ Created branches');

    // Hash passwords
    const adminPasswordHash = await bcrypt.hash('101110', 10);
    const cashierPasswordHash = await bcrypt.hash('cashier123', 10);

    // Create users (admin and cashier)
    const adminUser = await User.create({
      username: 'admin',
      name: 'Administrator',
      password: adminPasswordHash,
      role: 'admin'
    });

    const cashierUser = await User.create({
      username: 'cashier',
      name: 'Kassir',
      password: cashierPasswordHash,
      role: 'cashier',
      branch: branch1._id
    });

    console.log('✓ Created users');

    // Create customers
    const customer1 = await Customer.create({
      name: 'Azizbek',
      phone: '+998901234567',
      address: 'Toshkent shahar',
      debt: 0,
      totalPurchase: 0
    });

    const customer2 = await Customer.create({
      name: 'Karim',
      phone: '+998902345678',
      address: 'Gijduvon tumani',
      debt: 0,
      totalPurchase: 0
    });

    const customer3 = await Customer.create({
      name: 'Fatima',
      phone: '+998903456789',
      address: 'Toshkent shahar',
      debt: 0,
      totalPurchase: 0
    });

    console.log('✓ Created customers');

    // Create products
    const product1 = await Product.create({
      name: 'A07',
      category: 'Telefon',
      costPrice: 130,
      sellPrice: 1045,
      stock: 3,
      imei: '123456789012345,234567890123456,345678901234567',
      branch: branch1._id
    });

    const product2 = await Product.create({
      name: 'iPhone 13',
      category: 'Telefon',
      costPrice: 500,
      sellPrice: 899,
      stock: 2,
      imei: '456789012345678,567890123456789',
      branch: branch1._id
    });

    const product3 = await Product.create({
      name: 'Samsung S21',
      category: 'Telefon',
      costPrice: 400,
      sellPrice: 799,
      stock: 5,
      imei: '678901234567890,789012345678901,890123456789012,901234567890123,012345678901234',
      branch: branch2._id
    });

    const product4 = await Product.create({
      name: 'Xiaomi 12',
      category: 'Telefon',
      costPrice: 250,
      sellPrice: 599,
      stock: 4,
      imei: '111111111111111,222222222222222,333333333333333,444444444444444',
      branch: branch2._id
    });

    console.log('✓ Created products');

    console.log('\n✓ Database seeded successfully!');
    console.log(`  - Users: 2 (admin, cashier)`);
    console.log(`  - Branches: 2 (Toshkent, Gijduvon)`);
    console.log(`  - Customers: 3 (Azizbek, Karim, Fatima)`);
    console.log(`  - Products: 4 (A07, iPhone 13, Samsung S21, Xiaomi 12)`);

    process.exit(0);
  } catch (err) {
    console.error('✗ Error seeding database:', err.message);
    process.exit(1);
  }
};

seedDB();
