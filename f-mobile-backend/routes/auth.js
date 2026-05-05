const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Login
router.post('/', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Username and password required' });
    }

    const user = await User.findOne({ username }).populate('branch');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          role: user.role,
          branch: user.branch
        }
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    console.log('[AUTH /me] Request from user:', req.user.username);
    const user = await User.findById(req.user.id).populate('branch');
    console.log('[AUTH /me] User found:', { 
      username: user.username, 
      role: user.role, 
      branch: user.branch ? { id: user.branch._id, name: user.branch.name } : 'NO BRANCH' 
    });
    res.json({ success: true, data: user });
  } catch (err) {
    console.error('[AUTH /me] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
