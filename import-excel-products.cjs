const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Excel faylidan mahsulotlarni o'qish
function readExcelProducts() {
    const excelPath = path.join(__dirname, 'exsel', 'КРИШКА РУЧКА-март (3).xlsx');
    
    console.log('📖 Excel faylni o\'qish:', excelPath);
    
    if (!fs.existsSync(excelPath)) {
        console.error('❌ Excel fayl topilmadi:', excelPath);
        return { products: [], category: '' };
    }
    
    try {
        const workbook = XLSX.readFile(excelPath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        console.log(`✅ Excel dan ${data.length} ta qator o'qildi`);
        
        // Kategoriya nomini topish (2-qatorda "№" maydonida)
        let category = '';
        if (data.length > 1 && data[1]['№']) {
            category = data[1]['№'];
            console.log('📁 Kategoriya:', category);
        }
        
        // Mahsulotlarni ajratib olish (3-qatordan boshlab)
        const products = [];
        for (let i = 2; i < data.length; i++) {
            const row = data[i];
            
            // Mahsulot nomi
            const name = row['Материаллар номи'] || '';
            if (!name) continue;
            
            // Bir qopdagi soni
            const unitsPerBag = parseInt(row['1 та халтадаки капсула сони']) || 1000;
            
            // Qoldiq (kun oxiridagi)
            const currentStock = parseFloat(row['кун охирида сальдо']) || 0;
            
            // Narx (agar bo'lsa)
            const price = parseFloat(row['Нархи']) || 0;
            
            products.push({
                name: name,
                bagType: category,
                unitsPerBag: unitsPerBag,
                currentStock: currentStock,
                pricePerBag: price,
                warehouse: 'krishka' // KRISHKA uchun
            });
        }
        
        console.log(`✅ ${products.length} ta mahsulot topildi`);
        console.log('\n📋 Birinchi 5 mahsulot:');
        products.slice(0, 5).forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.name} - ${p.unitsPerBag} dona/qop`);
        });
        
        return { products, category };
    } catch (error) {
        console.error('❌ Excel o\'qish xatoligi:', error.message);
        return { products: [], category: '' };
    }
}

// Mahsulotlarni import qilish
async function importProducts() {
    const { products, category } = readExcelProducts();
    
    if (products.length === 0) {
        console.log('❌ Import qilish uchun mahsulotlar yo\'q');
        return;
    }
    
    console.log('\n📦 Mahsulotlarni import qilish boshlanmoqda...\n');
    
    let importedCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        
        try {
            const id = `import_${Date.now()}_${i}`;
            const safeName = p.name.replace(/'/g, "''");
            const color = 'ko\'k'; // Default rang
            
            const query = `INSERT INTO Product (id, name, bagType, color, warehouse, unitsPerBag, pricePerBag, currentStock, minStockLimit, optimalStock, maxCapacity, active, createdAt, updatedAt) 
                VALUES ('${id}', '${safeName}', '${p.bagType}', '${color}', '${p.warehouse}', ${p.unitsPerBag}, ${p.pricePerBag}, ${p.currentStock}, 50, 200, 1000, 1, datetime('now'), datetime('now'));`;
            
            execSync(`sqlite3 prisma/dev.db "${query}"`, { encoding: 'utf8' });
            
            importedCount++;
            if (importedCount <= 10 || importedCount % 10 === 0) {
                console.log(`✅ ${importedCount}. ${p.name} (${p.unitsPerBag} dona/qop)`);
            }
            
        } catch (error) {
            errorCount++;
            console.log(`❌ ${i + 1}. Xatolik: ${error.message}`);
        }
    }
    
    console.log(`\n🎉 ${importedCount} ta mahsulot muvaffaqiyatli qo'shildi!`);
    if (errorCount > 0) {
        console.log(`⚠️  ${errorCount} ta mahsulotda xatolik yuz berdi`);
    }
}

// Skriptni ishga tushirish
if (require.main === module) {
    importProducts().catch(console.error);
}

module.exports = { importProducts };
