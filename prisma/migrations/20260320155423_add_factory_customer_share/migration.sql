-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "productId" TEXT,
    "userId" TEXT NOT NULL,
    "driverId" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "pricePerBag" REAL NOT NULL DEFAULT 0,
    "bagType" TEXT NOT NULL DEFAULT 'SMALL',
    "totalAmount" REAL NOT NULL,
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentStatus" TEXT NOT NULL DEFAULT 'UNPAID',
    "paymentDetails" TEXT,
    "driverPaymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "driverCollectedAmount" REAL NOT NULL DEFAULT 0,
    "factoryShare" REAL NOT NULL DEFAULT 0,
    "customerShare" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Sale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Sale" ("bagType", "createdAt", "currency", "customerId", "driverCollectedAmount", "driverId", "driverPaymentStatus", "id", "paidAmount", "paymentDetails", "paymentStatus", "pricePerBag", "productId", "quantity", "totalAmount", "userId") SELECT "bagType", "createdAt", "currency", "customerId", "driverCollectedAmount", "driverId", "driverPaymentStatus", "id", "paidAmount", "paymentDetails", "paymentStatus", "pricePerBag", "productId", "quantity", "totalAmount", "userId" FROM "Sale";
DROP TABLE "Sale";
ALTER TABLE "new_Sale" RENAME TO "Sale";
CREATE INDEX "Sale_customerId_idx" ON "Sale"("customerId");
CREATE INDEX "Sale_productId_idx" ON "Sale"("productId");
CREATE INDEX "Sale_userId_idx" ON "Sale"("userId");
CREATE INDEX "Sale_driverId_idx" ON "Sale"("driverId");
CREATE INDEX "Sale_createdAt_idx" ON "Sale"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
