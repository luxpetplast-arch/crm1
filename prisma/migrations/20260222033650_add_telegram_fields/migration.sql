-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
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
    CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "telegramChatId" TEXT,
    "telegramUsername" TEXT,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "debtReminderDays" INTEGER NOT NULL DEFAULT 7,
    "category" TEXT NOT NULL DEFAULT 'NORMAL',
    "balance" REAL NOT NULL DEFAULT 0,
    "debt" REAL NOT NULL DEFAULT 0,
    "creditLimit" REAL NOT NULL DEFAULT 0,
    "paymentTermDays" INTEGER NOT NULL DEFAULT 30,
    "discountPercent" REAL NOT NULL DEFAULT 0,
    "lastPurchase" DATETIME,
    "lastPayment" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Customer" ("balance", "category", "createdAt", "creditLimit", "debt", "discountPercent", "email", "id", "lastPayment", "lastPurchase", "name", "paymentTermDays", "phone", "updatedAt") SELECT "balance", "category", "createdAt", "creditLimit", "debt", "discountPercent", "email", "id", "lastPayment", "lastPurchase", "name", "paymentTermDays", "phone", "updatedAt" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
CREATE UNIQUE INDEX "Customer_telegramChatId_key" ON "Customer"("telegramChatId");
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Product" ("bagType", "createdAt", "currentStock", "id", "maxCapacity", "minStockLimit", "name", "optimalStock", "pricePerBag", "productionCost", "unitsPerBag", "updatedAt") SELECT "bagType", "createdAt", "currentStock", "id", "maxCapacity", "minStockLimit", "name", "optimalStock", "pricePerBag", "productionCost", "unitsPerBag", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "StockMovement_productId_idx" ON "StockMovement"("productId");

-- CreateIndex
CREATE INDEX "StockMovement_type_idx" ON "StockMovement"("type");

-- CreateIndex
CREATE INDEX "StockMovement_createdAt_idx" ON "StockMovement"("createdAt");
