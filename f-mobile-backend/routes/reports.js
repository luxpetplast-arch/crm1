const express = require('express');
const Sale = require('../models/Sale');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get sales reports
router.get('/', auth, async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('cashier')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: sales });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
