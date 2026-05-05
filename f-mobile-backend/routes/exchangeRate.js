const express = require('express');
const ExchangeRate = require('../models/ExchangeRate');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get current exchange rate
router.get('/current', async (req, res) => {
  try {
    // Get the latest USD rate from database
    let rate = await ExchangeRate.findOne({ currency: 'USD' }).sort({ updatedAt: -1 });
    
    // If no rate exists, create default
    if (!rate) {
      rate = await ExchangeRate.create({
        currency: 'USD',
        rate: 12500,
        notes: 'Default rate'
      });
    }

    res.json({
      success: true,
      data: {
        id: rate._id,
        currency: rate.currency,
        rate: rate.rate,
        updatedAt: rate.updatedAt
      }
    });
  } catch (err) {
    console.error('Error fetching exchange rate:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all exchange rates
router.get('/all', async (req, res) => {
  try {
    const rates = await ExchangeRate.find().sort({ updatedAt: -1 }).limit(10);
    
    res.json({
      success: true,
      data: rates.map(r => ({
        id: r._id,
        currency: r.currency,
        rate: r.rate,
        updatedAt: r.updatedAt,
        notes: r.notes
      }))
    });
  } catch (err) {
    console.error('Error fetching exchange rates:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update exchange rate (admin only)
router.put('/update', auth, async (req, res) => {
  try {
    const { currency, rate, notes } = req.body;

    console.log('Updating exchange rate:', { currency, rate, notes });

    if (!currency || !rate) {
      return res.status(400).json({ success: false, error: 'Currency and rate required' });
    }

    if (rate <= 0) {
      return res.status(400).json({ success: false, error: 'Rate must be positive' });
    }

    // Create new exchange rate record
    const newRate = await ExchangeRate.create({
      currency,
      rate,
      notes: notes || '',
      updatedAt: new Date()
    });

    console.log('Exchange rate updated:', newRate);

    res.json({
      success: true,
      data: {
        id: newRate._id,
        currency: newRate.currency,
        rate: newRate.rate,
        updatedAt: newRate.updatedAt
      }
    });
  } catch (err) {
    console.error('Error updating exchange rate:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
