/*
  Warnings:

  - Added the required column `updatedAt` to the `Driver` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "address" TEXT;
ALTER TABLE "Customer" ADD COLUMN "pricePerBag" REAL;
ALTER TABLE "Customer" ADD COLUMN "productPrices" TEXT;

-- CreateTable
CREATE TABLE "DeliveryAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "assignedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" DATETIME,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "rejectionReason" TEXT,
    "notes" TEXT,
    "customerPhone" TEXT,
    "deliveryAddress" TEXT NOT NULL,
    "estimatedTime" INTEGER,
    "actualTime" INTEGER,
    CONSTRAINT "DeliveryAssignment_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DeliveryAssignment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DriverChat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "driverId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'TEXT',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DriverChat_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DriverChat_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DriverLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "driverId" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "address" TEXT,
    "speed" REAL,
    "heading" REAL,
    "accuracy" REAL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CustomerChat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "adminId" TEXT,
    "message" TEXT NOT NULL,
    "senderType" TEXT NOT NULL,
    "messageType" TEXT NOT NULL DEFAULT 'TEXT',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CustomerChat_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CustomerChat_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Driver" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "vehicleNumber" TEXT NOT NULL,
    "telegramChatId" TEXT,
    "telegramUsername" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "rating" REAL NOT NULL DEFAULT 5.0,
    "totalDeliveries" INTEGER NOT NULL DEFAULT 0,
    "currentLocation" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Driver" ("active", "createdAt", "id", "licenseNumber", "name", "phone", "vehicleNumber") SELECT "active", "createdAt", "id", "licenseNumber", "name", "phone", "vehicleNumber" FROM "Driver";
DROP TABLE "Driver";
ALTER TABLE "new_Driver" RENAME TO "Driver";
CREATE UNIQUE INDEX "Driver_phone_key" ON "Driver"("phone");
CREATE UNIQUE INDEX "Driver_licenseNumber_key" ON "Driver"("licenseNumber");
CREATE UNIQUE INDEX "Driver_telegramChatId_key" ON "Driver"("telegramChatId");
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "requestedDate" DATETIME NOT NULL,
    "promisedDate" DATETIME,
    "deliveredDate" DATETIME,
    "confirmedAt" DATETIME,
    "soldAt" DATETIME,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "paidAmount" REAL NOT NULL DEFAULT 0,
    "paymentDetails" TEXT,
    "saleId" TEXT,
    "notes" TEXT,
    "aiRecommendation" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("aiRecommendation", "createdAt", "customerId", "deliveredDate", "id", "notes", "orderNumber", "priority", "promisedDate", "requestedDate", "status", "totalAmount", "updatedAt") SELECT "aiRecommendation", "createdAt", "customerId", "deliveredDate", "id", "notes", "orderNumber", "priority", "promisedDate", "requestedDate", "status", "totalAmount", "updatedAt" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");
CREATE INDEX "Order_status_idx" ON "Order"("status");
CREATE INDEX "Order_requestedDate_idx" ON "Order"("requestedDate");
CREATE TABLE "new_ProductionPlan" (
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
    CONSTRAINT "ProductionPlan_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProductionPlan" ("aiConfidence", "createdAt", "endDate", "id", "inventoryCheck", "orderId", "planType", "recommendations", "startDate", "status", "totalBags", "totalUnits", "updatedAt") SELECT "aiConfidence", "createdAt", "endDate", "id", "inventoryCheck", "orderId", "planType", "recommendations", "startDate", "status", "totalBags", "totalUnits", "updatedAt" FROM "ProductionPlan";
DROP TABLE "ProductionPlan";
ALTER TABLE "new_ProductionPlan" RENAME TO "ProductionPlan";
CREATE UNIQUE INDEX "ProductionPlan_orderId_key" ON "ProductionPlan"("orderId");
CREATE INDEX "ProductionPlan_orderId_idx" ON "ProductionPlan"("orderId");
CREATE INDEX "ProductionPlan_status_idx" ON "ProductionPlan"("status");
CREATE INDEX "ProductionPlan_startDate_idx" ON "ProductionPlan"("startDate");
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Sale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Sale" ("bagType", "createdAt", "currency", "customerId", "id", "paidAmount", "paymentDetails", "paymentStatus", "pricePerBag", "productId", "quantity", "totalAmount", "userId") SELECT "bagType", "createdAt", "currency", "customerId", "id", "paidAmount", "paymentDetails", "paymentStatus", "pricePerBag", "productId", "quantity", "totalAmount", "userId" FROM "Sale";
DROP TABLE "Sale";
ALTER TABLE "new_Sale" RENAME TO "Sale";
CREATE INDEX "Sale_customerId_idx" ON "Sale"("customerId");
CREATE INDEX "Sale_productId_idx" ON "Sale"("productId");
CREATE INDEX "Sale_userId_idx" ON "Sale"("userId");
CREATE INDEX "Sale_driverId_idx" ON "Sale"("driverId");
CREATE INDEX "Sale_createdAt_idx" ON "Sale"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "DeliveryAssignment_driverId_idx" ON "DeliveryAssignment"("driverId");

-- CreateIndex
CREATE INDEX "DeliveryAssignment_orderId_idx" ON "DeliveryAssignment"("orderId");

-- CreateIndex
CREATE INDEX "DeliveryAssignment_status_idx" ON "DeliveryAssignment"("status");

-- CreateIndex
CREATE INDEX "DriverChat_driverId_idx" ON "DriverChat"("driverId");

-- CreateIndex
CREATE INDEX "DriverChat_adminId_idx" ON "DriverChat"("adminId");

-- CreateIndex
CREATE INDEX "DriverChat_createdAt_idx" ON "DriverChat"("createdAt");

-- CreateIndex
CREATE INDEX "DriverLocation_driverId_idx" ON "DriverLocation"("driverId");

-- CreateIndex
CREATE INDEX "DriverLocation_timestamp_idx" ON "DriverLocation"("timestamp");

-- CreateIndex
CREATE INDEX "CustomerChat_customerId_idx" ON "CustomerChat"("customerId");

-- CreateIndex
CREATE INDEX "CustomerChat_adminId_idx" ON "CustomerChat"("adminId");

-- CreateIndex
CREATE INDEX "CustomerChat_createdAt_idx" ON "CustomerChat"("createdAt");

-- CreateIndex
CREATE INDEX "CustomerChat_isRead_idx" ON "CustomerChat"("isRead");
