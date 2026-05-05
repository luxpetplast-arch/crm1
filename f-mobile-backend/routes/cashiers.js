const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all cashiers (public)
router.get('/public/all', async (req, res) => {
  try {
    const cashiers = await User.find({ role: 'cashier' }).populate('branch', 'name address');
    res.json({ success: true, data: cashiers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all cashiers (admin)
router.get('/', auth, async (req, res) => {
  try {
    const cashiers = await User.find({ role: 'cashier' }).populate('branch', 'name address');
    res.json({ success: true, data: cashiers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single cashier
router.get('/:id', auth, async (req, res) => {
  try {
    const cashier = await User.findById(req.params.id).populate('branch');
    if (!cashier) {
      return res.status(404).json({ success: false, error: 'Kassir topilmadi' });
    }
    res.json({ success: true, data: cashier });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create cashier
router.post('/', auth, async (req, res) => {
  try {
    const { username, password, name, branch } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username va parol kerak' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Bu username allaqachon mavjud' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const cashier = await User.create({
      username,
      password: hashedPassword,
      name: name || username,
      role: 'cashier',
      branch: branch || null
    });

    res.json({ success: true, data: cashier });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update cashier
router.put('/:id', auth, async (req, res) => {
  try {
    const { username, password, name, branch } = req.body;
    const cashier = await User.findById(req.params.id);

    if (!cashier) {
      return res.status(404).json({ success: false, error: 'Kassir topilmadi' });
    }

    // Check if username is being changed and if it already exists
    if (username && username !== cashier.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'Bu username allaqachon mavjud' });
      }
      cashier.username = username;
    }

    if (password) {
      // Hash password if provided
      cashier.password = await bcrypt.hash(password, 10);
    }
    if (name) cashier.name = name;
    if (branch !== undefined) cashier.branch = branch;
    cashier.updatedAt = Date.now();

    await cashier.save();
    res.json({ success: true, data: cashier });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete cashier
router.delete('/:id', auth, async (req, res) => {
  try {
    const cashier = await User.findByIdAndDelete(req.params.id);
    if (!cashier) {
      return res.status(404).json({ success: false, error: 'Kassir topilmadi' });
    }
    res.json({ success: true, message: 'Kassir o\'chirildi' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
