require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Branch = require('./models/Branch');

async function debug() {
  try {
    console.log('📊 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected\n');

    // Get all cashiers
    const cashiers = await User.find({ role: 'cashier' });
    console.log('👤 Kassirlar:');
    for (const c of cashiers) {
      console.log(`  - ${c.username}: branch=${c.branch || 'YO\'Q'}`);
    }
    console.log('');

    // Get all branches
    const branches = await Branch.find();
    console.log('📍 Filiallar:');
    for (const b of branches) {
      console.log(`  - ${b.name}: ID=${b._id}`);
    }
    console.log('');

    // Get all products
    const products = await Product.find();
    console.log('📦 Mahsulotlar:');
    for (const p of products) {
      console.log(`  - ${p.name}: branch=${p.branch}, stock=${p.stock}`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

debug();
