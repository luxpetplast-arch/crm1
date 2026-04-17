/*
  Warnings:

  - You are about to alter the column `currentStock` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `currentUnits` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `unitsPerBag` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `quantity` on the `Sale` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `quantity` on the `SaleItem` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - Made the column `login` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateTable
CREATE TABLE "CustomerPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'UZS',
    "type" TEXT NOT NULL DEFAULT 'CASH',
    "notes" TEXT,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EmployeeLoan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'UZS',
    "purpose" TEXT NOT NULL,
    "description" TEXT,
    "dueDate" DATETIME,
    "interestRate" REAL NOT NULL DEFAULT 0,
    "remainingAmount" REAL NOT NULL,
    "totalRepaid" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "issuedBy" TEXT NOT NULL,
    "issuedByName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmployeeLoan_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LoanRepayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
    "description" TEXT,
    "isSalaryDeduction" BOOLEAN NOT NULL DEFAULT false,
    "payrollPeriod" TEXT,
    "receivedBy" TEXT NOT NULL,
    "receivedByName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LoanRepayment_loanId_fkey" FOREIGN KEY ("loanId") REFERENCES "EmployeeLoan" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'UZS',
    "alertThreshold" REAL NOT NULL DEFAULT 80,
    "spent" REAL NOT NULL DEFAULT 0,
    "remaining" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "closedAt" DATETIME
);

-- CreateTable
CREATE TABLE "BudgetAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "budgetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "threshold" REAL NOT NULL,
    "currentUsage" REAL NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BudgetAlert_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "bagType" TEXT NOT NULL,
    "unitsPerBag" REAL NOT NULL DEFAULT 1000,
    "minStockLimit" INTEGER NOT NULL,
    "optimalStock" INTEGER NOT NULL,
    "maxCapacity" INTEGER NOT NULL,
    "currentStock" REAL NOT NULL DEFAULT 0,
    "currentUnits" REAL NOT NULL DEFAULT 0,
    "pricePerBag" REAL NOT NULL,
    "pricePerPiece" REAL NOT NULL DEFAULT 0,
    "productionCost" REAL NOT NULL DEFAULT 0,
    "isParent" BOOLEAN NOT NULL DEFAULT false,
    "parentProductId" TEXT,
    "variantName" TEXT,
    "productTypeId" TEXT,
    "warehouse" TEXT NOT NULL DEFAULT 'preform',
    "categoryId" TEXT,
    "sizeId" TEXT,
    "subType" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_parentProductId_fkey" FOREIGN KEY ("parentProductId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "ProductType" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Product_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "ProductSize" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("active", "bagType", "categoryId", "createdAt", "currentStock", "currentUnits", "id", "isParent", "maxCapacity", "minStockLimit", "name", "optimalStock", "parentProductId", "pricePerBag", "productTypeId", "productionCost", "sizeId", "subType", "unitsPerBag", "updatedAt", "variantName") SELECT "active", "bagType", "categoryId", "createdAt", "currentStock", "currentUnits", "id", "isParent", "maxCapacity", "minStockLimit", "name", "optimalStock", "parentProductId", "pricePerBag", "productTypeId", "productionCost", "sizeId", "subType", "unitsPerBag", "updatedAt", "variantName" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
CREATE INDEX "Product_name_idx" ON "Product"("name");
CREATE INDEX "Product_active_idx" ON "Product"("active");
CREATE INDEX "Product_warehouse_idx" ON "Product"("warehouse");
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");
CREATE INDEX "Product_productTypeId_idx" ON "Product"("productTypeId");
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");
CREATE TABLE "new_QualityCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "batchId" TEXT,
    "checkType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "checkedBy" TEXT NOT NULL,
    "checkDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "defects" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QualityCheck_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_QualityCheck" ("batchId", "checkDate", "checkType", "checkedBy", "createdAt", "defects", "id", "notes", "productId", "status") SELECT "batchId", "checkDate", "checkType", "checkedBy", "createdAt", "defects", "id", "notes", "productId", "status" FROM "QualityCheck";
DROP TABLE "QualityCheck";
ALTER TABLE "new_QualityCheck" RENAME TO "QualityCheck";
CREATE INDEX "QualityCheck_productId_idx" ON "QualityCheck"("productId");
CREATE INDEX "QualityCheck_status_idx" ON "QualityCheck"("status");
CREATE INDEX "QualityCheck_checkDate_idx" ON "QualityCheck"("checkDate");
CREATE TABLE "new_Sale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "receiptNumber" INTEGER NOT NULL DEFAULT 0,
    "customerId" TEXT,
    "productId" TEXT,
    "userId" TEXT NOT NULL,
    "driverId" TEXT,
    "quantity" REAL NOT NULL DEFAULT 1,
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
    "isKocha" BOOLEAN NOT NULL DEFAULT false,
    "manualCustomerName" TEXT,
    "manualCustomerPhone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Sale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Sale_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Sale" ("bagType", "createdAt", "currency", "customerId", "customerShare", "driverCollectedAmount", "driverId", "driverPaymentStatus", "factoryShare", "id", "paidAmount", "paymentDetails", "paymentStatus", "pricePerBag", "productId", "quantity", "totalAmount", "userId") SELECT "bagType", "createdAt", "currency", "customerId", "customerShare", "driverCollectedAmount", "driverId", "driverPaymentStatus", "factoryShare", "id", "paidAmount", "paymentDetails", "paymentStatus", "pricePerBag", "productId", "quantity", "totalAmount", "userId" FROM "Sale";
DROP TABLE "Sale";
ALTER TABLE "new_Sale" RENAME TO "Sale";
CREATE INDEX "Sale_customerId_idx" ON "Sale"("customerId");
CREATE INDEX "Sale_productId_idx" ON "Sale"("productId");
CREATE INDEX "Sale_userId_idx" ON "Sale"("userId");
CREATE INDEX "Sale_driverId_idx" ON "Sale"("driverId");
CREATE INDEX "Sale_createdAt_idx" ON "Sale"("createdAt");
CREATE TABLE "new_SaleItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saleId" TEXT NOT NULL,
    "productId" TEXT,
    "variantId" TEXT,
    "quantity" REAL NOT NULL,
    "pricePerBag" REAL NOT NULL,
    "subtotal" REAL NOT NULL,
    CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SaleItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SaleItem" ("id", "pricePerBag", "productId", "quantity", "saleId", "subtotal", "variantId") SELECT "id", "pricePerBag", "productId", "quantity", "saleId", "subtotal", "variantId" FROM "SaleItem";
DROP TABLE "SaleItem";
ALTER TABLE "new_SaleItem" RENAME TO "SaleItem";
CREATE INDEX "SaleItem_saleId_idx" ON "SaleItem"("saleId");
CREATE INDEX "SaleItem_productId_idx" ON "SaleItem"("productId");
CREATE INDEX "SaleItem_variantId_idx" ON "SaleItem"("variantId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "login" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'SELLER',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("active", "createdAt", "email", "id", "login", "name", "password", "role", "updatedAt") SELECT "active", "createdAt", "email", "id", "login", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "CustomerPayment_customerId_idx" ON "CustomerPayment"("customerId");

-- CreateIndex
CREATE INDEX "CustomerPayment_createdAt_idx" ON "CustomerPayment"("createdAt");

-- CreateIndex
CREATE INDEX "EmployeeLoan_employeeId_idx" ON "EmployeeLoan"("employeeId");

-- CreateIndex
CREATE INDEX "EmployeeLoan_status_idx" ON "EmployeeLoan"("status");

-- CreateIndex
CREATE INDEX "EmployeeLoan_dueDate_idx" ON "EmployeeLoan"("dueDate");

-- CreateIndex
CREATE INDEX "LoanRepayment_loanId_idx" ON "LoanRepayment"("loanId");

-- CreateIndex
CREATE INDEX "LoanRepayment_createdAt_idx" ON "LoanRepayment"("createdAt");

-- CreateIndex
CREATE INDEX "Budget_year_idx" ON "Budget"("year");

-- CreateIndex
CREATE INDEX "Budget_month_idx" ON "Budget"("month");

-- CreateIndex
CREATE INDEX "Budget_status_idx" ON "Budget"("status");

-- CreateIndex
CREATE INDEX "Budget_createdAt_idx" ON "Budget"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Budget_category_year_month_key" ON "Budget"("category", "year", "month");

-- CreateIndex
CREATE INDEX "BudgetAlert_budgetId_idx" ON "BudgetAlert"("budgetId");

-- CreateIndex
CREATE INDEX "BudgetAlert_type_idx" ON "BudgetAlert"("type");

-- CreateIndex
CREATE INDEX "BudgetAlert_isRead_idx" ON "BudgetAlert"("isRead");

-- CreateIndex
CREATE INDEX "BudgetAlert_createdAt_idx" ON "BudgetAlert"("createdAt");
