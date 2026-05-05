const mongoose = require('mongoose');

const stripeTransactionSchema = new mongoose.Schema({
  stripeId: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'usd' },
  status: { type: String, default: 'pending' },
  description: { type: String, default: '' },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StripeTransaction', stripeTransactionSchema);
