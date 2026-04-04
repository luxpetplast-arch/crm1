-- Mahsulotlarni qo'shish skripti
-- Avval kategoriyalar va o'lchamlarni qo'shamiz

-- ProductType qo'shish (agar mavjud bo'lmasa)
INSERT OR IGNORE INTO ProductType (id, name, description, active, createdAt, updatedAt) 
VALUES 
  ('preform-type', 'Preform', 'Preform mahsulotlari', true, datetime('now'), datetime('now'));

-- ProductCategory qo'shish
INSERT OR IGNORE INTO ProductCategory (id, name, description, icon, color, active, productTypeId, createdAt, updatedAt) 
VALUES 
  ('kapsula-category', 'Kapsula', 'Kapsula mahsulotlari', '🧪', '#3B82F6', true, 'preform-type', datetime('now'), datetime('now'));

-- ProductSize larni qo'shish
INSERT OR IGNORE INTO ProductSize (id, name, description, unit, value, active, categoryId, createdAt, updatedAt) 
VALUES 
  ('size-15gr', '15gr', '15 grammli kapsula', 'gr', 15, true, 'kapsula-category', datetime('now'), datetime('now')),
  ('size-21gr', '21gr', '21 grammli kapsula', 'gr', 21, true, 'kapsula-category', datetime('now'), datetime('now')),
  ('size-26gr', '26gr', '26 grammli kapsula', 'gr', 26, true, 'kapsula-category', datetime('now'), datetime('now')),
  ('size-30gr', '30gr', '30 grammli kapsula', 'gr', 30, true, 'kapsula-category', datetime('now'), datetime('now')),
  ('size-36gr', '36gr', '36 grammli kapsula', 'gr', 36, true, 'kapsula-category', datetime('now'), datetime('now')),
  ('size-52gr', '52gr', '52 grammli kapsula', 'gr', 52, true, 'kapsula-category', datetime('now'), datetime('now')),
  ('size-70gr', '70gr', '70 grammli kapsula', 'gr', 70, true, 'kapsula-category', datetime('now'), datetime('now')),
  ('size-75gr', '75gr', '75 grammli kapsula', 'gr', 75, true, 'kapsula-category', datetime('now'), datetime('now')),
  ('size-80gr', '80gr', '80 grammli kapsula', 'gr', 80, true, 'kapsula-category', datetime('now'), datetime('now')),
  ('size-85gr', '85gr', '85 grammli kapsula', 'gr', 85, true, 'kapsula-category', datetime('now'), datetime('now')),
  ('size-86gr', '86gr', '86 grammli kapsula', 'gr', 86, true, 'kapsula-category', datetime('now'), datetime('now')),
  ('size-135gr', '135gr', '135 grammli kapsula', 'gr', 135, true, 'kapsula-category', datetime('now'), datetime('now')),
  ('size-250gr', '250gr', '250 grammli kapsula', 'gr', 250, true, 'kapsula-category', datetime('now'), datetime('now'));

-- 15 gramm mahsulotlari (6 ta)
INSERT OR IGNORE INTO Product (id, name, bagType, unitsPerBag, minStockLimit, optimalStock, maxCapacity, currentStock, currentUnits, pricePerBag, variantName, subType, categoryId, sizeId, active, createdAt, updatedAt) VALUES
('prod-15gr-prozray', 'Kapsula 15 gr прозрая', 'SMALL', 100, 50, 200, 500, 150, 15000, 2.50, 'prozray', 'prozray', 'kapsula-category', 'size-15gr', true, datetime('now'), datetime('now')),
('prod-15gr-gidro', 'Kapsula 15 gr гидро', 'SMALL', 100, 50, 200, 500, 150, 15000, 2.55, 'гидро', 'gidro', 'kapsula-category', 'size-15gr', true, datetime('now'), datetime('now')),
('prod-15gr-siniy', 'Kapsula 15 gr синий', 'SMALL', 100, 50, 200, 500, 150, 15000, 2.60, 'синий', 'siniy', 'kapsula-category', 'size-15gr', true, datetime('now'), datetime('now')),
('prod-15gr-sprite', 'Kapsula 15 gr sprite', 'SMALL', 100, 50, 200, 500, 150, 15000, 2.65, 'sprite', 'sprite', 'kapsula-category', 'size-15gr', true, datetime('now'), datetime('now')),
('prod-15gr-qizil', 'Kapsula 15 gr қизил', 'SMALL', 100, 50, 200, 500, 150, 15000, 2.70, 'қизил', 'qizil', 'kapsula-category', 'size-15gr', true, datetime('now'), datetime('now')),
('prod-15gr-qora', 'Kapsula 15 gr кора', 'SMALL', 100, 50, 200, 500, 150, 15000, 2.75, 'корa', 'qora', 'kapsula-category', 'size-15gr', true, datetime('now'), datetime('now'));

