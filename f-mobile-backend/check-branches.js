const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Google DNS ishlatish
dns.setServers(['8.8.8.8', '8.8.4.4']);

const Branch = require('./models/Branch');

const checkBranches = async () => {
  try {
    console.log('📊 Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✓ Connected to MongoDB');

    // Get all branches
    const branches = await Branch.find({});
    console.log(`\n📍 Found ${branches.length} branch(es):\n`);
    
    branches.forEach((b, idx) => {
      console.log(`${idx + 1}. ${b.name}`);
      console.log(`   ID: ${b._id}`);
      console.log(`   Address: ${b.address}`);
      console.log(`   Phone: ${b.phone}`);
      console.log('');
    });

    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
};

checkBranches();
