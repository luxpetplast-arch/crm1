-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "requestedDate" DATETIME NOT NULL,
    "promisedDate" DATETIME,
    "deliveredDate" DATETIME,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "aiRecommendation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantityBags" INTEGER NOT NULL,
    "quantityUnits" INTEGER NOT NULL,
    "pricePerBag" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    "notes" TEXT,
    CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductionPlan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "planType" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "totalBags" INTEGER NOT NULL,
    "totalUnits" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "aiConfidence" REAL NOT NULL DEFAULT 0,
    "inventoryCheck" TEXT,
    "recommendations" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductionPlan_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductionTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "planId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantityBags" INTEGER NOT NULL,
    "quantityUnits" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "assignedTo" TEXT,
    "startTime" DATETIME,
    "endTime" DATETIME,
    "notes" TEXT,
    CONSTRAINT "ProductionTask_planId_fkey" FOREIGN KEY ("planId") REFERENCES "ProductionPlan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_requestedDate_idx" ON "Order"("requestedDate");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductionPlan_orderId_key" ON "ProductionPlan"("orderId");

-- CreateIndex
CREATE INDEX "ProductionPlan_orderId_idx" ON "ProductionPlan"("orderId");

-- CreateIndex
CREATE INDEX "ProductionPlan_status_idx" ON "ProductionPlan"("status");

-- CreateIndex
CREATE INDEX "ProductionPlan_startDate_idx" ON "ProductionPlan"("startDate");

-- CreateIndex
CREATE INDEX "ProductionTask_planId_idx" ON "ProductionTask"("planId");

-- CreateIndex
CREATE INDEX "ProductionTask_status_idx" ON "ProductionTask"("status");