-- 21 gramm mahsulotlari (7 ta)
INSERT OR IGNORE INTO Product (id, name, bagType, unitsPerBag, minStockLimit, optimalStock, maxCapacity, currentStock, currentUnits, pricePerBag, variantName, subType, categoryId, sizeId, active, createdAt, updatedAt) VALUES
('prod-21gr-prozray', 'Kapsula 21 gr прозрая', 'SMALL', 80, 40, 160, 400, 120, 9600, 3.20, 'prozray', 'prozray', 'kapsula-category', 'size-21gr', true, datetime('now'), datetime('now')),
('prod-21gr-gidro', 'Kapsula 21 gr гидро', 'SMALL', 80, 40, 160, 400, 120, 9600, 3.25, 'гидро', 'gidro', 'kapsula-category', 'size-21gr', true, datetime('now'), datetime('now')),
('prod-21gr-24ostoch', 'Kapsula 21 gr 24 Осточ', 'SMALL', 80, 40, 160, 400, 120, 9600, 3.30, '24 Осточ', '24-ostoch', 'kapsula-category', 'size-21gr', true, datetime('now'), datetime('now')),
('prod-21gr-siniy', 'Kapsula 21 gr синий', 'SMALL', 80, 40, 160, 400, 120, 9600, 3.35, 'синий', 'siniy', 'kapsula-category', 'size-21gr', true, datetime('now'), datetime('now')),
('prod-21gr-sprite', 'Kapsula 21 gr sprite', 'SMALL', 80, 40, 160, 400, 120, 9600, 3.40, 'sprite', 'sprite', 'kapsula-category', 'size-21gr', true, datetime('now'), datetime('now')),
('prod-21gr-sariq', 'Kapsula 21 gr ёқ', 'SMALL', 80, 40, 160, 400, 120, 9600, 3.45, 'ёқ', 'sariq', 'kapsula-category', 'size-21gr', true, datetime('now'), datetime('now')),
('prod-21gr-oq', 'Kapsula 21 gr oq', 'SMALL', 80, 40, 160, 400, 120, 9600, 3.50, 'oq', 'oq', 'kapsula-category', 'size-21gr', true, datetime('now'), datetime('now'));

-- 26 gramm mahsulotlari (2 ta)
INSERT OR IGNORE INTO Product (id, name, bagType, unitsPerBag, minStockLimit, optimalStock, maxCapacity, currentStock, currentUnits, pricePerBag, variantName, subType, categoryId, sizeId, active, createdAt, updatedAt) VALUES
('prod-26gr-yog1', 'Kapsula 26 gr ёғ', 'SMALL', 75, 35, 140, 350, 100, 7500, 3.80, 'ёғ', 'yog', 'kapsula-category', 'size-26gr', true, datetime('now'), datetime('now')),
('prod-26gr-yog2', 'Kapsula 26 gr ёг', 'SMALL', 75, 35, 140, 350, 100, 7500, 3.85, 'ёг', 'yog', 'kapsula-category', 'size-26gr', true, datetime('now'), datetime('now'));

-- 30 gramm mahsulotlari (5 ta)
INSERT OR IGNORE INTO Product (id, name, bagType, unitsPerBag, minStockLimit, optimalStock, maxCapacity, currentStock, currentUnits, pricePerBag, variantName, subType, categoryId, sizeId, active, createdAt, updatedAt) VALUES
('prod-30gr-prozray', 'Kapsula 30 gr прозрая', 'SMALL', 70, 30, 120, 300, 80, 5600, 4.50, 'prozray', 'prozray', 'kapsula-category', 'size-30gr', true, datetime('now'), datetime('now')),
('prod-30gr-gidro', 'Kapsula 30 gr гидро', 'SMALL', 70, 30, 120, 300, 80, 5600, 4.55, 'гидро', 'gidro', 'kapsula-category', 'size-30gr', true, datetime('now'), datetime('now')),
('prod-30gr-24ostoch', 'Kapsula 30 gr 24 Осточ', 'SMALL', 70, 30, 120, 300, 80, 5600, 4.60, '24 Осточ', '24-ostoch', 'kapsula-category', 'size-30gr', true, datetime('now'), datetime('now')),
('prod-30gr-sprite', 'Kapsula 30 gr sprite', 'SMALL', 70, 30, 120, 300, 80, 5600, 4.65, 'sprite', 'sprite', 'kapsula-category', 'size-30gr', true, datetime('now'), datetime('now')),
('prod-30gr-siniy', 'Kapsula 30 gr синий', 'SMALL', 70, 30, 120, 300, 80, 5600, 4.70, 'синий', 'siniy', 'kapsula-category', 'size-30gr', true, datetime('now'), datetime('now'));

