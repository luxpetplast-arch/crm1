-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parentId" TEXT NOT NULL,
    "variantName" TEXT NOT NULL,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "currentUnits" INTEGER NOT NULL DEFAULT 0,
    "pricePerBag" REAL NOT NULL,
    "sku" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductVariant_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VariantStockMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "variantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "units" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "previousStock" INTEGER NOT NULL,
    "previousUnits" INTEGER NOT NULL,
    "newStock" INTEGER NOT NULL,
    "newUnits" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VariantStockMovement_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VariantPriceHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "variantId" TEXT NOT NULL,
    "oldPrice" REAL NOT NULL,
    "newPrice" REAL NOT NULL,
    "reason" TEXT,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VariantPriceHistory_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "telegramChatId" TEXT,
    "telegramUsername" TEXT,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "debtReminderDays" INTEGER NOT NULL DEFAULT 7,
    "category" TEXT NOT NULL DEFAULT 'NORMAL',
    "balance" REAL NOT NULL DEFAULT 0,
    "balanceUZS" REAL NOT NULL DEFAULT 0,
    "balanceUSD" REAL NOT NULL DEFAULT 0,
    "debt" REAL NOT NULL DEFAULT 0,
    "debtUZS" REAL NOT NULL DEFAULT 0,
    "debtUSD" REAL NOT NULL DEFAULT 0,
    "creditLimit" REAL NOT NULL DEFAULT 0,
    "paymentTermDays" INTEGER NOT NULL DEFAULT 30,
    "discountPercent" REAL NOT NULL DEFAULT 0,
    "pricePerBag" REAL,
    "productPrices" TEXT,
    "lastPurchase" DATETIME,
    "lastPayment" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Customer" ("address", "balance", "category", "createdAt", "creditLimit", "debt", "debtReminderDays", "discountPercent", "email", "id", "lastPayment", "lastPurchase", "name", "notificationsEnabled", "paymentTermDays", "phone", "pricePerBag", "productPrices", "telegramChatId", "telegramUsername", "updatedAt") SELECT "address", "balance", "category", "createdAt", "creditLimit", "debt", "debtReminderDays", "discountPercent", "email", "id", "lastPayment", "lastPurchase", "name", "notificationsEnabled", "paymentTermDays", "phone", "pricePerBag", "productPrices", "telegramChatId", "telegramUsername", "updatedAt" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
CREATE UNIQUE INDEX "Customer_telegramChatId_key" ON "Customer"("telegramChatId");
CREATE TABLE "new_OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "quantityBags" INTEGER NOT NULL,
    "quantityUnits" INTEGER NOT NULL,
    "pricePerBag" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    "notes" TEXT,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "OrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_OrderItem" ("id", "notes", "orderId", "pricePerBag", "productId", "quantityBags", "quantityUnits", "subtotal") SELECT "id", "notes", "orderId", "pricePerBag", "productId", "quantityBags", "quantityUnits", "subtotal" FROM "OrderItem";
DROP TABLE "OrderItem";
ALTER TABLE "new_OrderItem" RENAME TO "OrderItem";
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");
CREATE INDEX "OrderItem_variantId_idx" ON "OrderItem"("variantId");
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "bagType" TEXT NOT NULL,
    "unitsPerBag" INTEGER NOT NULL,
    "minStockLimit" INTEGER NOT NULL,
    "optimalStock" INTEGER NOT NULL,
    "maxCapacity" INTEGER NOT NULL,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "currentUnits" INTEGER NOT NULL DEFAULT 0,
    "pricePerBag" REAL NOT NULL,
    "productionCost" REAL NOT NULL DEFAULT 0,
    "isParent" BOOLEAN NOT NULL DEFAULT false,
    "parentProductId" TEXT,
    "variantName" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_parentProductId_fkey" FOREIGN KEY ("parentProductId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("bagType", "createdAt", "currentStock", "currentUnits", "id", "maxCapacity", "minStockLimit", "name", "optimalStock", "pricePerBag", "productionCost", "unitsPerBag", "updatedAt") SELECT "bagType", "createdAt", "currentStock", "currentUnits", "id", "maxCapacity", "minStockLimit", "name", "optimalStock", "pricePerBag", "productionCost", "unitsPerBag", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
CREATE TABLE "new_SaleItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saleId" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "quantity" INTEGER NOT NULL,
    "pricePerBag" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SaleItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SaleItem" ("id", "pricePerBag", "productId", "quantity", "saleId", "subtotal") SELECT "id", "pricePerBag", "productId", "quantity", "saleId", "subtotal" FROM "SaleItem";
DROP TABLE "SaleItem";
ALTER TABLE "new_SaleItem" RENAME TO "SaleItem";
CREATE INDEX "SaleItem_saleId_idx" ON "SaleItem"("saleId");
CREATE INDEX "SaleItem_productId_idx" ON "SaleItem"("productId");
CREATE INDEX "SaleItem_variantId_idx" ON "SaleItem"("variantId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE INDEX "ProductVariant_parentId_idx" ON "ProductVariant"("parentId");

-- CreateIndex
CREATE INDEX "ProductVariant_variantName_idx" ON "ProductVariant"("variantName");

-- CreateIndex
CREATE INDEX "ProductVariant_active_idx" ON "ProductVariant"("active");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_parentId_variantName_key" ON "ProductVariant"("parentId", "variantName");

-- CreateIndex
CREATE INDEX "VariantStockMovement_variantId_idx" ON "VariantStockMovement"("variantId");

-- CreateIndex
CREATE INDEX "VariantStockMovement_type_idx" ON "VariantStockMovement"("type");

-- CreateIndex
CREATE INDEX "VariantStockMovement_createdAt_idx" ON "VariantStockMovement"("createdAt");

-- CreateIndex
CREATE INDEX "VariantPriceHistory_variantId_idx" ON "VariantPriceHistory"("variantId");

-- CreateIndex
CREATE INDEX "VariantPriceHistory_createdAt_idx" ON "VariantPriceHistory"("createdAt");
