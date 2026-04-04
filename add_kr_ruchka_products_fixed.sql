-- Krishka va ruchka mahsulotlarini qo'shish
INSERT INTO Product (id, name, bagType, unitsPerBag, minStockLimit, optimalStock, maxCapacity, currentStock, currentUnits, pricePerBag, productionCost, isParent, active, productTypeId, categoryId, sizeId, createdAt, updatedAt) VALUES
('krishka-standart', 'Krishka standart', 'SMALL', 1000, 500, 2000, 5000, 1000, 0.50, 0.20, false, true, 'kapsula-type', 'kapsula-15gr', 'size-15gr', datetime('now'), datetime('now')),
('ruchka-standart', 'Ruchka standart', 'SMALL', 1000, 500, 2000, 5000, 1000, 0.30, 0.15, false, true, 'kapsula-type', 'kapsula-15gr', 'size-15gr', datetime('now'), datetime('now'));
