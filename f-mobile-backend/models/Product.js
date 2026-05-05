const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, unique: true, sparse: true },
  category: { type: String, default: '' },
  stock: { type: Number, default: 0 },
  costPrice: { type: Number, default: 0 },
  sellPrice: { type: Number, default: 0 },
  currency: { type: String, enum: ['USD', 'UZS'], default: 'USD' },
  sellCurrency: { type: String, enum: ['USD', 'UZS'], default: 'USD' },
  imei: { type: String, default: '' }, // IMEI raqamlari (comma-separated)
  imeiList: [{ 
    imei: { type: String, required: true },
    used: { type: Boolean, default: false }
  }],
  branch: { type: String, default: null }, // String bo'lishi mumkin (main-warehouse-000 yoki ObjectId)
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
