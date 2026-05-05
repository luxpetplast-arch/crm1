const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Branch = require('../models/Branch');

const router = express.Router();

// Debug endpoint - kassir va mahsulotlarni tekshirish
router.get('/kassir-products', async (req, res) => {
  try {
    // Get all cashiers with their branches
    const cashiers = await User.find({ role: 'cashier' }).populate('branch');
    
    // Get all branches
    const branches = await Branch.find();
    
    // Get all products
    const products = await Product.find();
    
    const result = {
      cashiers: cashiers.map(c => ({
        username: c.username,
        branchId: c.branch ? c.branch._id : null,
        branchName: c.branch ? c.branch.name : 'NO BRANCH'
      })),
      branches: branches.map(b => ({
        id: b._id,
        name: b.name
      })),
      products: products.map(p => ({
        name: p.name,
        branchId: p.branch,
        stock: p.stock,
        imei: p.imei
      }))
    };
    
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
