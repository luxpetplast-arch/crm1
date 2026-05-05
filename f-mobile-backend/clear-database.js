const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Google DNS ishlatish
dns.setServers(['8.8.8.8', '8.8.4.4']);

const User = require('./models/User');
const Branch = require('./models/Branch');
const Product = require('./models/Product');
const Customer = require('./models/Customer');
const Sale = require('./models/Sale');
const Income = require('./models/Income');
const Expense = require('./models/Expense');
const ExchangeRate = require('./models/ExchangeRate');

const clearDatabase = async () => {
  try {
    console.log('📊 Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✓ Connected to MongoDB');

    console.log('🗑️  Clearing database (keeping admin user)...');
    
    // Delete all users except admin
    const adminUser = await User.findOne({ username: 'admin', role: 'admin' });
    if (adminUser) {
      console.log('✓ Found admin user, will keep it');
      await User.deleteMany({ _id: { $ne: adminUser._id } });
    } else {
      console.log('⚠️  Admin user not found, deleting all users');
      await User.deleteMany({});
    }
    
    // Delete all other collections
    await Branch.deleteMany({});
    await Product.deleteMany({});
    await Customer.deleteMany({});
    await Sale.deleteMany({});
    await Income.deleteMany({});
    await Expense.deleteMany({});
    await ExchangeRate.deleteMany({});
    
    console.log('✓ Database cleared successfully!');
    console.log('\n📋 Remaining data:');
    console.log(`  - Users: ${await User.countDocuments()} (admin only)`);
    console.log(`  - Branches: ${await Branch.countDocuments()}`);
    console.log(`  - Products: ${await Product.countDocuments()}`);
    console.log(`  - Customers: ${await Customer.countDocuments()}`);
    console.log(`  - Sales: ${await Sale.countDocuments()}`);
    console.log(`  - Income: ${await Income.countDocuments()}`);
    console.log(`  - Expenses: ${await Expense.countDocuments()}`);
    console.log(`  - Exchange Rates: ${await ExchangeRate.countDocuments()}`);
    
    if (adminUser) {
      console.log('\n✓ Admin login credentials:');
      console.log(`  - Username: admin`);
      console.log(`  - Password: 101110`);
    }

    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
};

clearDatabase();
