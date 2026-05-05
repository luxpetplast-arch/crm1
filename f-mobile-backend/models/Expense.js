const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  category: { type: String, required: true },
  amount: { type: Number, default: 0 }, // Deprecated, kept for backward compatibility
  amountUSD: { type: Number, default: 0 },
  amountUZS: { type: Number, default: 0 },
  currency: { type: String, default: 'UZS' }, // Deprecated
  description: { type: String, default: '' },
  vendor: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', expenseSchema);
