const express = require('express');
const Sale = require('../models/Sale');
const Customer = require('../models/Customer');
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all sales (public)
router.get('/public/all', async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('cashier', 'name username')
      .populate('branch', 'name')
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });

    const Product = require('../models/Product');
    const salesWithProducts = await Promise.all(sales.map(async (sale) => {
      const saleObj = sale.toObject();
      saleObj.items = await Promise.all((saleObj.items || []).map(async (item) => {
        if (item.product && typeof item.product === 'string') {
          try {
            const product = await Product.findById(item.product).select('name');
            return { ...item, product: product ? { id: product._id, name: product.name } : { name: 'Noma\'lum' } };
          } catch { return { ...item, product: { name: 'Noma\'lum' } }; }
        }
        return item;
      }));
      return saleObj;
    }));

    res.json({ success: true, data: salesWithProducts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all sales (admin)
router.get('/', auth, async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('cashier', 'name username')
      .populate('branch', 'name')
      .populate('customer', 'name phone')
      .sort({ createdAt: -1 });

    const Product = require('../models/Product');
    const salesWithProducts = await Promise.all(sales.map(async (sale) => {
      const saleObj = sale.toObject();
      saleObj.items = await Promise.all((saleObj.items || []).map(async (item) => {
        if (item.product && typeof item.product === 'string') {
          try {
            const product = await Product.findById(item.product).select('name');
            return { ...item, product: product ? { id: product._id, name: product.name } : { name: 'Noma\'lum' } };
          } catch { return { ...item, product: { name: 'Noma\'lum' } }; }
        }
        return item;
      }));
      return saleObj;
    }));

    res.json({ success: true, data: salesWithProducts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create sale
router.post('/', auth, async (req, res) => {
  try {
    const { branch, customer, items, totalAmount, paidAmount, change, currency, paymentMethods, notes } = req.body;

    if (!branch || !items || items.length === 0 || !totalAmount) {
      return res.status(400).json({ success: false, error: 'Invalid sale data' });
    }

    console.log('[CREATE SALE] Processing sale with items:', items.length);

    // Update product stock and IMEI for each item
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        console.log('[CREATE SALE] Product not found:', item.product);
        continue;
      }

      console.log('[CREATE SALE] Updating product:', { 
        name: product.name, 
        currentStock: product.stock, 
        soldQuantity: item.quantity,
        imei: item.imei,
        imeiListLength: product.imeiList?.length || 0
      });

      // Calculate new stock
      const newStock = product.stock - item.quantity;

      if (newStock < 0) {
        return res.status(400).json({ 
          success: false, 
          error: `Mahsulot yetarli emas: ${product.name}` 
        });
      }

      // Update IMEI list - remove sold IMEIs
      let updatedImei = product.imei;
      let updatedImeiList = product.imeiList || [];
      
      if (item.imei) {
        // item.imei is a single IMEI string, not comma-separated
        const soldImei = item.imei.trim();
        
        console.log('[CREATE SALE] Processing IMEI:', {
          soldImei,
          currentImei: product.imei,
          currentImeiListLength: product.imeiList?.length || 0
        });
        
        // Remove from comma-separated string
        if (product.imei) {
          const imeiArray = product.imei.split(',').map(i => i.trim()).filter(i => i !== '');
          const remainingImeis = imeiArray.filter(imei => imei !== soldImei);
          updatedImei = remainingImeis.join(',');
          
          console.log('[CREATE SALE] String IMEI update:', {
            before: imeiArray.length,
            after: remainingImeis.length,
            removed: soldImei
          });
        }
        
        // Remove from imeiList array
        if (product.imeiList && product.imeiList.length > 0) {
          updatedImeiList = product.imeiList.filter(imeiItem => {
            const imeiValue = typeof imeiItem === 'string' ? imeiItem : imeiItem.imei;
            const shouldKeep = imeiValue !== soldImei;
            if (!shouldKeep) {
              console.log('[CREATE SALE] Removing IMEI from list:', imeiValue);
            }
            return shouldKeep;
          });
          
          console.log('[CREATE SALE] Array IMEI update:', {
            before: product.imeiList.length,
            after: updatedImeiList.length
          });
        }
      }

      // Update or delete product
      if (newStock === 0) {
        await Product.findByIdAndDelete(item.product);
        console.log('[CREATE SALE] Product deleted (stock = 0):', product.name);
      } else {
        const updateData = {
          stock: newStock,
          imei: updatedImei,
          updatedAt: Date.now()
        };
        
        // Only update imeiList if it exists
        if (product.imeiList && product.imeiList.length > 0) {
          updateData.imeiList = updatedImeiList;
        }
        
        await Product.findByIdAndUpdate(item.product, updateData);
        console.log('[CREATE SALE] Product updated:', { 
          name: product.name, 
          newStock, 
          imeiListLength: updatedImeiList.length,
          imei: updatedImei 
        });
      }
    }

    const sale = new Sale({
      cashier: req.user.id,
      branch,
      customer,
      items,
      totalAmount,
      paidAmount: paidAmount || 0,
      change: change || 0,
      currency: currency || 'UZS',
      paymentMethods: paymentMethods || [],
      notes: notes || ''
    });

    await sale.save();
    console.log('[CREATE SALE] Sale saved successfully');

    // Create income record for cash payments (so kassa doesn't depend on sales history)
    const Income = require('../models/Income');
    const cashPayments = (paymentMethods || []).filter(m => m.type === 'cash');
    if (cashPayments.length > 0) {
      const cashAmount = cashPayments.reduce((sum, m) => sum + m.amount, 0);
      const incomeData = {
        source: `Savdo #${sale._id}`,
        description: `Savdo tushumlari (sale_id:${sale._id})`,
        category: 'sale',
        saleId: sale._id
      };
      if (currency === 'USD') {
        incomeData.amountUSD = cashAmount;
        incomeData.amountUZS = 0;
      } else {
        incomeData.amountUZS = cashAmount;
        incomeData.amountUSD = 0;
      }
      await Income.create(incomeData);
      console.log('[CREATE SALE] Income record created for cash payment:', cashAmount, currency);
    }

    // Update customer debt if exists
    if (customer) {
      const cust = await Customer.findById(customer);
      if (cust) {
        // Calculate debt based on payment methods
        let debt = 0;
        
        console.log('[CREATE SALE] Payment methods received:', {
          paymentMethods,
          paymentMethodsLength: paymentMethods?.length || 0,
          totalAmount,
          paidAmount
        });
        
        // If there's no payment methods, all amount is debt (qarz savdo)
        if (!paymentMethods || paymentMethods.length === 0) {
          debt = totalAmount;
          console.log('[CREATE SALE] Debt (no payment methods - qarz savdo):', debt);
        } else {
          // If there's cash payment, debt = totalAmount - paidAmount
          const hasCashPayment = paymentMethods.some(m => m.type === 'cash');
          
          console.log('[CREATE SALE] Has cash payment:', hasCashPayment);
          
          if (hasCashPayment) {
            // If cash payment exists, debt = totalAmount - paidAmount
            debt = Math.max(0, totalAmount - paidAmount);
            console.log('[CREATE SALE] Debt (cash payment):', debt);
          } else {
            // If only Click/Terminal, all amount is debt
            debt = totalAmount;
            console.log('[CREATE SALE] Debt (click/terminal):', debt);
          }
        }
        
        // Update debt based on currency
        const updates = {
          totalPurchase: (cust.totalPurchase || 0) + totalAmount,
          updatedAt: Date.now()
        };
        
        if (currency === 'USD') {
          updates.debtUSD = (cust.debtUSD || 0) + debt;
          console.log('[CREATE SALE] Updated debtUSD:', {
            old: cust.debtUSD || 0,
            debt: debt,
            new: updates.debtUSD
          });
        } else {
          updates.debtUZS = (cust.debtUZS || 0) + debt;
          console.log('[CREATE SALE] Updated debtUZS:', {
            old: cust.debtUZS || 0,
            debt: debt,
            new: updates.debtUZS
          });
        }
        
        console.log('[CREATE SALE] Final updates object:', updates);
        console.log('[CREATE SALE] Updating customer debt:', { 
          customerId: customer, 
          currency, 
          totalAmount,
          paidAmount,
          hasCashPayment: paymentMethods && paymentMethods.some(m => m.type === 'cash'),
          debt, 
          updates
        });
        
        const updateResult = await Customer.findByIdAndUpdate(customer, updates, { new: true });
        console.log('[CREATE SALE] Customer after update:', {
          debtUSD: updateResult?.debtUSD,
          debtUZS: updateResult?.debtUZS
        });
      }
    }

    res.status(201).json({ success: true, data: sale });
  } catch (err) {
    console.error('[CREATE SALE] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete sale (only deletes history, doesn't affect cash register)
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('[DELETE SALE] Deleting sale:', req.params.id);
    
    // Try findByIdAndDelete first, then findOneAndDelete as fallback
    let sale = await Sale.findByIdAndDelete(req.params.id);
    if (!sale) {
      // Try with string _id match
      sale = await Sale.findOneAndDelete({ _id: req.params.id });
    }
    if (!sale) {
      // Already deleted - return success anyway so frontend can clean up
      console.log('[DELETE SALE] Sale not found (may already be deleted), returning success');
      return res.json({ success: true, message: 'Sale deleted' });
    }
    console.log('[DELETE SALE] Sale deleted. Income record kept - cash register not affected.');
    res.json({ success: true, message: 'Sale deleted' });
  } catch (err) {
    console.error('[DELETE SALE] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete old sales (older than 20 days)
router.delete('/cleanup/old', auth, async (req, res) => {
  try {
    // Calculate date 20 days ago
    const twentyDaysAgo = new Date();
    twentyDaysAgo.setDate(twentyDaysAgo.getDate() - 20);
    
    console.log('[CLEANUP] Deleting sales older than:', twentyDaysAgo);
    
    const result = await Sale.deleteMany({
      createdAt: { $lt: twentyDaysAgo }
    });
    
    console.log('[CLEANUP] Deleted', result.deletedCount, 'old sales');
    res.json({ 
      success: true, 
      message: `${result.deletedCount} old sales deleted`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('[CLEANUP] Error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
