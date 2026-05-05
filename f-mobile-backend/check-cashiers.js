require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function checkCashiers() {
  try {
    console.log('📊 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    const cashiers = await User.find({ role: 'cashier' }).populate('branch');
    
    console.log(`👤 Found ${cashiers.length} cashier(s):\n`);
    
    cashiers.forEach((cashier, index) => {
      console.log(`${index + 1}. ${cashier.username}`);
      console.log(`   ID: ${cashier._id}`);
      console.log(`   Branch ID: ${cashier.branch ? cashier.branch._id : 'NO BRANCH'}`);
      console.log(`   Branch Name: ${cashier.branch ? cashier.branch.name : 'NO BRANCH'}`);
      console.log('');
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkCashiers();
