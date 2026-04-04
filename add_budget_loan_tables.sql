-- Add Budget, BudgetAlert, EmployeeLoan, LoanRepayment, ScheduledPayment tables
-- WITHOUT deleting existing data

-- Budget table
CREATE TABLE IF NOT EXISTS "Budget" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "spent" REAL NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'UZS',
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "alertThreshold" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- BudgetAlert table
CREATE TABLE IF NOT EXISTS "BudgetAlert" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "budgetId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'WARNING',
    "isRead" BOOLEAN NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- EmployeeLoan table
CREATE TABLE IF NOT EXISTS "EmployeeLoan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeName" TEXT NOT NULL,
    "employeeId" TEXT,
    "amount" REAL NOT NULL,
    "remainingAmount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'UZS',
    "purpose" TEXT,
    "interestRate" REAL DEFAULT 0,
    "loanDate" DATETIME NOT NULL,
    "dueDate" DATETIME,
    "repaymentType" TEXT NOT NULL DEFAULT 'SALARY_DEDUCTION',
    "monthlyDeduction" REAL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "approvedBy" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- LoanRepayment table
CREATE TABLE IF NOT EXISTS "LoanRepayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'MANUAL',
    "source" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ScheduledPayment table
CREATE TABLE IF NOT EXISTS "ScheduledPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loanId" TEXT,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT 0,
    "recurringType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "Budget_category_idx" ON "Budget"("category");
CREATE INDEX IF NOT EXISTS "Budget_month_year_idx" ON "Budget"("month", "year");
CREATE INDEX IF NOT EXISTS "BudgetAlert_budgetId_idx" ON "BudgetAlert"("budgetId");
CREATE INDEX IF NOT EXISTS "EmployeeLoan_employeeId_idx" ON "EmployeeLoan"("employeeId");
CREATE INDEX IF NOT EXISTS "EmployeeLoan_status_idx" ON "EmployeeLoan"("status");
CREATE INDEX IF NOT EXISTS "LoanRepayment_loanId_idx" ON "LoanRepayment"("loanId");
CREATE INDEX IF NOT EXISTS "ScheduledPayment_loanId_idx" ON "ScheduledPayment"("loanId");
CREATE INDEX IF NOT EXISTS "ScheduledPayment_dueDate_idx" ON "ScheduledPayment"("dueDate");
