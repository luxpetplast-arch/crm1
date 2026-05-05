const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  items: [{ type: Object }],
  totalAmount: { type: Number, default: 0 },
  paidAmount: { type: Number, default: 0 },
  change: { type: Number, default: 0 },
  currency: { type: String, default: 'UZS' },
  paymentMethods: [{ type: Object }],
  status: { type: String, default: 'completed' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sale', saleSchema);
