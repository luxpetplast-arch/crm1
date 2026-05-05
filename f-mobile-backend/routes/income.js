const express = require('express');
const Income = require('../models/Income');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all income
router.get('/', auth, async (req, res) => {
  try {
    const income = await Income.find().sort({ createdAt: -1 });
    console.log('GET /income - Found', income.length, 'records');
    res.json({ success: true, data: income });
  } catch (err) {
    console.error('Error fetching income:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create income
router.post('/', auth, async (req, res) => {
  try {
    const { source, amount, currency, description, category, amountUSD, amountUZS } = req.body;
    
    console.log('Creating income with data:', { source, amountUSD, amountUZS, description, category });

    const income = new Income({
      source,
      amount: amount || 0, // Deprecated field for backward compatibility
      amountUSD: amountUSD || 0,
      amountUZS: amountUZS || 0,
      currency: currency || 'UZS', // Deprecated field
      description: description || '',
      category: category || 'other'
    });

    await income.save();
    console.log('Income saved:', income);
    res.status(201).json({ success: true, data: income });
  } catch (err) {
    console.error('Error creating income:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
