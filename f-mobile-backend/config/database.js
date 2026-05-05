const mongoose = require('mongoose');
const dns = require('dns');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Google DNS ishlatish
dns.setServers(['8.8.8.8', '8.8.4.4']);

console.log('📊 MongoDB connecting...');
console.log('MongoDB URI:', process.env.MONGODB_URI);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✓ MongoDB connected successfully');
  } catch (err) {
    console.error('✗ MongoDB connection failed');
    console.error('  Error:', err.message);
    setTimeout(connectDB, 3000);
  }
};

connectDB();

module.exports = mongoose;
