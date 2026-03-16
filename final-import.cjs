const { execSync } = require('child_process');

// Mahsulotlar ro'yxati
const products = [
    // 15 gramm (1 qop = 20 000 dona)
    { name: 'Kapsula 15 gr проза', bagType: '15 gr', unitsPerBag: 20000, price: 200 },
    { name: 'Kapsula 15 gr гидро', bagType: '15 gr', unitsPerBag: 20000, price: 200 },
    { name: 'Kapsula 15 gr сайхун', bagType: '15 gr', unitsPerBag: 20000, price: 200 },
    { name: 'Kapsula 15 gr sprite', bagType: '15 gr', unitsPerBag: 20000, price: 200 },
    { name: 'Kapsula 15 gr қизил', bagType: '15 gr', unitsPerBag: 20000, price: 200 },
    { name: 'Kapsula 15 gr корк', bagType: '15 gr', unitsPerBag: 20000, price: 200 },

    // 21 gramm (1 qop = 15 000 dona)
    { name: 'Kapsula 21 gr проза', bagType: '21 gr', unitsPerBag: 15000, price: 200 },
    { name: 'Kapsula 21 gr гидро', bagType: '21 gr', unitsPerBag: 15000, price: 200 },
    { name: 'Kapsula 21 gr Отчиз', bagType: '21 gr', unitsPerBag: 15000, price: 200 },
    { name: 'Kapsula 21 gr сайхун', bagType: '21 gr', unitsPerBag: 15000, price: 200 },
    { name: 'Kapsula 21 gr sprite', bagType: '21 gr', unitsPerBag: 15000, price: 200 },
    { name: 'Kapsula 21 gr ёк', bagType: '21 gr', unitsPerBag: 15000, price: 200 },
    { name: 'Kapsula 21 gr ок', bagType: '21 gr', unitsPerBag: 15000, price: 200 },

    // 26 gramm
    { name: 'Kapsula 26 gr ёк', bagType: '26 gr', unitsPerBag: 12000, price: 200 },
    { name: 'Kapsula 26 gr ёг', bagType: '26 gr', unitsPerBag: 10000, price: 200 },

    // 30 gramm (1 qop = 10 000 dona)
    { name: 'Kapsula 30 gr проза', bagType: '30 gr', unitsPerBag: 10000, price: 200 },
    { name: 'Kapsula 30 gr гидро', bagType: '30 gr', unitsPerBag: 10000, price: 200 },
    { name: 'Kapsula 30 gr Отчиз', bagType: '30 gr', unitsPerBag: 10000, price: 200 },
    { name: 'Kapsula 30 gr sprite', bagType: '30 gr', unitsPerBag: 10000, price: 200 },
    { name: 'Kapsula 30 gr сайхун', bagType: '30 gr', unitsPerBag: 10000, price: 200 },
    { name: 'Kapsula 30 gr синий', bagType: '30 gr', unitsPerBag: 10000, price: 200 },
    { name: 'Kapsula 30 gr синий', bagType: '30 gr', unitsPerBag: 10000, price: 200 },

    // 36 gramm
    { name: 'Kapsula 36 gr ёк', bagType: '36 gr', unitsPerBag: 10000, price: 200 },

    // 52 gramm (1 qop = 6 000 dona)
    { name: 'Kapsula 52 gr проза', bagType: '52 gr', unitsPerBag: 6000, price: 200 },
    { name: 'Kapsula 52 gr ок', bagType: '52 gr', unitsPerBag: 6000, price: 200 },

    // 70 gramm (1 qop = 4 500 dona)
    { name: 'Kapsula 70 gr проза', bagType: '70 gr', unitsPerBag: 4500, price: 200 },
    { name: 'Kapsula 70 gr гидро', bagType: '70 gr', unitsPerBag: 4500, price: 200 },
    { name: 'Kapsula 70 gr Отчиз', bagType: '70 gr', unitsPerBag: 4500, price: 200 },
    { name: 'Kapsula 70 gr sprite', bagType: '70 gr', unitsPerBag: 4500, price: 200 },
    { name: 'Kapsula 70 gr сайхун', bagType: '70 gr', unitsPerBag: 4500, price: 200 },
    { name: 'Kapsula 70 gr синий', bagType: '70 gr', unitsPerBag: 4500, price: 200 },

    // 75 gramm
    { name: 'Kapsula 75 gr проза', bagType: '75 gr', unitsPerBag: 4000, price: 200 },
    { name: 'Kapsula 75 gr сайхун', bagType: '75 gr', unitsPerBag: 4000, price: 200 },
    { name: 'Kapsula 75 gr гидро', bagType: '75 gr', unitsPerBag: 3000, price: 200 },
    { name: 'Kapsula 75 gr гидро', bagType: '75 gr', unitsPerBag: 3000, price: 200 },
    { name: 'Kapsula 75 gr синий', bagType: '75 gr', unitsPerBag: 4000, price: 200 },
    { name: 'Kapsula 75 gr синий', bagType: '75 gr', unitsPerBag: 3000, price: 200 },

    // 80 gramm
    { name: 'Kapsula 80 gr проза', bagType: '80 gr', unitsPerBag: 4000, price: 200 },
    { name: 'Kapsula 80 gr проза', bagType: '80 gr', unitsPerBag: 3000, price: 200 },
    { name: 'Kapsula 80 gr гидро', bagType: '80 gr', unitsPerBag: 4000, price: 200 },
    { name: 'Kapsula 80 gr гидро', bagType: '80 gr', unitsPerBag: 3000, price: 200 },
    { name: 'Kapsula 80 gr сайхун', bagType: '80 gr', unitsPerBag: 4000, price: 200 },
    { name: 'Kapsula 80 gr сайхун', bagType: '80 gr', unitsPerBag: 3000, price: 200 },
    { name: 'Kapsula 80 gr синий', bagType: '80 gr', unitsPerBag: 4000, price: 200 },
    { name: 'Kapsula 80 gr синий', bagType: '80 gr', unitsPerBag: 3000, price: 200 },

    // 85 gramm
    { name: 'Kapsula 85 gr проза', bagType: '85 gr', unitsPerBag: 3000, price: 200 },
    { name: 'Kapsula 85 gr проза', bagType: '85 gr', unitsPerBag: 4000, price: 200 },

    // 86 gramm
    { name: 'Kapsula 86 gr проза', bagType: '86 gr', unitsPerBag: 3000, price: 200 },
    { name: 'Kapsula 86 gr проза', bagType: '86 gr', unitsPerBag: 4000, price: 200 },

    // 135 gramm
    { name: 'Kapsula 135 gr проза', bagType: '135 gr', unitsPerBag: 2500, price: 200 },
    { name: 'Kapsula 135 gr проза', bagType: '135 gr', unitsPerBag: 2000, price: 200 },
    { name: 'Kapsula 135 gr гидро', bagType: '135 gr', unitsPerBag: 2500, price: 200 },
    { name: 'Kapsula 135 gr гидро', bagType: '135 gr', unitsPerBag: 2000, price: 200 },
    { name: 'Kapsula 135 gr сайхун', bagType: '135 gr', unitsPerBag: 2500, price: 200 },
    { name: 'Kapsula 135 gr сайхун', bagType: '135 gr', unitsPerBag: 2000, price: 200 },
    { name: 'Kapsula 135 gr синий', bagType: '135 gr', unitsPerBag: 2500, price: 200 },
    { name: 'Kapsula 135 gr синий', bagType: '135 gr', unitsPerBag: 2000, price: 200 },

    // 250 gramm
    { name: 'Kapsula 250 gr nestle', bagType: '250 gr', unitsPerBag: 2000, price: 200 },
    { name: 'Kapsula 250 gr синий', bagType: '250 gr', unitsPerBag: 2000, price: 200 }
];

