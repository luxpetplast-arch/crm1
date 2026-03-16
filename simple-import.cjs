const { execSync } = require('child_process');

// Oddiy import qilish
function simpleImport() {
    console.log('📦 Oddiy import boshlanmoqda...');
    
    try {
        // Avval o'chirish
        execSync('sqlite3 prisma/dev.db "DELETE FROM [Product];"', { encoding: 'utf8' });
        console.log('✅ Eski mahsulotlar o\'chirildi');
        
        // Birinchi mahsulotni qo'shish
        const query1 = `INSERT INTO [Product] (id, name, bagType, unitsPerBag, minStockLimit, optimalStock, maxCapacity, currentStock, currentUnits, pricePerBag, productionCost, createdAt, updatedAt) VALUES 
('1', 'Kapsula 15 gr проза', '15 gr', 20000, 50, 500, 0, 0, 200.0, 0.0, datetime('now'), datetime('now'));`;
        
        execSync(`sqlite3 prisma/dev.db "${query1}"`, { encoding: 'utf8' });
        console.log('✅ 1-mahsulot qo\'shildi');
        
        // Ikkinchi mahsulot
        const query2 = `INSERT INTO [Product] (id, name, bagType, unitsPerBag, minStockLimit, optimalStock, maxCapacity, currentStock, currentUnits, pricePerBag, productionCost, createdAt, updatedAt) VALUES 
('2', 'Kapsula 15 gr гидро', '15 gr', 20000, 50, 500, 0, 0, 200.0, 0.0, datetime('now'), datetime('now'));`;
        
        execSync(`sqlite3 prisma/dev.db "${query2}"`, { encoding: 'utf8' });
        console.log('✅ 2-mahsulot qo\'shildi');
        
        // Tekshirish
        const result = execSync('sqlite3 prisma/dev.db "SELECT COUNT(*) FROM [Product];"', { encoding: 'utf8' });
        console.log(`📊 Jami mahsulotlar: ${result.trim()}`);
        
        // Ko'rsatish
        const products = execSync('sqlite3 prisma/dev.db "SELECT name, bagType, unitsPerBag, pricePerBag FROM [Product];"', { encoding: 'utf8' });
        console.log('📋 Mahsulotlar:');
        console.log(products);
        
    } catch (error) {
        console.error('❌ Xatolik:', error.message);
    }
}

simpleImport();
