const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Excel faylidan mahsulotlarni o'qish
async function readExcelProducts() {
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
            
            // Rangni nomdan ajratish (variantName sifatida)
            let variantName = 'noma-lum';
            const nameLower = name.toLowerCase();
            if (nameLower.includes('кук') || nameLower.includes('кўк') || nameLower.includes('kok') || nameLower.includes('синий')) variantName = 'ko\'k';
            else if (nameLower.includes('ок') || nameLower.includes('oq')) variantName = 'oq';
            else if (nameLower.includes('қизил') || nameLower.includes('кизил') || nameLower.includes('qizil')) variantName = 'qizil';
            else if (nameLower.includes('яшил') || nameLower.includes('yashil')) variantName = 'yashil';
            else if (nameLower.includes('сайхун') || nameLower.includes('sayhun')) variantName = 'sayhun';
            
            // Warehouse turini aniqlash
            let warehouse = 'krishka';
            if (category.toLowerCase().includes('ручка') || nameLower.includes('ручка')) {
                warehouse = 'ruchka';
            }
            
            products.push({
                name: name.trim(),
                bagType: category || 'standart',
                variantName: variantName,
                warehouse: warehouse,
                unitsPerBag: unitsPerBag,
                currentStock: currentStock,
                currentUnits: 0,
                pricePerBag: price,
                pricePerPiece: 0,
                minStockLimit: 50,
                optimalStock: 200,
                maxCapacity: 1000,
                productionCost: 0,
                active: true,
                isParent: false
            });
        }
        
        console.log(`✅ ${products.length} ta mahsulot topildi`);
        console.log('\n📋 Birinchi 5 mahsulot:');
        products.slice(0, 5).forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.name} - ${p.warehouse} - ${p.variantName} - ${p.unitsPerBag} dona/qop`);
        });
        
        return { products, category };
    } catch (error) {
        console.error('❌ Excel o\'qish xatoligi:', error.message);
        return { products: [], category: '' };
    }
}

// Mahsulotlarni import qilish
async function importProducts() {
    const { products, category } = await readExcelProducts();
    
    if (products.length === 0) {
        console.log('❌ Import qilish uchun mahsulotlar yo\'q');
        await prisma.$disconnect();
        return;
    }
    
    console.log('\n📦 Prisma orqali mahsulotlarni import qilish boshlanmoqda...\n');
    
    let importedCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    
    for (let i = 0; i < products.length; i++) {
        const p = products[i];
        
        try {
            // Avval shu nomdagi mahsulot bormi tekshirish
            const existing = await prisma.product.findUnique({
                where: { name: p.name }
            });
            
            if (existing) {
                skippedCount++;
                if (skippedCount <= 3) {
                    console.log(`⚠️  ${p.name} allaqachon mavjud, o'tkazib yuborildi`);
                }
                continue;
            }
            
            // Mahsulot yaratish
            await prisma.product.create({
                data: p
            });
            
            importedCount++;
            if (importedCount <= 10 || importedCount % 10 === 0 || importedCount === products.length) {
                console.log(`✅ ${importedCount}. ${p.name} (${p.warehouse})`);
            }
            
        } catch (error) {
            errorCount++;
            if (errorCount <= 5) {
                console.log(`❌ ${i + 1}. ${p.name} - ${error.message}`);
            }
        }
    }
    
    console.log(`\n🎉 ${importedCount} ta mahsulot muvaffaqiyatli qo'shildi!`);
    if (skippedCount > 0) {
        console.log(`⏭️  ${skippedCount} ta mahsulot o'tkazib yuborildi (allaqachon mavjud)`);
    }
    if (errorCount > 0) {
        console.log(`⚠️  ${errorCount} ta mahsulotda xatolik yuz berdi`);
    }
    
    // Jami mahsulotlar sonini ko'rsatish
    const total = await prisma.product.count();
    console.log(`📊 Jami mahsulotlar soni: ${total} ta`);
    
    await prisma.$disconnect();
}

// Skriptni ishga tushirish
if (require.main === module) {
    importProducts().catch(async (e) => {
        console.error('❌ Xatolik:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
}

module.exports = { importProducts };
