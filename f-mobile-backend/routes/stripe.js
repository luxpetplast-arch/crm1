const express = require('express');
const StripeTransaction = require('../models/StripeTransaction');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get Stripe publishable key (public endpoint)
router.get('/public/key', async (req, res) => {
  try {
    const key = process.env.STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      return res.status(400).json({ success: false, error: 'Stripe key not configured' });
    }
    res.json({ success: true, data: { publishableKey: key } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all transactions (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await StripeTransaction.find().sort({ createdAt: -1 });
    res.json({ success: true, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create transaction record
router.post('/', auth, async (req, res) => {
  try {
    const { stripeId, type, amount, currency, status, description, metadata } = req.body;

    if (!stripeId || !type || !amount) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const transaction = new StripeTransaction({
      stripeId,
      type,
      amount,
      currency: currency || 'usd',
      status: status || 'pending',
      description: description || '',
      metadata: metadata || {},
    });

    await transaction.save();
    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
