const express = require('express');
const Customer = require('../models/Customer');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all customers (public)
router.get('/public/all', async (req, res) => {
  try {
    const customers = await Customer.find();
    // Transform _id to id for frontend compatibility
    const transformedCustomers = customers.map(c => ({
      ...c.toObject(),
      id: c._id.toString()
    }));
    res.json({ success: true, data: transformedCustomers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get customer by ID (public)
router.get('/public/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    const transformed = {
      ...customer.toObject(),
      id: customer._id.toString()
    };
    res.json({ success: true, data: transformed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update customer telegram ID
router.put('/public/:id/telegram', async (req, res) => {
  try {
    const { telegramUserId } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { telegramUserId, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }

    const transformed = {
      ...customer.toObject(),
      id: customer._id.toString()
    };
    res.json({ success: true, data: transformed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all customers (admin)
router.get('/', auth, async (req, res) => {
  try {
    const customers = await Customer.find();
    // Transform _id to id for frontend compatibility
    const transformedCustomers = customers.map(c => ({
      ...c.toObject(),
      id: c._id.toString()
    }));
    res.json({ success: true, data: transformedCustomers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get customer by ID (auth required)
router.get('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    const transformed = {
      ...customer.toObject(),
      id: customer._id.toString()
    };
    res.json({ success: true, data: transformed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create customer
router.post('/', auth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ success: false, error: 'Name and phone required' });
    }

    const customer = new Customer({
      name,
      phone,
      address: address || ''
    });

    await customer.save();
    const transformed = {
      ...customer.toObject(),
      id: customer._id.toString()
    };
    res.status(201).json({ success: true, data: transformed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update customer
router.put('/:id', auth, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    const transformed = {
      ...customer.toObject(),
      id: customer._id.toString()
    };
    res.json({ success: true, data: transformed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete customer (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      console.log('[AUTH] Access denied - not admin:', { role: req.user.role, username: req.user.username });
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, error: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