-- 36 gramm mahsulotlari (1 ta)
INSERT OR IGNORE INTO Product (id, name, bagType, unitsPerBag, minStockLimit, optimalStock, maxCapacity, currentStock, currentUnits, pricePerBag, variantName, subType, categoryId, sizeId, active, createdAt, updatedAt) VALUES
('prod-36gr-yog', 'Kapsula 36 gr ёғ', 'SMALL', 60, 25, 100, 250, 60, 3600, 5.20, 'ёғ', 'yog', 'kapsula-category', 'size-36gr', true, datetime('now'), datetime('now'));

-- 52 gramm mahsulotlari (2 ta)
INSERT OR IGNORE INTO Product (id, name, bagType, unitsPerBag, minStockLimit, optimalStock, maxCapacity, currentStock, currentUnits, pricePerBag, variantName, subType, categoryId, sizeId, active, createdAt, updatedAt) VALUES
('prod-52gr-prozray', 'Kapsula 52 gr прозрая', 'MEDIUM', 50, 20, 80, 200, 50, 2500, 7.80, 'prozray', 'prozray', 'kapsula-category', 'size-52gr', true, datetime('now'), datetime('now')),
('prod-52gr-oq', 'Kapsula 52 gr oq', 'MEDIUM', 50, 20, 80, 200, 50, 2500, 7.85, 'oq', 'oq', 'kapsula-category', 'size-52gr', true, datetime('now'), datetime('now'));

-- 70 gramm mahsulotlari (4 ta)
INSERT OR IGNORE INTO Product (id, name, bagType, unitsPerBag, minStockLimit, optimalStock, maxCapacity, currentStock, currentUnits, pricePerBag, variantName, subType, categoryId, sizeId, active, createdAt, updatedAt) VALUES
('prod-70gr-prozray', 'Kapsula 70 gr прозрая', 'MEDIUM', 40, 15, 60, 150, 40, 1600, 9.50, 'prozray', 'prozray', 'kapsula-category', 'size-70gr', true, datetime('now'), datetime('now')),
('prod-70gr-gidro', 'Kapsula 70 gr гидро', 'MEDIUM', 40, 15, 60, 150, 40, 1600, 9.55, 'гидро', 'gidro', 'kapsula-category', 'size-70gr', true, datetime('now'), datetime('now')),
('prod-70gr-siniy', 'Kapsula 70 gr синий', 'MEDIUM', 40, 15, 60, 150, 40, 1600, 9.60, 'синий', 'siniy', 'kapsula-category', 'size-70gr', true, datetime('now'), datetime('now')),
('prod-70gr-qizil', 'Kapsula 70 gr қизил', 'MEDIUM', 40, 15, 60, 150, 40, 1600, 9.65, 'қизил', 'qizil', 'kapsula-category', 'size-70gr', true, datetime('now'), datetime('now'));

-- 75 gramm mahsulotlari (6 ta)
INSERT OR IGNORE INTO Product (id, name, bagType, unitsPerBag, minStockLimit, optimalStock, maxCapacity, currentStock, currentUnits, pricePerBag, variantName, subType, categoryId, sizeId, active, createdAt, updatedAt) VALUES
('prod-75gr-prozray1', 'Kapsula 75 gr прозрая', 'MEDIUM', 35, 12, 50, 125, 35, 1225, 10.20, 'prozray', 'prozray', 'kapsula-category', 'size-75gr', true, datetime('now'), datetime('now')),
('prod-75gr-sayhun', 'Kapsula 75 gr сайхун', 'MEDIUM', 35, 12, 50, 125, 35, 1225, 10.25, 'сайхун', 'sayhun', 'kapsula-category', 'size-75gr', true, datetime('now'), datetime('now')),
('prod-75gr-gidro', 'Kapsula 75 gr гидро', 'MEDIUM', 35, 12, 50, 125, 35, 1225, 10.30, 'гидро', 'gidro', 'kapsula-category', 'size-75gr', true, datetime('now'), datetime('now')),
('prod-75gr-prozra', 'Kapsula 75 gr прозра', 'MEDIUM', 35, 12, 50, 125, 35, 1225, 10.35, 'прозра', 'prozra', 'kapsula-category', 'size-75gr', true, datetime('now'), datetime('now')),
('prod-75gr-siniy1', 'Kapsula 75 gr синий', 'MEDIUM', 35, 12, 50, 125, 35, 1225, 10.40, 'синий', 'siniy', 'kapsula-category', 'size-75gr', true, datetime('now'), datetime('now')),
('prod-75gr-siniy2', 'Kapsula 75 gr синий', 'MEDIUM', 35, 12, 50, 125, 35, 1225, 10.45, 'синий', 'siniy', 'kapsula-category', 'size-75gr', true, datetime('now'), datetime('now'));

