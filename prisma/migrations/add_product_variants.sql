-- Add variant support to Product model
-- Migration: add_product_variants

-- Step 1: Add new columns to Product table
ALTER TABLE Product ADD COLUMN isParent BOOLEAN NOT NULL DEFAULT 0;
ALTER TABLE Product ADD COLUMN parentProductId TEXT;

-- Step 2: Create ProductVariant table
CREATE TABLE IF NOT EXISTS ProductVariant (
  id TEXT PRIMARY KEY,
  parentId TEXT NOT NULL,
  variantName TEXT NOT NULL,
  currentStock INTEGER NOT NULL DEFAULT 0,
  currentUnits INTEGER NOT NULL DEFAULT 0,
  pricePerBag REAL NOT NULL,
  sku TEXT UNIQUE,
  active BOOLEAN NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parentId) REFERENCES Product(id) ON DELETE CASCADE,
  UNIQUE(parentId, variantName)
);

-- Step 3: Create indexes for ProductVariant
CREATE INDEX idx_variant_parent ON ProductVariant(parentId);
CREATE INDEX idx_variant_name ON ProductVariant(variantName);
CREATE INDEX idx_variant_active ON ProductVariant(active);

-- Step 4: Create VariantStockMovement table
CREATE TABLE IF NOT EXISTS VariantStockMovement (
  id TEXT PRIMARY KEY,
  variantId TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  units INTEGER NOT NULL,
  reason TEXT NOT NULL,
  userId TEXT NOT NULL,
  userName TEXT NOT NULL,
  previousStock INTEGER NOT NULL,
  previousUnits INTEGER NOT NULL,
  newStock INTEGER NOT NULL,
  newUnits INTEGER NOT NULL,
  notes TEXT,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (variantId) REFERENCES ProductVariant(id) ON DELETE CASCADE
);

-- Step 5: Create indexes for VariantStockMovement
CREATE INDEX idx_variant_stock_variant ON VariantStockMovement(variantId);
CREATE INDEX idx_variant_stock_type ON VariantStockMovement(type);
CREATE INDEX idx_variant_stock_created ON VariantStockMovement(createdAt);

-- Step 6: Create VariantPriceHistory table
CREATE TABLE IF NOT EXISTS VariantPriceHistory (
  id TEXT PRIMARY KEY,
  variantId TEXT NOT NULL,
  oldPrice REAL NOT NULL,
  newPrice REAL NOT NULL,
  reason TEXT,
  userId TEXT NOT NULL,
  userName TEXT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (variantId) REFERENCES ProductVariant(id) ON DELETE CASCADE
);

-- Step 7: Create indexes for VariantPriceHistory
CREATE INDEX idx_variant_price_variant ON VariantPriceHistory(variantId);
CREATE INDEX idx_variant_price_created ON VariantPriceHistory(createdAt);

-- Step 8: Add variantId to SaleItem table
ALTER TABLE SaleItem ADD COLUMN variantId TEXT;
CREATE INDEX idx_sale_item_variant ON SaleItem(variantId);

-- Step 9: Add variantId to OrderItem table
ALTER TABLE OrderItem ADD COLUMN variantId TEXT;
CREATE INDEX idx_order_item_variant ON OrderItem(variantId);
