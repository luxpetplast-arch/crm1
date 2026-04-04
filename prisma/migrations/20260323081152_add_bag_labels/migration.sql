-- CreateTable
CREATE TABLE "BagLabel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "barcode" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "unitsPerBag" INTEGER NOT NULL,
    "bagNumber" INTEGER NOT NULL,
    "workerId" TEXT NOT NULL,
    "productionDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_STOCK',
    "printedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "printedBy" TEXT NOT NULL,
    "soldAt" DATETIME,
    "saleId" TEXT,
    "notes" TEXT,
    CONSTRAINT "BagLabel_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "BagLabel_barcode_key" ON "BagLabel"("barcode");

-- CreateIndex
CREATE INDEX "BagLabel_barcode_idx" ON "BagLabel"("barcode");

-- CreateIndex
CREATE INDEX "BagLabel_productId_idx" ON "BagLabel"("productId");

-- CreateIndex
CREATE INDEX "BagLabel_status_idx" ON "BagLabel"("status");

-- CreateIndex
CREATE INDEX "BagLabel_productionDate_idx" ON "BagLabel"("productionDate");
