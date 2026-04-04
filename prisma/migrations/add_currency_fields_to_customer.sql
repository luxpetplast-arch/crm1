-- Add currency fields to Customer model
ALTER TABLE Customer ADD COLUMN debtUZS REAL DEFAULT 0;
ALTER TABLE Customer ADD COLUMN debtUSD REAL DEFAULT 0;
ALTER TABLE Customer ADD COLUMN balanceUZS REAL DEFAULT 0;
ALTER TABLE Customer ADD COLUMN balanceUSD REAL DEFAULT 0;

-- Migrate existing data
-- Convert existing debt and balance to USD (assuming they were in USD)
UPDATE Customer SET debtUSD = debt, balanceUSD = balance WHERE debtUSD = 0 AND balanceUSD = 0;

-- Set UZS values based on current exchange rate (12500 UZS = 1 USD)
UPDATE Customer SET debtUZS = debt * 12500, balanceUZS = balance * 12500 WHERE debtUZS = 0 AND balanceUZS = 0;
