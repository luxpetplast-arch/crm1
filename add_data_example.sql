-- Mahsulot qo'shish misoli
INSERT INTO Product (
  id, 
  name, 
  bagType, 
  unitsPerBag, 
  minStockLimit, 
  optimalStock, 
  maxCapacity, 
  currentStock, 
  currentUnits, 
  pricePerBag, 
  productionCost, 
  isParent, 
  active, 
  createdAt, 
  updatedAt
) VALUES (
  'test-product-1',
  'Test Mahsulot',
  'SMALL',
  100,
  50,
  200,
  500,
  100,
  10000,
  2.5,
  1.8,
  false,
  true,
  datetime('now'),
  datetime('now')
);

-- Mijoz qo'shish misoli
INSERT INTO Customer (
  id,
  name,
  phone,
  address,
  balance,
  balanceUZS,
  balanceUSD,
  debt,
  debtUZS,
  debtUSD,
  creditLimit,
  paymentTermDays,
  discountPercent,
  category,
  notificationsEnabled,
  debtReminderDays,
  createdAt,
  updatedAt
) VALUES (
  'customer-1',
  'Test Mijoz',
  '+998901234567',
  'Toshkent shahar',
  0,
  0,
  0,
  0,
  0,
  0,
  1000,
  30,
  5,
  'NORMAL',
  true,
  7,
  datetime('now'),
  datetime('now')
);

-- User qo'shish misoli
INSERT INTO User (
  id,
  email,
  password,
  name,
  role,
  active,
  createdAt,
  updatedAt
) VALUES (
  'user-1',
  'test@example.com',
  '$2a$10$hashedpasswordhere',
  'Test User',
  'SELLER',
  true,
  datetime('now'),
  datetime('now')
);
