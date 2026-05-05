const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Google DNS ishlatish
dns.setServers(['8.8.8.8', '8.8.4.4']);

const Product = require('./models/Product');

const deleteProducts = async () => {
  try {
    console.log('📊 Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✓ Connected to MongoDB');

    // Delete all products
    const result = await Product.deleteMany({});
    console.log(`✓ Deleted ${result.deletedCount} product(s)`);

    console.log('\n✓ All products deleted successfully!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
};

deleteProducts();
