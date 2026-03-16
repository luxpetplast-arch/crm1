-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plateNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "capacity" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "fuelType" TEXT NOT NULL,
    "lastMaintenance" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DriverNew" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "licenseExpiry" DATETIME NOT NULL,
    "telegramChatId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "rating" REAL NOT NULL DEFAULT 5.0,
    "totalDeliveries" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "DeliveryNew" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saleId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "driverId" TEXT,
    "fromAddress" TEXT NOT NULL DEFAULT 'Zavod',
    "toAddress" TEXT NOT NULL,
    "distance" REAL,
    "scheduledDate" DATETIME NOT NULL,
    "departureTime" DATETIME,
    "arrivalTime" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "customerPhone" TEXT,
    "deliveryProof" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DeliveryNew_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "DeliveryNew_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "DriverNew" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeliveryStatusHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deliveryId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "location" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeliveryStatusHistory_deliveryId_fkey" FOREIGN KEY ("deliveryId") REFERENCES "DeliveryNew" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "VehicleExpense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicleId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "VehicleExpense_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CashboxTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "reference" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_plateNumber_key" ON "Vehicle"("plateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DriverNew_phone_key" ON "DriverNew"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "DriverNew_licenseNumber_key" ON "DriverNew"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryNew_saleId_key" ON "DeliveryNew"("saleId");

-- CreateIndex
CREATE INDEX "CashboxTransaction_type_idx" ON "CashboxTransaction"("type");

-- CreateIndex
CREATE INDEX "CashboxTransaction_category_idx" ON "CashboxTransaction"("category");

-- CreateIndex
CREATE INDEX "CashboxTransaction_userId_idx" ON "CashboxTransaction"("userId");

-- CreateIndex
CREATE INDEX "CashboxTransaction_createdAt_idx" ON "CashboxTransaction"("createdAt");
