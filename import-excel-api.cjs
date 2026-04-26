const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// API bazaviy URL
const API_URL = 'http://localhost:5003/api';

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
            if (!name || typeof name !== 'string') continue;
            
            // Bir qopdagi soni
            const unitsPerBag = parseInt(row['1 та халтадаки капсула сони']) || 1000;
            
            // Qoldiq (kun oxiridagi)
            const currentStock = parseFloat(row['кун охирида сальдо']) || 0;
            
            // Narx (agar bo'lsa)
            const price = parseFloat(row['Нархи']) || 0;
            
            // Rangni nomdan ajratish
            let color = 'noma\'lum';
            const nameLower = name.toLowerCase();
            if (nameLower.includes('кук') || nameLower.includes('кўк') || nameLower.includes('ko\'k')) color = 'ko\'k';
            else if (nameLower.includes('ок') || nameLower.includes('o\'k') || nameLower.includes('oq')) color = 'oq';
            else if (nameLower.includes('қизил') || nameLower.includes('кизил') || nameLower.includes('qizil')) color = 'qizil';
            else if (nameLower.includes('яшил') || nameLower.includes('yashil')) color = 'yashil';
            else if (nameLower.includes('сайхун') || nameLower.includes('sayhun')) color = 'sayhun';
            else if (nameLower.includes('синий') || nameLower.includes('sini')) color = 'ko\'k';
            
            // Warehouse turini aniqlash
            let warehouse = 'krishka';
            if (category.toLowerCase().includes('ручка') || nameLower.includes('ручка')) {
                warehouse = 'ruchka';
            }
            
            products.push({
                name: name.trim(),
                bagType: category || 'standart',
                color: color,
                warehouse: warehouse,
                unitsPerBag: unitsPerBag,
                currentStock: currentStock,
                pricePerBag: price,
                pricePerPiece: 0,
                minStockLimit: 50,
                optimalStock: 200,
                maxCapacity: 1000,
                active: true,
                isParent: false
            });
        }
        
        console.log(`✅ ${products.length} ta mahsulot topildi`);
        console.log('\n📋 Birinchi 5 mahsulot:');
        products.slice(0, 5).forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.name} - ${p.warehouse} - ${p.unitsPerBag} dona/qop`);
        });
        
        return { products, category };
    } catch (error) {
        console.error('❌ Excel o\'qish xatoligi:', error.message);
        return { products: [], category: '' };
    }
}

// Token olish
function getAuthToken() {
    try {
        const storagePath = path.join(__dirname, 'prisma', 'dev.db');
        // Tokenni foydalanuvchidan so'rash
        return null;
    } catch (e) {
        return null;
    }
}

// Mahsulotlarni import qilish
async function importProducts() {
    const { products, category } = readExcelProducts();
    
    if (products.length === 0) {
        console.log('❌ Import qilish uchun mahsulotlar yo\'q');
        return;
    }
    
    console.log('\n📦 API orqali mahsulotlarni import qilish boshlanmoqda...');
    console.log('⚠️  Iltimos, avval saytda tizimga kiring va token ni nusxalab oling!\n');
    
    // Tokenni so'rash
    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    readline.question('🔑 Token ni kiriting (agar bomasa "skip" deb yozing, lekin mahsulotlar qo\'shilmaydi): ', async (token) => {
        readline.close();
        
        if (!token || token === 'skip') {
            console.log('❌ Token kiritilmadi. Mahsulotlar import qilinmaydi.');
            return;
        }
        
        let importedCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < products.length; i++) {
            const p = products[i];
            
            try {
                const response = await axios.post(`${API_URL}/products`, p, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                });
                
                importedCount++;
                if (importedCount <= 10 || importedCount % 10 === 0) {
                    console.log(`✅ ${importedCount}. ${p.name} (${p.warehouse})`);
                }
                
                // 100ms kutish (serverni yuklamaslik uchun)
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                errorCount++;
                const errorMsg = error.response?.data?.error || error.message;
                if (errorCount <= 5) {
                    console.log(`❌ ${i + 1}. ${p.name} - ${errorMsg}`);
                }
            }
        }
        
        console.log(`\n🎉 ${importedCount} ta mahsulot muvaffaqiyatli qo'shildi!`);
        if (errorCount > 0) {
            console.log(`⚠️  ${errorCount} ta mahsulotda xatolik yuz berdi`);
        }
    });
}

// Skriptni ishga tushirish
if (require.main === module) {
    importProducts().catch(console.error);
}

module.exports = { importProducts, readExcelProducts };
