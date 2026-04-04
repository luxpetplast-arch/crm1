# SQLite Terminal orqali ma'lumot qo'shish

## 1. Ma'lumotlar bazasiga ulanish
```bash
sqlite3 prisma/dev.db
```

## 2. Jadvallarni ko'rish
```sql
.tables
```

## 3. Mahsulot qo'shish
```sql
INSERT INTO Product (
  id, name, bagType, unitsPerBag, minStockLimit, optimalStock, 
  maxCapacity, currentStock, currentUnits, pricePerBag, 
  productionCost, isParent, active, createdAt, updatedAt
) VALUES (
  'new-product-id',
  'Yangi Mahsulot',
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
```

## 4. Mijoz qo'shish
```sql
INSERT INTO Customer (
  id, name, phone, address, balance, balanceUZS, balanceUSD,
  debt, debtUZS, debtUSD, creditLimit, paymentTermDays,
  discountPercent, category, notificationsEnabled,
  debtReminderDays, createdAt, updatedAt
) VALUES (
  'customer-id',
  'Mijoz Ismi',
  '+998901234567',
  'Manzil',
  0, 0, 0,
  0, 0, 0,
  1000,
  30,
  5,
  'NORMAL',
  true,
  7,
  datetime('now'),
  datetime('now')
);
```

## 5. Ma'lumotlarni ko'rish
```sql
-- Barcha mahsulotlar
SELECT * FROM Product;

-- Barcha mijozlar
SELECT * FROM Customer;

-- Oxirgi 10 ta sotuv
SELECT * FROM Sale ORDER BY createdAt DESC LIMIT 10;
```

## 6. Ma'lumotlarni yangilash
```sql
UPDATE Product 
SET currentStock = 150, 
    currentUnits = 15000 
WHERE id = 'product-id';
```

## 7. Ma'lumotlarni o'chirish
```sql
DELETE FROM Product WHERE id = 'product-id';
```

## 8. Chiqish
```sql
.quit
```

## Qisqa yo'llar
- `sqlite3 prisma/dev.db < add_data_example.sql` - SQL faylini bajarish
- `.mode csv` - CSV formatida ko'rish
- `.headers on` - Sarlavhalarni ko'rsatish