-- 80 gramm mahsulotlari (8 ta)
INSERT OR IGNORE INTO Product (id, name, bagType, unitsPerBag, minStockLimit, optimalStock, maxCapacity, currentStock, currentUnits, pricePerBag, variantName, subType, categoryId, sizeId, active, createdAt, updatedAt) VALUES
('prod-80gr-prozray1', 'Kapsula 80 gr прозрая', 'MEDIUM', 30, 10, 40, 100, 25, 750, 11.50, 'prozray', 'prozray', 'kapsula-category', 'size-80gr', true, datetime('now'), datetime('now')),
('prod-80gr-prozray2', 'Kapsula 80 gr прозрач', 'MEDIUM', 30, 10, 40, 100, 25, 750, 11.55, 'прозрач', 'prozrach', 'kapsula-category', 'size-80gr', true, datetime('now'), datetime('now')),
('prod-80gr-gidro1', 'Kapsula 80 gr гидро', 'MEDIUM', 30, 10, 40, 100, 25, 750, 11.60, 'гидро', 'gidro', 'kapsula-category', 'size-80gr', true, datetime('now'), datetime('now')),
('prod-80gr-gidro2', 'Kapsula 80 gr гидро', 'MEDIUM', 30, 10, 40, 100, 25, 750, 11.65, 'гидро', 'gidro', 'kapsula-category', 'size-80gr', true, datetime('now'), datetime('now')),
('prod-80gr-sayhun1', 'Kapsula 80 gr сайхун', 'MEDIUM', 30, 10, 40, 100, 25, 750, 11.70, 'сайхун', 'sayhun', 'kapsula-category', 'size-80gr', true, datetime('now'), datetime('now')),
('prod-80gr-sayhun2', 'Kapsula 80 gr сайхун', 'MEDIUM', 30, 10, 40, 100, 25, 750, 11.75, 'сайхун', 'sayhun', 'kapsula-category', 'size-80gr', true, datetime('now'), datetime('now')),
('prod-80gr-siniy1', 'Kapsula 80 gr синий', 'MEDIUM', 30, 10, 40, 100, 25, 750, 11.80, 'синий', 'siniy', 'kapsula-category', 'size-80gr', true, datetime('now'), datetime('now')),
('prod-80gr-siniy2', 'Kapsula 80 gr синий', 'MEDIUM', 30, 10, 40, 100, 25, 750, 11.85, 'синий', 'siniy', 'kapsula-category', 'size-80gr', true, datetime('now'), datetime('now'));

-- 85 gramm mahsulotlari (2 ta)
INSERT OR IGNORE INTO Product (id, name, bagType, unitsPerBag, minStockLimit, optimalStock, maxCapacity, currentStock, currentUnits, pricePerBag, variantName, subType, categoryId, sizeId, active, createdAt, updatedAt) VALUES
('prod-85gr-prozray1', 'Kapsula 85 gr прозрая', 'MEDIUM', 25, 8, 35, 90, 20, 500, 12.00, 'prozray', 'prozray', 'kapsula-category', 'size-85gr', true, datetime('now'), datetime('now')),
('prod-85gr-prozray2', 'Kapsula 85 gr прозрая', 'MEDIUM', 25, 8, 35, 90, 20, 500, 12.05, 'prozray', 'prozray', 'kapsula-category', 'size-85gr', true, datetime('now'), datetime('now'));

-- 86 gramm mahsulotlari (2 ta)
INSERT OR IGNORE INTO Product (id, name, bagType, unitsPerBag, minStockLimit, optimalStock, maxCapacity, currentStock, currentUnits, pricePerBag, variantName, subType, categoryId, sizeId, active, createdAt, updatedAt) VALUES
('prod-86gr-prozray1', 'Kapsula 86 gr прозрая', 'MEDIUM', 25, 8, 35, 90, 20, 500, 12.80, 'prozray', 'prozray', 'kapsula-category', 'size-86gr', true, datetime('now'), datetime('now')),
('prod-86gr-prozray2', 'Kapsula 86 gr прозрая', 'MEDIUM', 25, 8, 35, 90, 20, 500, 12.85, 'prozray', 'prozray', 'kapsula-category', 'size-86gr', true, datetime('now'), datetime('now'));

