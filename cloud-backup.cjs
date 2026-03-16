const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
        
        // 2. Ma'lumotlarni chiqarish (to'g'ri SQL sintaksisi)
        const queries = [
            "SELECT 'USERS' as table_name, COUNT(*) as count FROM [User]",
            "SELECT 'PRODUCTS' as table_name, COUNT(*) as count FROM [Product]",
            "SELECT 'CUSTOMERS' as table_name, COUNT(*) as count FROM [Customer]",
            "SELECT 'SALES' as table_name, COUNT(*) as count FROM [Sale]",
            "SELECT 'ORDERS' as table_name, COUNT(*) as count FROM [Order]",
            "SELECT 'TOTAL_STOCK_VALUE' as table_name, SUM(currentStock * pricePerBag) as count FROM [Product]",
            "SELECT 'TOTAL_CUSTOMER_DEBT' as table_name, SUM(debt) as count FROM [Customer]",
            "SELECT 'TOTAL_SALES_AMOUNT' as table_name, SUM(totalAmount) as count FROM [Sale]",
            "SELECT 'TOTAL_PAID_AMOUNT' as table_name, SUM(paidAmount) as count FROM [Sale]"
        ];
        
        const allData = [];
        
        for (const query of queries) {
            try {
                const result = execSync(`sqlite3 prisma/dev.db "${query}"`, { encoding: 'utf8' });
                const [tableName, value] = result.trim().split('|');
                allData.push({ table: tableName, value: parseFloat(value) || 0 });
            } catch (error) {
                console.log(`⚠️ Query xatoligi: ${query}`);
            }
        }
        
        const exportData = {
            timestamp: new Date().toISOString(),
            location: 'C:\\Users\\tilav\\Desktop\\zavod tizimi',
            database: 'dev.db',
            data: allData
        };
        
        const dataPath = path.join(__dirname, 'backup', `data_export_${Date.now()}.json`);
        fs.writeFileSync(dataPath, JSON.stringify(exportData, null, 2));
        console.log(`✅ Ma'lumotlar eksport qilindi: ${dataPath}`);
        
        // 3. GitHub ga yuklash
        try {
            execSync('git add backup/', { cwd: __dirname });
            execSync('git commit -m "Database backup ' + new Date().toISOString() + '"', { cwd: __dirname });
            execSync('git push origin main', { cwd: __dirname });
            console.log('✅ GitHub ga yuklandi!');
        } catch (gitError) {
            console.log('⚠️ Git topilmadi yoki xatolik:', gitError.message);
        }
        
        // 4. Cloud xizmatlar ro'yxati
        console.log('\n📤 Cloud yuklash variantlari:');
        console.log('1. ✅ GitHub (git orqali) - amalga oshirildi');
        console.log('2. 📱 Google Drive (rasm bilan yuklash)');
        console.log('3. 🔄 Dropbox (avtomatik sync)');
        console.log('4. 🔥 Firebase (real-time database)');
        console.log('5. ☁️ AWS S3 (professional storage)');
        
        console.log('\n🎉 Cloudga yuklash tayyor!');
        console.log(`📍 Fayllar: ${path.join(__dirname, 'backup')}`);
        
    } catch (error) {
        console.error('❌ Xatolik:', error.message);
    }
}

// Skriptni ishga tushirish
if (require.main === module) {
    uploadToCloud();
}

module.exports = { uploadToCloud };
