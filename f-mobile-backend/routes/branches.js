const express = require('express');
const Branch = require('../models/Branch');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all branches (public)
router.get('/public/all', async (req, res) => {
  try {
    const branches = await Branch.find();
    // Transform _id to id for frontend compatibility
    const transformedBranches = branches.map(b => ({
      ...b.toObject(),
      id: b._id.toString()
    }));
    res.json({ success: true, data: transformedBranches });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all branches (admin)
router.get('/', auth, async (req, res) => {
  try {
    const branches = await Branch.find();
    // Transform _id to id for frontend compatibility
    const transformedBranches = branches.map(b => ({
      ...b.toObject(),
      id: b._id.toString()
    }));
    res.json({ success: true, data: transformedBranches });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get branch by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ success: false, error: 'Branch not found' });
    }
    res.json({ success: true, data: branch });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create branch
router.post('/', auth, async (req, res) => {
  try {
    const { name, address, phone, manager } = req.body;

    const branch = new Branch({
      name: name || 'Yangi Filial',
      address: address || '',
      phone: phone || '',
      manager: manager || ''
    });

    await branch.save();
    const transformed = {
      ...branch.toObject(),
      id: branch._id.toString()
    };
    res.status(201).json({ success: true, data: transformed });
  } catch (err) {
    console.error('Create branch error:', err);
    res.status(500).json({ success: false, error: err.message || 'Server xatosi' });
  }
});

// Update branch
router.put('/:id', auth, async (req, res) => {
  try {
    const branch = await Branch.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!branch) {
      return res.status(404).json({ success: false, error: 'Branch not found' });
    }
    const transformed = {
      ...branch.toObject(),
      id: branch._id.toString()
    };
    res.json({ success: true, data: transformed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete branch (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      console.log('[AUTH] Access denied - not admin:', { role: req.user.role, username: req.user.username });
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) {
      return res.status(404).json({ success: false, error: 'Branch not found' });
    }
    res.json({ success: true, message: 'Branch deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
