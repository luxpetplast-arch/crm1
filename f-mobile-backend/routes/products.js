const express = require('express');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all products (public - paginated)
router.get('/public/all', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments();
    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Transform _id to id for frontend compatibility
    const transformedProducts = products.map(p => ({
      ...p.toObject(),
      id: p._id.toString()
    }));

    res.json({ 
      success: true, 
      data: transformedProducts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all products (admin)
router.get('/', auth, async (req, res) => {
  try {
    const products = await Product.find();
    // Transform _id to id for frontend compatibility
    const transformedProducts = products.map(p => {
      const obj = p.toObject();
      return {
        ...obj,
        id: p._id.toString()
      };
    });
    res.json({ success: true, data: transformedProducts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create product
router.post('/', auth, async (req, res) => {
  try {
    const { name, sku, category, stock, costPrice, sellPrice, branch, imei, currency, sellCurrency } = req.body;

    console.log('[BACKEND] POST /products - req.body:', JSON.stringify(req.body, null, 2))
    console.log('[BACKEND] Extracted currency:', currency, 'sellCurrency:', sellCurrency)

    // Agar currency yuborilmasa, default 'USD'
    const finalCurrency = (currency === 'USD' || currency === 'UZS') ? currency : 'USD';
    const finalSellCurrency = (sellCurrency === 'USD' || sellCurrency === 'UZS') ? sellCurrency : finalCurrency;

    console.log('[BACKEND] Final currency:', finalCurrency, 'finalSellCurrency:', finalSellCurrency)

    const product = new Product({
      name,
      sku,
      category: category || '',
      stock: stock || 0,
      costPrice: costPrice || 0,
      sellPrice: sellPrice || 0,
      currency: finalCurrency,
      sellCurrency: finalSellCurrency,
      branch,
      imei: imei || ''
    });

    await product.save();
    console.log('[BACKEND] Product saved:', { name, currency: product.currency, sellCurrency: product.sellCurrency })
    
    const transformed = {
      ...product.toObject(),
      id: product._id.toString()
    };
    res.status(201).json({ success: true, data: transformed });
  } catch (err) {
    console.error('[CREATE PRODUCT] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update product
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    const transformed = {
      ...product.toObject(),
      id: product._id.toString()
    };
    res.json({ success: true, data: transformed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete product (admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('[DELETE] Product delete request:', {
      productId: req.params.id,
      user: req.user ? { username: req.user.username, role: req.user.role } : 'no user'
    });

    // Check if user is admin
    if (!req.user) {
      console.log('[AUTH] No user in request');
      return res.status(401).json({ success: false, error: 'Not authenticated' });
    }

    if (req.user.role !== 'admin') {
      console.log('[AUTH] Access denied - not admin:', { role: req.user.role, username: req.user.username });
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    console.log('[DELETE] Product deleted successfully:', product.name);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('[DELETE] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