// Final import
function finalImport() {
    console.log('📦 Final import boshlanmoqda...');
    
    try {
        // Avval o'chirish
        execSync('sqlite3 prisma/dev.db "DELETE FROM [Product];"', { encoding: 'utf8' });
        console.log('✅ Eski mahsulotlar o\'chirildi');
        
        let importedCount = 0;
        
        products.forEach((product, index) => {
            try {
                const id = (index + 1).toString();
                // VALUES formatida - 13 ta qiymat
                const query = `INSERT INTO [Product] VALUES ('${id}', '${product.name}', '${product.bagType}', ${product.unitsPerBag}, 50, 500, 0, 0, ${product.price}, 0.0, datetime('now'), datetime('now'), '');`;
                
                execSync(`sqlite3 prisma/dev.db "${query}"`, { encoding: 'utf8' });
                importedCount++;
                
                console.log(`✅ ${importedCount}. ${product.name} - ${product.unitsPerBag} dona/qop - $${product.price}`);
                
            } catch (error) {
                console.log(`❌ Xatolik: ${product.name} - ${error.message}`);
            }
        });
        
        console.log(`\n🎉 ${importedCount} ta mahsulot muvaffaqiyatli qo\'shildi!`);
        
        // Tekshirish
        const result = execSync('sqlite3 prisma/dev.db "SELECT COUNT(*) FROM [Product];"', { encoding: 'utf8' });
        const count = parseInt(result.trim());
        
        console.log(`📊 Jami mahsulotlar soni: ${count} ta`);
        
        // Narh xulosasi
        const totalPrice = count * 200;
        console.log(`💰 Barcha mahsulotlar narxi: $${totalPrice.toLocaleString()} (har biri $200)`);
        
        // Birinchi 10 ta mahsulotni ko'rsatish
        console.log('\n📋 Birinchi 10 ta mahsulot:');
        const sampleResult = execSync('sqlite3 prisma/dev.db "SELECT name, bagType, unitsPerBag, pricePerBag FROM [Product] LIMIT 10;"', { encoding: 'utf8' });
        const lines = sampleResult.trim().split('\n');
        lines.forEach((line, index) => {
            const [name, bagType, units, price] = line.split('|');
            console.log(`${index + 1}. ${name} - ${bagType} (${units} dona/qop) - $${price}`);
        });
        
    } catch (error) {
        console.error('❌ Xatolik:', error.message);
    }
}

finalImport();
