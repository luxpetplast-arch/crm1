const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Cloudga yuklash skripti
async function uploadToCloud() {
    console.log('🚀 Cloudga yuklash boshlanmoqda...');
    
    try {
        // 1. Ma'lumotlar bazasini backup qilish
        const dbPath = path.join(__dirname, 'prisma', 'dev.db');
        const backupPath = path.join(__dirname, 'backup', `dev_backup_${Date.now()}.db`);
        
        // Backup papkasini yaratish
        const backupDir = path.dirname(backupPath);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        // Database nusxalash
        fs.copyFileSync(dbPath, backupPath);
        console.log(`✅ Backup yaratildi: ${backupPath}`);
        
        // 2. Ma'lumotlarni chiqarish
        const { execSync } = require('child_process');
        const dataPath = path.join(__dirname, 'backup', `data_export_${Date.now()}.json`);
        
        // SQLite dan JSON ga eksport
        const sqliteCmd = `sqlite3 prisma/dev.db "SELECT 'USERS' as table, COUNT(*) as count FROM [User] UNION ALL SELECT 'PRODUCTS', COUNT(*) FROM [Product] UNION ALL SELECT 'CUSTOMERS', COUNT(*) FROM [Customer] UNION ALL SELECT 'SALES', COUNT(*) FROM [Sale] UNION ALL SELECT 'ORDERS', COUNT(*) FROM [Order] UNION ALL SELECT 'TOTAL_STOCK_VALUE', SUM(currentStock * pricePerBag) FROM [Product] UNION ALL SELECT 'TOTAL_CUSTOMER_DEBT', SUM(debt) FROM [Customer] UNION ALL SELECT 'TOTAL_SALES_AMOUNT', SUM(totalAmount) FROM [Sale] UNION ALL SELECT 'TOTAL_PAID_AMOUNT', SUM(paidAmount) FROM [Sale];"`;
        
        const result = execSync(sqliteCmd, { encoding: 'utf8' });
        
        const exportData = {
            timestamp: new Date().toISOString(),
            location: 'C:\\Users\\tilav\\Desktop\\zavod tizimi',
            database: 'dev.db',
            data: result.split('\n').map(line => {
                const [table, value] = line.split('|');
                return { table, value: value ? parseFloat(value) : 0 };
            }).filter(item => item.table && item.value !== undefined)
        };
        
        fs.writeFileSync(dataPath, JSON.stringify(exportData, null, 2));
        console.log(`✅ Ma'lumotlar eksport qilindi: ${dataPath}`);
        
        // 3. GitHub ga yuklash (agar git bo'lsa)
        try {
            execSync('git add backup/', { cwd: __dirname });
            execSync('git commit -m "Database backup ' + new Date().toISOString() + '"', { cwd: __dirname });
            execSync('git push origin main', { cwd: __dirname });
            console.log('✅ GitHub ga yuklandi!');
        } catch (gitError) {
            console.log('⚠️ Git topilmadi yoki xatolik:', gitError.message);
        }
        
        // 4. Google Drive yuklash (agar rasmli bo'lsa)
        console.log('📤 Cloud yuklash variantlari:');
        console.log('1. GitHub (git orqali)');
        console.log('2. Google Drive (rasm bilan)');
        console.log('3. Dropbox (avtomatik sync)');
        console.log('4. Firebase (real-time)');
        
        console.log('🎉 Cloudga yuklash tayyor!');
        
    } catch (error) {
        console.error('❌ Xatolik:', error.message);
    }
}

// Skriptni ishga tushirish
if (require.main === module) {
    uploadToCloud();
}

module.exports = { uploadToCloud };