-- 135 gramm mahsulotlari (8 ta)
INSERT OR IGNORE INTO Product (id, name, bagType, unitsPerBag, minStockLimit, optimalStock, maxCapacity, currentStock, currentUnits, pricePerBag, variantName, subType, categoryId, sizeId, active, createdAt, updatedAt) VALUES
('prod-135gr-prozray1', 'Kapsula 135 gr прозрая', 'LARGE', 15, 5, 20, 50, 15, 225, 15.80, 'prozray', 'prozray', 'kapsula-category', 'size-135gr', true, datetime('now'), datetime('now')),
('prod-135gr-prozray2', 'Kapsula 135 gr прозрая', 'LARGE', 15, 5, 20, 50, 15, 225, 15.85, 'prozray', 'prozray', 'kapsula-category', 'size-135gr', true, datetime('now'), datetime('now')),
('prod-135gr-gidro1', 'Kapsula 135 gr гидро', 'LARGE', 15, 5, 20, 50, 15, 225, 15.90, 'гидро', 'gidro', 'kapsula-category', 'size-135gr', true, datetime('now'), datetime('now')),
('prod-135gr-gidro2', 'Kapsula 135 gr гидро', 'LARGE', 15, 5, 20, 50, 15, 225, 15.95, 'гидро', 'gidro', 'kapsula-category', 'size-135gr', true, datetime('now'), datetime('now')),
('prod-135gr-sayhun1', 'Kapsula 135 gr сайхун', 'LARGE', 15, 5, 20, 50, 15, 225, 16.00, 'сайхун', 'sayhun', 'kapsula-category', 'size-135gr', true, datetime('now'), datetime('now')),
('prod-135gr-sayhun2', 'Kapsula 135 gr сайхун+', 'LARGE', 15, 5, 20, 50, 15, 225, 16.05, 'сайхун+', 'sayhun-plus', 'kapsula-category', 'size-135gr', true, datetime('now'), datetime('now')),
('prod-135gr-siniy1', 'Kapsula 135 gr синий', 'LARGE', 15, 5, 20, 50, 15, 225, 16.10, 'синий', 'siniy', 'kapsula-category', 'size-135gr', true, datetime('now'), datetime('now')),
('prod-135gr-siniy2', 'Kapsula 135 gr синий', 'LARGE', 15, 5, 20, 50, 15, 225, 16.15, 'синий', 'siniy', 'kapsula-category', 'size-135gr', true, datetime('now'), datetime('now'));

-- 250 gramm mahsulotlari (2 ta)
INSERT OR IGNORE INTO Product (id, name, bagType, unitsPerBag, minStockLimit, optimalStock, maxCapacity, currentStock, currentUnits, pricePerBag, variantName, subType, categoryId, sizeId, active, createdAt, updatedAt) VALUES
('prod-250gr-nestle', 'Kapsula 250 gr nestlle', 'LARGE', 8, 3, 10, 25, 8, 64, 25.50, 'nestlle', 'nestle', 'kapsula-category', 'size-250gr', true, datetime('now'), datetime('now')),
('prod-250gr-qiyaq', 'Kapsula 250 gr qiyiq', 'LARGE', 8, 3, 10, 25, 8, 64, 25.55, 'qiyiq', 'qiyaq', 'kapsula-category', 'size-250gr', true, datetime('now'), datetime('now'));

-- StockMovement yozuvlarini qo'shish (barcha mahsulotlar uchun boshlang'ich stock)
INSERT INTO StockMovement (id, productId, type, quantity, units, reason, userId, userName, previousStock, previousUnits, newStock, newUnits, notes, createdAt)
SELECT 
  lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))) as id,
  p.id as productId,
  'ADD' as type,
  p.currentStock as quantity,
  p.currentUnits as units,
  'Boshlang''ich mahsulot qo''shish' as reason,
  'system' as userId,
  'System' as userName,
  0 as previousStock,
  0 as previousUnits,
  p.currentStock as newStock,
  p.currentUnits as newUnits,
  'Terminal orqali qo''shilgan mahsulotlar' as notes,
  datetime('now') as createdAt
FROM Product p 
WHERE p.categoryId = 'kapsula-category';
