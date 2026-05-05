const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  source: { type: String, required: true },
  amount: { type: Number, default: 0 },
  amountUSD: { type: Number, default: 0 },
  amountUZS: { type: Number, default: 0 },
  currency: { type: String, default: 'UZS' },
  description: { type: String, default: '' },
  category: { type: String, default: 'other' },
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Income', incomeSchema);
