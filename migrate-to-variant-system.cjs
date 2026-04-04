const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateToVariants() {
  try {
    console.log('🔄 Starting migration to variant system...\n');
    
    // 1. Barcha aktiv mahsulotlarni olish (parent bo'lmaganlar)
    const allProducts = await prisma.product.findMany({
      where: {
        active: true,
        isParent: false
      }
    });
    console.log(`📦 Active non-parent products: ${allProducts.length}\n`);
    
    // 2. Mahsulotlarni guruhga ajratish
    const groups = {};
    
    allProducts.forEach(product => {
      const name = product.name.toLowerCase();
      
      // Preformalar uchun
      const preformMatch = name.match(/(\d+)g/i);
      if (preformMatch) {
        const size = preformMatch[1] + 'g';
        const warehouse = product.warehouse || 'preform';
        
        // Rang yoki turini aniqlash
        let variantName = 'Standart';
        if (name.includes('prazrachni') || name.includes('прозрачный')) variantName = 'Prazrachni';
        else if (name.includes('gidro') || name.includes('гидро')) variantName = 'Gidro';
        else if (name.includes('siniy') || name.includes('синий')) variantName = 'Siniy';
        else if (name.includes('sprite')) variantName = 'Sprite';
        else if (name.includes('qizil') || name.includes('красный')) variantName = 'Qizil';
        else if (name.includes('yashil') || name.includes('зеленый')) variantName = 'Yashil';
        else if (name.includes('qora') || name.includes('черный')) variantName = 'Qora';
        else if (name.includes('oq') || name.includes('белый')) variantName = 'Oq';
        
        const groupKey = `${warehouse}-${size}`;
        
        if (!groups[groupKey]) {
          groups[groupKey] = {
            warehouse,
            size,
            parentName: `${size.toUpperCase()} Preforma`,
            variants: []
          };
        }
        
        groups[groupKey].variants.push({
          ...product,
          variantName
        });
      }
    });
    
    console.log(`📊 Found ${Object.keys(groups).length} product groups\n`);
    
    // 3. Har bir guruh uchun parent va variantlar yaratish
    let createdParents = 0;
    let createdVariants = 0;
    let skippedGroups = 0;
    
    for (const [groupKey, group] of Object.entries(groups)) {
      if (group.variants.length <= 1) {
        console.log(`⏭️  Skipping ${groupKey} - only ${group.variants.length} variant`);
        skippedGroups++;
        continue;
      }
      
      // Parent allaqachon mavjudmi tekshirish
      const existingParent = await prisma.product.findFirst({
        where: {
          name: group.parentName,
          isParent: true
        }
      });
      
      if (existingParent) {
        console.log(`⏭️  Parent already exists: ${group.parentName}`);
        
        // Variantlarni qo'shish (agar yo'q bo'lsa)
        for (const variant of group.variants) {
          const existingVariant = await prisma.productVariant.findFirst({
            where: {
              parentId: existingParent.id,
              variantName: variant.variantName
            }
          });
          
          if (!existingVariant) {
            await prisma.productVariant.create({
              data: {
                parentId: existingParent.id,
                variantName: variant.variantName,
                pricePerBag: variant.pricePerBag,
                currentStock: variant.currentStock,
                cardType: variant.cardType || null,
                active: true
              }
            });
            createdVariants++;
            console.log(`      ✅ Added variant: ${variant.variantName}`);
          }
          
          // Eski mahsulotni deactivate qilish
          await prisma.product.update({
            where: { id: variant.id },
            data: { active: false }
          });
        }
        continue;
      }
      
      console.log(`\n🔨 Creating parent for ${groupKey}:`);
      console.log(`   Name: ${group.parentName}`);
      console.log(`   Variants: ${group.variants.length}`);
      
      // Parent mahsulot yaratish
      const firstVariant = group.variants[0];
      const parent = await prisma.product.create({
        data: {
          name: group.parentName,
          bagType: firstVariant.bagType,
          pricePerBag: firstVariant.pricePerBag,
          pricePerPiece: firstVariant.pricePerPiece,
          currentStock: 0,
          optimalStock: firstVariant.optimalStock,
          minStockLimit: firstVariant.minStockLimit,
          maxCapacity: firstVariant.maxCapacity || 0,
          unitsPerBag: firstVariant.unitsPerBag,
          warehouse: group.warehouse,
          isParent: true,
          active: true
        }
      });
      
      createdParents++;
      console.log(`   ✅ Parent created: ${parent.id}`);
      
      // Variantlarni yaratish
      const addedVariants = new Set(); // Takrorlanishni oldini olish
      
      for (const variant of group.variants) {
        // Agar bu variant nomi allaqachon qo'shilgan bo'lsa, o'tkazib yuborish
        if (addedVariants.has(variant.variantName)) {
          console.log(`      ⚠️  Skipping duplicate: ${variant.variantName}`);
          // Eski mahsulotni deactivate qilish
          await prisma.product.update({
            where: { id: variant.id },
            data: { active: false }
          });
          continue;
        }
        
        await prisma.productVariant.create({
          data: {
            parentId: parent.id,
            variantName: variant.variantName,
            pricePerBag: variant.pricePerBag,
            currentStock: variant.currentStock,
            cardType: variant.cardType || null,
            active: true
          }
        });
        
        addedVariants.add(variant.variantName);
        createdVariants++;
        console.log(`      • ${variant.variantName} - Stock: ${variant.currentStock}`);
        
        // Eski mahsulotni deactivate qilish
        await prisma.product.update({
          where: { id: variant.id },
          data: { active: false }
        });
      }
    }
    
    console.log(`\n✅ Migration completed!`);
    console.log(`   New parents created: ${createdParents}`);
    console.log(`   New variants created: ${createdVariants}`);
    console.log(`   Skipped groups: ${skippedGroups}`);
    console.log(`   Old products deactivated: ${createdVariants}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateToVariants();
