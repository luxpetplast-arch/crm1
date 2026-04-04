import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface ProductGroup {
  baseName: string;
  bagType: string;
  products: Array<{
    id: string;
    name: string;
    variantName: string;
    currentStock: number;
    currentUnits: number;
    pricePerBag: number;
    unitsPerBag: number;
    minStockLimit: number;
    optimalStock: number;
    maxCapacity: number;
    productionCost: number;
  }>;
}

// Extract base name from product name
function extractBaseName(name: string): string {
  // Remove common color suffixes
  const colorPatterns = [
    /\s+(Oq|Qora|Sariq|Gidro|Ko'k|Qizil|Yashil)$/i,
    /\s+(White|Black|Yellow|Blue|Red|Green)$/i,
  ];
  
  let baseName = name;
  for (const pattern of colorPatterns) {
    baseName = baseName.replace(pattern, '');
  }
  
  return baseName.trim();
}

// Extract variant name from product name
function extractVariantName(fullName: string, baseName: string): string {
  const variant = fullName.replace(baseName, '').trim();
  return variant || 'Standart';
}

// Group similar products
function groupProducts(products: any[]): Map<string, ProductGroup> {
  const groups = new Map<string, ProductGroup>();
  
  products.forEach(product => {
    const baseName = extractBaseName(product.name);
    const variantName = extractVariantName(product.name, baseName);
    
    if (!groups.has(baseName)) {
      groups.set(baseName, {
        baseName,
        bagType: product.bagType,
        products: []
      });
    }
    
    groups.get(baseName)!.products.push({
      id: product.id,
      name: product.name,
      variantName,
      currentStock: product.currentStock,
      currentUnits: product.currentUnits,
      pricePerBag: product.pricePerBag,
      unitsPerBag: product.unitsPerBag,
      minStockLimit: product.minStockLimit,
      optimalStock: product.optimalStock,
      maxCapacity: product.maxCapacity,
      productionCost: product.productionCost
    });
  });
  
  // Filter groups with multiple products
  return new Map(
    Array.from(groups.entries()).filter(([_, group]) => group.products.length > 1)
  );
}

// Create backup
async function createBackup(): Promise<string> {
  const timestamp = Date.now();
  const backupDir = path.join(process.cwd(), 'backup');
  
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const backupPath = path.join(backupDir, `pre_variant_migration_${timestamp}.db`);
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  
  if (fs.existsSync(dbPath)) {
    fs.copyFileSync(dbPath, backupPath);
    console.log(`✅ Backup created: ${backupPath}`);
  }
  
  return backupPath;
}

// Preview migration
async function previewMigration() {
  console.log('\n📋 MIGRATION PREVIEW\n');
  
  const products = await prisma.product.findMany({
    where: { isParent: false }
  });
  
  const groups = groupProducts(products);
  
  console.log(`Total products: ${products.length}`);
  console.log(`Parent groups to create: ${groups.size}`);
  console.log(`Products to convert to variants: ${Array.from(groups.values()).reduce((sum, g) => sum + g.products.length, 0)}\n`);
  
  groups.forEach((group, baseName) => {
    console.log(`\n📦 ${baseName} (${group.bagType})`);
    group.products.forEach(p => {
      console.log(`   └─ ${p.variantName}: ${p.currentStock} qop, ${p.pricePerBag} so'm/qop`);
    });
  });
  
  return groups;
}

// Execute migration
async function executeMigration(createBackupFlag: boolean = true) {
  console.log('\n🚀 STARTING MIGRATION\n');
  
  // Create backup
  let backupPath = '';
  if (createBackupFlag) {
    backupPath = await createBackup();
  }
  
  try {
    // Get all products
    const products = await prisma.product.findMany({
      where: { isParent: false }
    });
    
    const groups = groupProducts(products);
    
    let parentsCreated = 0;
    let variantsCreated = 0;
    const errors: string[] = [];
    
    // Process each group
    for (const [baseName, group] of groups) {
      try {
        console.log(`\n📦 Processing: ${baseName}`);
        
        // Create parent product
        const parent = await prisma.product.create({
          data: {
            name: baseName,
            bagType: group.bagType,
            unitsPerBag: group.products[0].unitsPerBag,
            minStockLimit: group.products[0].minStockLimit,
            optimalStock: group.products[0].optimalStock,
            maxCapacity: group.products[0].maxCapacity,
            productionCost: group.products[0].productionCost,
            pricePerBag: group.products[0].pricePerBag, // Default price
            currentStock: 0, // Will be calculated from variants
            currentUnits: 0,
            isParent: true
          }
        });
        
        parentsCreated++;
        console.log(`   ✅ Parent created: ${parent.id}`);
        
        // Create variants
        for (const product of group.products) {
          try {
            const variant = await prisma.productVariant.create({
              data: {
                parentId: parent.id,
                variantName: product.variantName,
                currentStock: product.currentStock,
                currentUnits: product.currentUnits,
                pricePerBag: product.pricePerBag,
                sku: product.id, // Keep old ID as SKU
                active: true
              }
            });
            
            variantsCreated++;
            console.log(`   ✅ Variant created: ${product.variantName} (${variant.id})`);
            
            // Update old product to reference parent
            await prisma.product.update({
              where: { id: product.id },
              data: { parentProductId: parent.id }
            });
            
            // Migrate stock movements
            const stockMovements = await prisma.stockMovement.findMany({
              where: { productId: product.id }
            });
            
            for (const movement of stockMovements) {
              await prisma.variantStockMovement.create({
                data: {
                  variantId: variant.id,
                  type: movement.type,
                  quantity: movement.quantity,
                  units: movement.units,
                  reason: movement.reason,
                  userId: movement.userId,
                  userName: movement.userName,
                  previousStock: movement.previousStock,
                  previousUnits: movement.previousUnits,
                  newStock: movement.newStock,
                  newUnits: movement.newUnits,
                  notes: movement.notes,
                  createdAt: movement.createdAt
                }
              });
            }
            
            console.log(`   ✅ Migrated ${stockMovements.length} stock movements`);
            
          } catch (error) {
            const errorMsg = `Failed to create variant ${product.variantName}: ${error}`;
            errors.push(errorMsg);
            console.error(`   ❌ ${errorMsg}`);
          }
        }
        
      } catch (error) {
        const errorMsg = `Failed to process group ${baseName}: ${error}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }
    
    console.log('\n\n✅ MIGRATION COMPLETED\n');
    console.log(`Parents created: ${parentsCreated}`);
    console.log(`Variants created: ${variantsCreated}`);
    console.log(`Errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:');
      errors.forEach(err => console.log(`   - ${err}`));
    }
    
    if (backupPath) {
      console.log(`\n💾 Backup saved: ${backupPath}`);
    }
    
    return {
      success: errors.length === 0,
      backupPath,
      parentsCreated,
      variantsCreated,
      errors
    };
    
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error);
    throw error;
  }
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    if (command === 'preview') {
      await previewMigration();
    } else if (command === 'execute') {
      const noBackup = args.includes('--no-backup');
      await executeMigration(!noBackup);
    } else {
      console.log(`
Usage:
  npm run migrate:variants preview  - Preview migration
  npm run migrate:variants execute  - Execute migration (with backup)
  npm run migrate:variants execute --no-backup - Execute without backup
      `);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
