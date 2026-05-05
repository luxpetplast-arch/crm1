const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Google DNS ishlatish
dns.setServers(['8.8.8.8', '8.8.4.4']);

const Product = require('./models/Product');

const checkProducts = async () => {
  try {
    console.log('📊 Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✓ Connected to MongoDB');

    // Get all products
    const products = await Product.find({});
    console.log(`\n📦 Found ${products.length} product(s):\n`);
    
    products.forEach((p, idx) => {
      console.log(`${idx + 1}. ${p.name}`);
      console.log(`   Currency: ${p.currency}`);
      console.log(`   SellCurrency: ${p.sellCurrency}`);
      console.log(`   CostPrice: ${p.costPrice}`);
      console.log(`   SellPrice: ${p.sellPrice}`);
      console.log(`   IMEI: ${p.imei}`);
      console.log(`   Branch: ${p.branch}`);
      console.log('');
    });

    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
};

checkProducts();
