const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// Get database stats
router.get('/stats', async (req, res) => {
  try {
    // MongoDB Atlas free tier: 512 MB
    const totalStorage = 512; // MB
    
    // Get database connection
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ success: false, error: 'Database not connected' });
    }
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log('Collections found:', collections.map(c => c.name));
    
    let totalSize = 0;
    let totalDocuments = 0;
    
    // Get size for each collection using aggregate
    for (const collection of collections) {
      try {
        const col = db.collection(collection.name);
        const count = await col.countDocuments();
        totalDocuments += count;
        
        // Use aggregate to get collection size
        const result = await col.aggregate([
          { $group: { _id: null, size: { $sum: { $bsonSize: '$$ROOT' } } } }
        ]).toArray();
        
        const size = result.length > 0 ? result[0].size : 0;
        totalSize += size;
        
        console.log(`Collection ${collection.name}: ${count} docs, ${(size / 1024).toFixed(2)} KB`);
      } catch (err) {
        console.log(`Error getting stats for ${collection.name}:`, err.message);
      }
    }
    
    // Convert to MB
    const usedStorageExact = totalSize / (1024 * 1024);
    const usedStorage = Math.max(1, Math.round(usedStorageExact)); // At least 1 MB if data exists
    const freeStorage = totalStorage - usedStorage;
    const usagePercent = Math.round((usedStorageExact / totalStorage) * 100);

    console.log('Database Stats:', {
      totalSize: `${usedStorageExact.toFixed(2)} MB`,
      totalDocuments,
      usedStorage,
      freeStorage,
      usagePercent,
      collectionsCount: collections.length
    });

    res.json({
      success: true,
      data: {
        totalStorage,
        usedStorage,
        freeStorage,
        usagePercent: Math.max(usagePercent, totalDocuments > 0 ? 1 : 0), // At least 1% if data exists
        status: usagePercent > 90 ? 'critical' : usagePercent > 70 ? 'warning' : 'healthy'
      }
    });
  } catch (err) {
    console.error('Database stats error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
