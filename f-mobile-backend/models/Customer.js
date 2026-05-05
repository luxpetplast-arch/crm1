const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  address: { type: String, default: '' },
  debt: { type: Number, default: 0 }, // Deprecated - kept for backward compatibility
  debtUSD: { type: Number, default: 0 }, // Debt in USD
  debtUZS: { type: Number, default: 0 }, // Debt in UZS (so'm)
  totalPurchase: { type: Number, default: 0 },
  telegramUserId: { type: String, default: null },
  branches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Customer', customerSchema);
