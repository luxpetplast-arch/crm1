const express = require('express');
const Expense = require('../models/Expense');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all expenses
router.get('/', auth, async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ createdAt: -1 });
    console.log('GET /expenses - Found', expenses.length, 'records');
    res.json({ success: true, data: expenses });
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create expense
router.post('/', auth, async (req, res) => {
  try {
    const { category, amount, currency, description, vendor, amountUSD, amountUZS } = req.body;
    
    console.log('Creating expense with data:', { category, amountUSD, amountUZS, description, vendor });

    const expense = new Expense({
      category,
      amount: amount || 0, // Deprecated field for backward compatibility
      amountUSD: amountUSD || 0,
      amountUZS: amountUZS || 0,
      currency: currency || 'UZS', // Deprecated field
      description: description || '',
      vendor: vendor || ''
    });

    await expense.save();
    console.log('Expense saved:', expense);
    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    console.error('Error creating expense:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
