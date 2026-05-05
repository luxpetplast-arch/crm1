const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Google DNS ishlatish
dns.setServers(['8.8.8.8', '8.8.4.4']);

const Product = require('./models/Product');

const updateIMEI = async () => {
  try {
    console.log('📊 Connecting to MongoDB...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✓ Connected to MongoDB');

    // Update products with IMEI
    const updates = [
      {
        name: 'A07',
        imei: '123456789012345,234567890123456,345678901234567'
      },
      {
        name: 'iPhone 13',
        imei: '456789012345678,567890123456789'
      },
      {
        name: 'Samsung S21',
        imei: '678901234567890,789012345678901,890123456789012,901234567890123,012345678901234'
      },
      {
        name: 'Xiaomi 12',
        imei: '111111111111111,222222222222222,333333333333333,444444444444444'
      }
    ];

    for (const update of updates) {
      const result = await Product.updateOne(
        { name: update.name },
        { imei: update.imei }
      );
      console.log(`✓ Updated ${update.name}: ${result.modifiedCount} document(s)`);
    }

    console.log('\n✓ IMEI update completed!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
};

updateIMEI();
