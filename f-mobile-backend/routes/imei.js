const express = require('express');
const { auth } = require('../middleware/auth');

const router = express.Router();

// IMEI routes placeholder
router.get('/', auth, async (req, res) => {
  try {
    res.json({ success: true, data: [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
