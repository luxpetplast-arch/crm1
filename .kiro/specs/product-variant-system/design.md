# Design Document: Product Variant System

## Overview

Product Variant System - bu bir xil mahsulotning turli ranglarini (variantlarini) bitta parent product ostida guruhlash va boshqarish tizimi. Hozirgi tizimda har bir rang alohida mahsulot sifatida saqlanadi (masalan: "Preform 24gr Oq", "Preform 24gr Qora"). Yangi tizimda barcha ranglar bitta "Preform 24gr" parent product ostida variant sifatida saqlanadi va har bir variant o'zining stock miqdori va narxiga ega bo'ladi.

### Goals

- Mahsulotlarni parent-child strukturasida saqlash
- Har bir variant uchun alohida stock va narx boshqaruvi
- Product card'da barcha variantlarni bitta joyda ko'rsatish
- Sales va Orders tizimida variant tanlash imkoniyati
- Telegram bot orqali variant tanlash va buyurtma berish
- Mavjud mahsulotlarni yangi tizimga migration qilish
- Variant bo'yicha qidirish, filtrlash va hisobotlar

### Non-Goals

- Mahsulot kategoriyalarini o'zgartirish (faqat variant tizimini qo'shish)
- Mavjud sales va orders tizimini to'liq qayta yozish
- Multi-warehouse variant tracking (hozircha bitta ombor)
- Variant kombinatsiyalari (masalan: rang + o'lcham)

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
├─────────────────────────────────────────────────────────────┤
│  ProductCard  │  ProductDetail  │  VariantSelector  │  ...  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Backend (Express.js)                     │
├─────────────────────────────────────────────────────────────┤
│  Products API  │  Variants API  │  Sales API  │  Orders API │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Database (Prisma + SQLite)                │
├─────────────────────────────────────────────────────────────┤
│  Product (Parent)  │  ProductVariant  │  Sale  │  Order     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Telegram Bot                            │
├─────────────────────────────────────────────────────────────┤
│  Variant Selection  │  Order Creation  │  Stock Check       │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Product Creation Flow**:
   - Admin creates Parent Product with base information
   - Admin adds Variants with color/name, stock, and price
   - System stores parent-child relationship in database

2. **Sales Flow**:
   - User selects Parent Product
   - System displays all available Variants
   - User selects specific Variant
   - System validates stock and creates sale with Variant reference

3. **Stock Management Flow**:
   - Stock changes are tracked per Variant
   - System maintains separate stock history for each Variant
   - Total stock is calculated by summing all Variant stocks

4. **Migration Flow**:
   - System identifies products with similar names
   - Creates backup of current data
   - Creates Parent Products and converts existing products to Variants
   - Preserves all stock, price, and history data

## Components and Interfaces

### Database Schema

#### Product Model (Parent Product)
```prisma
model Product {
  id              String   @id @default(uuid())
  name            String   // Base name (e.g., "Preform 24gr")
  bagType         String   // Type identifier (e.g., "24gr")
  unitsPerBag     Int      // Units per bag (shared across variants)
  minStockLimit   Int      // Minimum stock threshold
  optimalStock    Int      // Optimal stock level
  maxCapacity     Int      // Maximum capacity
  productionCost  Float    @default(0)
  isParent        Boolean  @default(false) // Flag for parent products
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  variants        ProductVariant[]
  // ... existing relations
}
```

#### ProductVariant Model (New)
```prisma
model ProductVariant {
  id              String   @id @default(uuid())
  parentId        String   // Foreign key to parent Product
  parent          Product  @relation(fields: [parentId], references: [id], onDelete: Cascade)
  variantName     String   // Color/variant name (e.g., "Oq", "Qora", "Sariq")
  currentStock    Int      @default(0)
  currentUnits    Int      @default(0)
  pricePerBag     Float
  sku             String?  @unique // Optional SKU for variant
  active          Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  saleItems       SaleItem[]
  orderItems      OrderItem[]
  stockMovements  VariantStockMovement[]
  priceHistory    VariantPriceHistory[]

  @@unique([parentId, variantName])
  @@index([parentId])
  @@index([variantName])
}
```

#### VariantStockMovement Model (New)
```prisma
model VariantStockMovement {
  id              String          @id @default(uuid())
  variantId       String
  variant         ProductVariant  @relation(fields: [variantId], references: [id], onDelete: Cascade)
  type            String          // ADD, REMOVE, ADJUST, PRODUCTION, SALE
  quantity        Int             // Bag count
  units           Int             // Unit count
  reason          String
  userId          String
  userName        String
  previousStock   Int
  previousUnits   Int
  newStock        Int
  newUnits        Int
  notes           String?
  createdAt       DateTime        @default(now())

  @@index([variantId])
  @@index([type])
  @@index([createdAt])
}
```

#### VariantPriceHistory Model (New)
```prisma
model VariantPriceHistory {
  id              String          @id @default(uuid())
  variantId       String
  variant         ProductVariant  @relation(fields: [variantId], references: [id], onDelete: Cascade)
  oldPrice        Float
  newPrice        Float
  reason          String?
  userId          String
  userName        String
  createdAt       DateTime        @default(now())

  @@index([variantId])
  @@index([createdAt])
}
```

#### Updated SaleItem Model
```prisma
model SaleItem {
  id          String          @id @default(uuid())
  saleId      String
  sale        Sale            @relation(fields: [saleId], references: [id], onDelete: Cascade)
  productId   String?         // Optional: for backward compatibility
  product     Product?        @relation(fields: [productId], references: [id])
  variantId   String?         // New: reference to variant
  variant     ProductVariant? @relation(fields: [variantId], references: [id])
  quantity    Int
  pricePerBag Float
  subtotal    Float

  @@index([saleId])
  @@index([productId])
  @@index([variantId])
}
```

#### Updated OrderItem Model
```prisma
model OrderItem {
  id              String          @id @default(uuid())
  orderId         String
  order           Order           @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId       String?         // Optional: for backward compatibility
  product         Product?        @relation(fields: [productId], references: [id])
  variantId       String?         // New: reference to variant
  variant         ProductVariant? @relation(fields: [variantId], references: [id])
  quantityBags    Int
  quantityUnits   Int
  pricePerBag     Float
  subtotal        Float
  notes           String?

  @@index([orderId])
  @@index([productId])
  @@index([variantId])
}
```

### Backend API Endpoints

#### Products API (Extended)

```typescript
// Get all products with variants
GET /api/products
Response: {
  id: string;
  name: string;
  bagType: string;
  isParent: boolean;
  variants: Array<{
    id: string;
    variantName: string;
    currentStock: number;
    pricePerBag: number;
    active: boolean;
  }>;
  totalStock: number; // Sum of all variant stocks
}[]

// Get single product with full variant details
GET /api/products/:id
Response: {
  id: string;
  name: string;
  bagType: string;
  isParent: boolean;
  variants: Array<{
    id: string;
    variantName: string;
    currentStock: number;
    currentUnits: number;
    pricePerBag: number;
    active: boolean;
    stockMovements: VariantStockMovement[];
    priceHistory: VariantPriceHistory[];
  }>;
  // ... other product fields
}

// Create parent product
POST /api/products
Body: {
  name: string;
  bagType: string;
  unitsPerBag: number;
  minStockLimit: number;
  optimalStock: number;
  maxCapacity: number;
  productionCost: number;
  isParent: true;
}

// Update product
PUT /api/products/:id
Body: { /* product fields */ }

// Delete product (and all variants)
DELETE /api/products/:id
```

#### Variants API (New)

```typescript
// Get all variants for a product
GET /api/products/:productId/variants
Response: ProductVariant[]

// Get single variant with details
GET /api/variants/:id
Response: {
  id: string;
  parentId: string;
  parent: { id: string; name: string; bagType: string };
  variantName: string;
  currentStock: number;
  currentUnits: number;
  pricePerBag: number;
  stockMovements: VariantStockMovement[];
  priceHistory: VariantPriceHistory[];
  salesStats: {
    totalSold: number;
    totalRevenue: number;
    salesCount: number;
  };
}

// Create variant
POST /api/products/:productId/variants
Body: {
  variantName: string;
  currentStock: number;
  pricePerBag: number;
  sku?: string;
}

// Update variant
PUT /api/variants/:id
Body: {
  variantName?: string;
  pricePerBag?: number;
  active?: boolean;
}

// Adjust variant stock
POST /api/variants/:id/stock
Body: {
  type: 'ADD' | 'REMOVE' | 'ADJUST';
  quantity: number; // bags
  reason: string;
  notes?: string;
}

// Update variant price
POST /api/variants/:id/price
Body: {
  newPrice: number;
  reason?: string;
}

// Bulk update prices for all variants of a parent
POST /api/products/:productId/variants/bulk-price
Body: {
  adjustment: number; // amount or percentage
  type: 'fixed' | 'percent';
  increase: boolean;
}

// Delete variant
DELETE /api/variants/:id
```

#### Migration API (New)

```typescript
// Preview migration (dry run)
GET /api/migration/preview
Response: {
  parentGroups: Array<{
    parentName: string;
    variants: Array<{
      id: string;
      name: string;
      currentStock: number;
      pricePerBag: number;
    }>;
  }>;
  totalProducts: number;
  totalParents: number;
}

// Execute migration
POST /api/migration/execute
Body: {
  createBackup: boolean;
}
Response: {
  success: boolean;
  backupPath?: string;
  parentsCreated: number;
  variantsCreated: number;
  errors: string[];
}

// Rollback migration
POST /api/migration/rollback
Body: {
  backupPath: string;
}
Response: {
  success: boolean;
  message: string;
}
```

#### Search and Filter API (Extended)

```typescript
// Search products and variants
GET /api/products/search?q=:query
Response: {
  products: Array<{
    id: string;
    name: string;
    matchedVariants: Array<{
      id: string;
      variantName: string;
      highlighted: boolean;
    }>;
  }>;
}

// Filter products by variant properties
GET /api/products/filter?stockMin=:min&stockMax=:max&priceMin=:min&priceMax=:max
Response: Product[]
```

#### Reports API (Extended)

```typescript
// Get variant sales report
GET /api/reports/variants/sales?startDate=:start&endDate=:end
Response: {
  variants: Array<{
    variantId: string;
    variantName: string;
    parentName: string;
    totalSold: number;
    totalRevenue: number;
    salesCount: number;
    averagePrice: number;
  }>;
  summary: {
    totalRevenue: number;
    totalSold: number;
    mostPopular: { variantId: string; variantName: string; count: number };
  };
}

// Get variant stock turnover report
GET /api/reports/variants/turnover?period=:period
Response: {
  variants: Array<{
    variantId: string;
    variantName: string;
    turnoverRate: number;
    daysToSellOut: number;
    reorderPoint: number;
  }>;
}

// Export variant report to CSV
GET /api/reports/variants/export?format=csv&type=:reportType
Response: CSV file download
```

### Frontend Components

#### ProductCard Component (Updated)

```typescript
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    bagType: string;
    isParent: boolean;
    variants: Array<{
      id: string;
      variantName: string;
      currentStock: number;
      pricePerBag: number;
    }>;
    totalStock: number;
  };
  onClick?: (productId: string) => void;
}

// Features:
// - Display parent product name prominently
// - Show all variants in horizontal layout with color indicators
// - Display stock quantity for each variant
// - Show total stock across all variants
// - Visual indicators for out-of-stock variants
// - Click to navigate to product detail page
```

#### VariantSelector Component (New)

```typescript
interface VariantSelectorProps {
  productId: string;
  variants: Array<{
    id: string;
    variantName: string;
    currentStock: number;
    pricePerBag: number;
    active: boolean;
  }>;
  selectedVariantId?: string;
  onSelect: (variantId: string) => void;
  showStock?: boolean;
  showPrice?: boolean;
}

// Features:
// - Display all variants as selectable options
// - Show stock quantity and price for each variant
// - Disable out-of-stock variants
// - Highlight selected variant
// - Support keyboard navigation
```

#### ProductDetail Component (Updated)

```typescript
// Features:
// - Display parent product information
// - Show all variants with detailed information
// - Allow editing stock and price per variant
// - Display stock movement history per variant
// - Show sales statistics per variant
// - Links to other variants of same parent
// - Variant comparison view
```

#### VariantStockManager Component (New)

```typescript
interface VariantStockManagerProps {
  variantId: string;
  currentStock: number;
  onStockChange: (type: 'ADD' | 'REMOVE', quantity: number, reason: string) => void;
}

// Features:
// - Add/remove stock for specific variant
// - Input validation
// - Reason selection/input
// - Real-time stock updates
// - Confirmation dialogs
```

### Telegram Bot Integration

#### Bot Commands and Flows

```typescript
// Product selection flow
/products -> Show parent products list
  -> Select parent -> Show variants with inline keyboard
    -> Select variant -> Show price and stock
      -> Enter quantity -> Validate stock
        -> Confirm order -> Create order with variant reference

// Variant display format in bot
"Preform 24gr
🔴 Qora: 34 qop (50,000 so'm/qop)
⚪ Oq: 45 qop (48,000 so'm/qop)
🟡 Sariq: 28 qop (52,000 so'm/qop)
💧 Gidro: 84 qop (55,000 so'm/qop)
Jami: 191 qop"

// Stock validation message
"⚠️ Kechirasiz, Qora rangidan faqat 34 qop mavjud.
Mavjud miqdor: 34 qop
Siz so'ragan: 50 qop

34 qop buyurtma berasizmi?"
```

## Data Models

### TypeScript Interfaces

```typescript
interface ParentProduct {
  id: string;
  name: string;
  bagType: string;
  unitsPerBag: number;
  minStockLimit: number;
  optimalStock: number;
  maxCapacity: number;
  productionCost: number;
  isParent: boolean;
  variants: ProductVariant[];
  totalStock: number; // Calculated field
  createdAt: Date;
  updatedAt: Date;
}

interface ProductVariant {
  id: string;
  parentId: string;
  parent?: ParentProduct;
  variantName: string;
  currentStock: number;
  currentUnits: number;
  pricePerBag: number;
  sku?: string;
  active: boolean;
  stockMovements?: VariantStockMovement[];
  priceHistory?: VariantPriceHistory[];
  salesStats?: VariantSalesStats;
  createdAt: Date;
  updatedAt: Date;
}

interface VariantStockMovement {
  id: string;
  variantId: string;
  type: 'ADD' | 'REMOVE' | 'ADJUST' | 'PRODUCTION' | 'SALE';
  quantity: number;
  units: number;
  reason: string;
  userId: string;
  userName: string;
  previousStock: number;
  previousUnits: number;
  newStock: number;
  newUnits: number;
  notes?: string;
  createdAt: Date;
}

interface VariantPriceHistory {
  id: string;
  variantId: string;
  oldPrice: number;
  newPrice: number;
  reason?: string;
  userId: string;
  userName: string;
  createdAt: Date;
}

interface VariantSalesStats {
  totalSold: number;
  totalRevenue: number;
  totalProfit: number;
  salesCount: number;
  averagePrice: number;
  turnoverRate: number;
}

interface MigrationPreview {
  parentGroups: Array<{
    parentName: string;
    bagType: string;
    variants: Array<{
      id: string;
      name: string;
      variantName: string;
      currentStock: number;
      pricePerBag: number;
    }>;
  }>;
  totalProducts: number;
  totalParents: number;
}

interface MigrationResult {
  success: boolean;
  backupPath?: string;
  parentsCreated: number;
  variantsCreated: number;
  errors: string[];
  duration: number;
}
```

### Business Logic

#### Stock Calculation Rules

```typescript
// Total stock for parent product
function calculateTotalStock(variants: ProductVariant[]): number {
  return variants
    .filter(v => v.active)
    .reduce((sum, v) => sum + v.currentStock, 0);
}

// Low stock check per variant
function isLowStock(variant: ProductVariant, parent: ParentProduct): boolean {
  return variant.currentStock < parent.minStockLimit;
}

// Out of stock check
function isOutOfStock(variant: ProductVariant): boolean {
  return variant.currentStock === 0;
}

// Stock turnover rate (days to sell out)
function calculateTurnoverRate(
  variant: ProductVariant,
  salesLast30Days: number
): number {
  if (salesLast30Days === 0) return Infinity;
  const dailyAverage = salesLast30Days / 30;
  return variant.currentStock / dailyAverage;
}
```

#### Price Management Rules

```typescript
// Validate price
function validatePrice(price: number): boolean {
  return price > 0 && Number.isFinite(price);
}

// Calculate price difference between variants
function calculatePriceDifference(
  variant1: ProductVariant,
  variant2: ProductVariant
): number {
  return variant1.pricePerBag - variant2.pricePerBag;
}

// Apply bulk price adjustment
function applyBulkPriceAdjustment(
  variants: ProductVariant[],
  adjustment: number,
  type: 'fixed' | 'percent',
  increase: boolean
): ProductVariant[] {
  return variants.map(v => ({
    ...v,
    pricePerBag: type === 'fixed'
      ? increase ? v.pricePerBag + adjustment : v.pricePerBag - adjustment
      : increase 
        ? v.pricePerBag * (1 + adjustment / 100)
        : v.pricePerBag * (1 - adjustment / 100)
  }));
}
```

#### Migration Logic

```typescript
// Identify products with similar names
function groupSimilarProducts(products: Product[]): Map<string, Product[]> {
  const groups = new Map<string, Product[]>();
  
  products.forEach(product => {
    // Extract base name (remove color/variant suffix)
    const baseName = extractBaseName(product.name);
    
    if (!groups.has(baseName)) {
      groups.set(baseName, []);
    }
    groups.get(baseName)!.push(product);
  });
  
  // Filter groups with multiple products
  return new Map(
    Array.from(groups.entries()).filter(([_, products]) => products.length > 1)
  );
}

// Extract base name from product name
function extractBaseName(name: string): string {
  // Remove common color suffixes
  const colorPatterns = [
    /\s+(Oq|Qora|Sariq|Gidro|Ko'k|Qizil|Yashil)$/i,
    /\s+(White|Black|Yellow|Blue|Red|Green)$/i,
    /\s+\d+gr\s+(Oq|Qora|Sariq|Gidro)$/i
  ];
  
  let baseName = name;
  for (const pattern of colorPatterns) {
    baseName = baseName.replace(pattern, '');
  }
  
  return baseName.trim();
}

// Extract variant name from product name
function extractVariantName(fullName: string, baseName: string): string {
  return fullName.replace(baseName, '').trim();
}

// Create parent and variants from product group
async function migrateProductGroup(
  products: Product[],
  baseName: string
): Promise<{ parent: Product; variants: ProductVariant[] }> {
  // Create parent product
  const parent = await createParentProduct({
    name: baseName,
    bagType: products[0].bagType,
    unitsPerBag: products[0].unitsPerBag,
    minStockLimit: products[0].minStockLimit,
    optimalStock: products[0].optimalStock,
    maxCapacity: products[0].maxCapacity,
    productionCost: products[0].productionCost,
    isParent: true
  });
  
  // Create variants from existing products
  const variants = await Promise.all(
    products.map(product => 
      createVariant({
        parentId: parent.id,
        variantName: extractVariantName(product.name, baseName),
        currentStock: product.currentStock,
        currentUnits: product.currentUnits,
        pricePerBag: product.pricePerBag,
        sku: product.id // Keep old ID as SKU for reference
      })
    )
  );
  
  // Migrate stock movements
  await migrateStockMovements(products, variants);
  
  // Migrate sales references
  await migrateSalesReferences(products, variants);
  
  return { parent, variants };
}
```

