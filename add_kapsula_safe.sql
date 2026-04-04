-- Kapsula turlari va mahsulotlarini xavfsiz qo'shish (INSERT OR IGNORE)

-- 1. ProductType (Mahsulot turlari)
INSERT OR IGNORE INTO ProductType (id, name, description, defaultCard, active, createdAt, updatedAt) VALUES
('kapsula-type', 'Kapsula', 'Ichimlik uchun kapsulalar', 'STANDART', true, datetime('now'), datetime('now'));

-- 2. ProductCategory (Mahsulot kategoriyalari)
INSERT OR IGNORE INTO ProductCategory (id, name, description, icon, color, active, productTypeId, createdAt, updatedAt) VALUES
('kapsula-15gr', '15 gramm', '15 grammli kapsulalar', '💊', '#FF6B6B', true, 'kapsula-type', datetime('now'), datetime('now')),
('kapsula-21gr', '21 gramm', '21 grammli kapsulalar', '💊', '#4ECDC4', true, 'kapsula-type', datetime('now'), datetime('now')),
('kapsula-26gr', '26 gramm', '26 grammli kapsulalar', '💊', '#45B7D1', true, 'kapsula-type', datetime('now'), datetime('now')),
('kapsula-30gr', '30 gramm', '30 grammli kapsulalar', '💊', '#96CEB4', true, 'kapsula-type', datetime('now'), datetime('now')),
('kapsula-36gr', '36 gramm', '36 grammli kapsulalar', '💊', '#FFEAA7', true, 'kapsula-type', datetime('now'), datetime('now')),
('kapsula-52gr', '52 gramm', '52 grammli kapsulalar', '💊', '#DDA0DD', true, 'kapsula-type', datetime('now'), datetime('now')),
('kapsula-70gr', '70 gramm', '70 grammli kapsulalar', '💊', '#98D8C8', true, 'kapsula-type', datetime('now'), datetime('now')),
('kapsula-75gr', '75 gramm', '75 grammli kapsulalar', '💊', '#F7DC6F', true, 'kapsula-type', datetime('now'), datetime('now')),
('kapsula-80gr', '80 gramm', '80 grammli kapsulalar', '💊', '#BB8FCE', true, 'kapsula-type', datetime('now'), datetime('now')),
('kapsula-85gr', '85 gramm', '85 grammli kapsulalar', '💊', '#85C1E2', true, 'kapsula-type', datetime('now'), datetime('now')),
('kapsula-86gr', '86 gramm', '86 grammli kapsulalar', '💊', '#F8B739', true, 'kapsula-type', datetime('now'), datetime('now')),
('kapsula-135gr', '135 gramm', '135 grammli kapsulalar', '💊', '#52BE80', true, 'kapsula-type', datetime('now'), datetime('now')),
('kapsula-250gr', '250 gramm', '250 grammli kapsulalar', '💊', '#E74C3C', true, 'kapsula-type', datetime('now'), datetime('now'));

-- 3. ProductSize (Mahsulot o'lchamlari)
INSERT OR IGNORE INTO ProductSize (id, name, description, unit, value, active, categoryId, createdAt, updatedAt) VALUES
('size-15gr', '15gr', '15 gramm', 'gr', 15, true, 'kapsula-15gr', datetime('now'), datetime('now')),
('size-21gr', '21gr', '21 gramm', 'gr', 21, true, 'kapsula-21gr', datetime('now'), datetime('now')),
('size-26gr', '26gr', '26 gramm', 'gr', 26, true, 'kapsula-26gr', datetime('now'), datetime('now')),
('size-30gr', '30gr', '30 gramm', 'gr', 30, true, 'kapsula-30gr', datetime('now'), datetime('now')),
('size-36gr', '36gr', '36 gramm', 'gr', 36, true, 'kapsula-36gr', datetime('now'), datetime('now')),
('size-52gr', '52gr', '52 gramm', 'gr', 52, true, 'kapsula-52gr', datetime('now'), datetime('now')),
('size-70gr', '70gr', '70 gramm', 'gr', 70, true, 'kapsula-70gr', datetime('now'), datetime('now')),
('size-75gr', '75gr', '75 gramm', 'gr', 75, true, 'kapsula-75gr', datetime('now'), datetime('now')),
('size-80gr', '80gr', '80 gramm', 'gr', 80, true, 'kapsula-80gr', datetime('now'), datetime('now')),
('size-85gr', '85gr', '85 gramm', 'gr', 85, true, 'kapsula-85gr', datetime('now'), datetime('now')),
('size-86gr', '86gr', '86 gramm', 'gr', 86, true, 'kapsula-86gr', datetime('now'), datetime('now')),
('size-135gr', '135gr', '135 gramm', 'gr', 135, true, 'kapsula-135gr', datetime('now'), datetime('now')),
('size-250gr', '250gr', '250 gramm', 'gr', 250, true, 'kapsula-250gr', datetime('now'), datetime('now'));

-- 4. Kapsula mahsulotlari (to'g'ri kategoriyalar bilan)
-- 15 gramm - 6 ta mahsulot
INSERT OR IGNORE INTO Product (id, name, bagType, unitsPerBag, minStockLimit, optimalStock, maxCapacity, currentStock, currentUnits, pricePerBag, productionCost, isParent, active, productTypeId, categoryId, sizeId, createdAt, updatedAt) VALUES
('kapsula-15-prozraya', 'Kapsula 15 gr прозрая', 'SMALL', 100, 50, 200, 500, 100, 10000, 0.50, 0.30, false, true, 'kapsula-type', 'kapsula-15gr', 'size-15gr', datetime('now'), datetime('now')),
('kapsula-15-gidro', 'Kapsula 15 gr гидро', 'SMALL', 100, 50, 200, 500, 100, 10000, 0.55, 0.35, false, true, 'kapsula-type', 'kapsula-15gr', 'size-15gr', datetime('now'), datetime('now')),
('kapsula-15-siniy', 'Kapsula 15 gr синий', 'SMALL', 100, 50, 200, 500, 100, 10000, 0.52, 0.32, false, true, 'kapsula-type', 'kapsula-15gr', 'size-15gr', datetime('now'), datetime('now')),
('kapsula-15-sprite', 'Kapsula 15 gr sprite', 'SMALL', 100, 50, 200, 500, 100, 10000, 0.53, 0.33, false, true, 'kapsula-type', 'kapsula-15gr', 'size-15gr', datetime('now'), datetime('now')),
('kapsula-15-qizil', 'Kapsula 15 gr қизил', 'SMALL', 100, 50, 200, 500, 100, 10000, 0.51, 0.31, false, true, 'kapsula-type', 'kapsula-15gr', 'size-15gr', datetime('now'), datetime('now')),
('kapsula-15-qora', 'Kapsula 15 gr кора', 'SMALL', 100, 50, 200, 500, 100, 10000, 0.54, 0.34, false, true, 'kapsula-type', 'kapsula-15gr', 'size-15gr', datetime('now'), datetime('now')),

-- 21 gramm - 7 ta mahsulot
('kapsula-21-prozraya', 'Kapsula 21 gr прозрая', 'SMALL', 80, 40, 160, 400, 80, 6400, 0.65, 0.40, false, true, 'kapsula-type', 'kapsula-21gr', 'size-21gr', datetime('now'), datetime('now')),
('kapsula-21-gidro', 'Kapsula 21 gr гидро', 'SMALL', 80, 40, 160, 400, 80, 6400, 0.70, 0.45, false, true, 'kapsula-type', 'kapsula-21gr', 'size-21gr', datetime('now'), datetime('now')),
('kapsula-21-24-ostoch', 'Kapsula 21 gr 24 Осточ', 'SMALL', 80, 40, 160, 400, 80, 6400, 0.68, 0.43, false, true, 'kapsula-type', 'kapsula-21gr', 'size-21gr', datetime('now'), datetime('now')),
('kapsula-21-siniy', 'Kapsula 21 gr синий', 'SMALL', 80, 40, 160, 400, 80, 6400, 0.66, 0.41, false, true, 'kapsula-type', 'kapsula-21gr', 'size-21gr', datetime('now'), datetime('now')),
('kapsula-21-sprite', 'Kapsula 21 gr sprite', 'SMALL', 80, 40, 160, 400, 80, 6400, 0.67, 0.42, false, true, 'kapsula-type', 'kapsula-21gr', 'size-21gr', datetime('now'), datetime('now')),
('kapsula-21-sariq', 'Kapsula 21 gr ёқ', 'SMALL', 80, 40, 160, 400, 80, 6400, 0.64, 0.39, false, true, 'kapsula-type', 'kapsula-21gr', 'size-21gr', datetime('now'), datetime('now')),
('kapsula-21-oq', 'Kapsula 21 gr oq', 'SMALL', 80, 40, 160, 400, 80, 6400, 0.63, 0.38, false, true, 'kapsula-type', 'kapsula-21gr', 'size-21gr', datetime('now'), datetime('now')),

-- 26 gramm - 2 ta mahsulot
('kapsula-26-yog', 'Kapsula 26 gr ёғ', 'SMALL', 70, 35, 140, 350, 70, 4900, 0.80, 0.50, false, true, 'kapsula-type', 'kapsula-26gr', 'size-26gr', datetime('now'), datetime('now')),
('kapsula-26-yog2', 'Kapsula 26 gr ёг', 'SMALL', 70, 35, 140, 350, 70, 4900, 0.80, 0.50, false, true, 'kapsula-type', 'kapsula-26gr', 'size-26gr', datetime('now'), datetime('now')),

-- 30 gramm - 5 ta mahsulot
('kapsula-30-prozraya', 'Kapsula 30 gr прозрая', 'SMALL', 60, 30, 120, 300, 60, 3600, 0.90, 0.55, false, true, 'kapsula-type', 'kapsula-30gr', 'size-30gr', datetime('now'), datetime('now')),
('kapsula-30-gidro', 'Kapsula 30 gr гидро', 'SMALL', 60, 30, 120, 300, 60, 3600, 0.95, 0.60, false, true, 'kapsula-type', 'kapsula-30gr', 'size-30gr', datetime('now'), datetime('now')),
('kapsula-30-24-ostoch', 'Kapsula 30 gr 24 Осточ', 'SMALL', 60, 30, 120, 300, 60, 3600, 0.92, 0.57, false, true, 'kapsula-type', 'kapsula-30gr', 'size-30gr', datetime('now'), datetime('now')),
('kapsula-30-sprite', 'Kapsula 30 gr sprite', 'SMALL', 60, 30, 120, 300, 60, 3600, 0.93, 0.58, false, true, 'kapsula-type', 'kapsula-30gr', 'size-30gr', datetime('now'), datetime('now')),
('kapsula-30-siniy', 'Kapsula 30 gr синий', 'SMALL', 60, 30, 120, 300, 60, 3600, 0.91, 0.56, false, true, 'kapsula-type', 'kapsula-30gr', 'size-30gr', datetime('now'), datetime('now')),

-- 36 gramm - 1 ta mahsulot
('kapsula-36-yog', 'Kapsula 36 gr ёғ', 'SMALL', 50, 25, 100, 250, 50, 2500, 1.10, 0.70, false, true, 'kapsula-type', 'kapsula-36gr', 'size-36gr', datetime('now'), datetime('now')),

-- 52 gramm - 2 ta mahsulot
('kapsula-52-prozraya', 'Kapsula 52 gr прозрая', 'SMALL', 40, 20, 80, 200, 40, 1600, 1.50, 0.95, false, true, 'kapsula-type', 'kapsula-52gr', 'size-52gr', datetime('now'), datetime('now')),
('kapsula-52-oq', 'Kapsula 52 gr oq', 'SMALL', 40, 20, 80, 200, 40, 1600, 1.48, 0.93, false, true, 'kapsula-type', 'kapsula-52gr', 'size-52gr', datetime('now'), datetime('now')),

-- 70 gramm - 4 ta mahsulot
('kapsula-70-prozraya', 'Kapsula 70 gr прозрая', 'LARGE', 30, 15, 60, 150, 30, 900, 2.00, 1.25, false, true, 'kapsula-type', 'kapsula-70gr', 'size-70gr', datetime('now'), datetime('now')),
('kapsula-70-gidro', 'Kapsula 70 gr гидро', 'LARGE', 30, 15, 60, 150, 30, 900, 2.10, 1.35, false, true, 'kapsula-type', 'kapsula-70gr', 'size-70gr', datetime('now'), datetime('now')),
('kapsula-70-siniy', 'Kapsula 70 gr синий', 'LARGE', 30, 15, 60, 150, 30, 900, 2.05, 1.30, false, true, 'kapsula-type', 'kapsula-70gr', 'size-70gr', datetime('now'), datetime('now')),
('kapsula-70-qizil', 'Kapsula 70 gr қизил', 'LARGE', 30, 15, 60, 150, 30, 900, 2.02, 1.27, false, true, 'kapsula-type', 'kapsula-70gr', 'size-70gr', datetime('now'), datetime('now')),

-- 75 gramm - 6 ta mahsulot
('kapsula-75-prozraya', 'Kapsula 75 gr прозрая', 'LARGE', 25, 12, 50, 125, 25, 750, 2.20, 1.40, false, true, 'kapsula-type', 'kapsula-75gr', 'size-75gr', datetime('now'), datetime('now')),
('kapsula-75-sayxun', 'Kapsula 75 gr сайхун', 'LARGE', 25, 12, 50, 125, 25, 750, 2.25, 1.45, false, true, 'kapsula-type', 'kapsula-75gr', 'size-75gr', datetime('now'), datetime('now')),
('kapsula-75-gidro', 'Kapsula 75 gr гидро', 'LARGE', 25, 12, 50, 125, 25, 750, 2.30, 1.50, false, true, 'kapsula-type', 'kapsula-75gr', 'size-75gr', datetime('now'), datetime('now')),
('kapsula-75-prozra', 'Kapsula 75 gr прозра', 'LARGE', 25, 12, 50, 125, 25, 750, 2.18, 1.38, false, true, 'kapsula-type', 'kapsula-75gr', 'size-75gr', datetime('now'), datetime('now')),
('kapsula-75-siniy1', 'Kapsula 75 gr синий 1', 'LARGE', 25, 12, 50, 125, 25, 750, 2.22, 1.42, false, true, 'kapsula-type', 'kapsula-75gr', 'size-75gr', datetime('now'), datetime('now')),
('kapsula-75-siniy2', 'Kapsula 75 gr синий 2', 'LARGE', 25, 12, 50, 125, 25, 750, 2.22, 1.42, false, true, 'kapsula-type', 'kapsula-75gr', 'size-75gr', datetime('now'), datetime('now')),

-- 80 gramm - 8 ta mahsulot
('kapsula-80-prozraya', 'Kapsula 80 gr прозрая', 'LARGE', 20, 10, 40, 100, 20, 400, 2.50, 1.60, false, true, 'kapsula-type', 'kapsula-80gr', 'size-80gr', datetime('now'), datetime('now')),
('kapsula-80-prozrach', 'Kapsula 80 gr прозрач', 'LARGE', 20, 10, 40, 100, 20, 400, 2.48, 1.58, false, true, 'kapsula-type', 'kapsula-80gr', 'size-80gr', datetime('now'), datetime('now')),
('kapsula-80-gidro1', 'Kapsula 80 gr гидро 1', 'LARGE', 20, 10, 40, 100, 20, 400, 2.55, 1.65, false, true, 'kapsula-type', 'kapsula-80gr', 'size-80gr', datetime('now'), datetime('now')),
('kapsula-80-gidro2', 'Kapsula 80 gr гидро 2', 'LARGE', 20, 10, 40, 100, 20, 400, 2.55, 1.65, false, true, 'kapsula-type', 'kapsula-80gr', 'size-80gr', datetime('now'), datetime('now')),
('kapsula-80-sayxun1', 'Kapsula 80 gr сайхун 1', 'LARGE', 20, 10, 40, 100, 20, 400, 2.60, 1.70, false, true, 'kapsula-type', 'kapsula-80gr', 'size-80gr', datetime('now'), datetime('now')),
('kapsula-80-sayxun2', 'Kapsula 80 gr сайхун 2', 'LARGE', 20, 10, 40, 100, 20, 400, 2.60, 1.70, false, true, 'kapsula-type', 'kapsula-80gr', 'size-80gr', datetime('now'), datetime('now')),
('kapsula-80-siniy1', 'Kapsula 80 gr синий 1', 'LARGE', 20, 10, 40, 100, 20, 400, 2.52, 1.62, false, true, 'kapsula-type', 'kapsula-80gr', 'size-80gr', datetime('now'), datetime('now')),
('kapsula-80-siniy2', 'Kapsula 80 gr синий 2', 'LARGE', 20, 10, 40, 100, 20, 400, 2.52, 1.62, false, true, 'kapsula-type', 'kapsula-80gr', 'size-80gr', datetime('now'), datetime('now')),

-- 85 gramm - 2 ta mahsulot
('kapsula-85-prozraya1', 'Kapsula 85 gr прозрая 1', 'LARGE', 18, 9, 36, 90, 18, 324, 2.80, 1.80, false, true, 'kapsula-type', 'kapsula-85gr', 'size-85gr', datetime('now'), datetime('now')),
('kapsula-85-prozraya2', 'Kapsula 85 gr прозрая 2', 'LARGE', 18, 9, 36, 90, 18, 324, 2.80, 1.80, false, true, 'kapsula-type', 'kapsula-85gr', 'size-85gr', datetime('now'), datetime('now')),

-- 86 gramm - 2 ta mahsulot
('kapsula-86-prozraya1', 'Kapsula 86 gr прозрая 1', 'LARGE', 18, 9, 36, 90, 18, 324, 2.85, 1.85, false, true, 'kapsula-type', 'kapsula-86gr', 'size-86gr', datetime('now'), datetime('now')),
('kapsula-86-prozraya2', 'Kapsula 86 gr прозрая 2', 'LARGE', 18, 9, 36, 90, 18, 324, 2.85, 1.85, false, true, 'kapsula-type', 'kapsula-86gr', 'size-86gr', datetime('now'), datetime('now')),

-- 135 gramm - 8 ta mahsulot
('kapsula-135-prozraya1', 'Kapsula 135 gr прозрая 1', 'LARGE', 10, 5, 20, 50, 10, 100, 4.50, 2.90, false, true, 'kapsula-type', 'kapsula-135gr', 'size-135gr', datetime('now'), datetime('now')),
('kapsula-135-prozraya2', 'Kapsula 135 gr прозрая 2', 'LARGE', 10, 5, 20, 50, 10, 100, 4.50, 2.90, false, true, 'kapsula-type', 'kapsula-135gr', 'size-135gr', datetime('now'), datetime('now')),
('kapsula-135-gidro1', 'Kapsula 135 gr гидро 1', 'LARGE', 10, 5, 20, 50, 10, 100, 4.60, 3.00, false, true, 'kapsula-type', 'kapsula-135gr', 'size-135gr', datetime('now'), datetime('now')),
('kapsula-135-gidro2', 'Kapsula 135 gr гидро 2', 'LARGE', 10, 5, 20, 50, 10, 100, 4.60, 3.00, false, true, 'kapsula-type', 'kapsula-135gr', 'size-135gr', datetime('now'), datetime('now')),
('kapsula-135-sayxun1', 'Kapsula 135 gr сайхун', 'LARGE', 10, 5, 20, 50, 10, 100, 4.70, 3.10, false, true, 'kapsula-type', 'kapsula-135gr', 'size-135gr', datetime('now'), datetime('now')),
('kapsula-135-sayxun2', 'Kapsula 135 gr сайхун+', 'LARGE', 10, 5, 20, 50, 10, 100, 4.75, 3.15, false, true, 'kapsula-type', 'kapsula-135gr', 'size-135gr', datetime('now'), datetime('now')),
('kapsula-135-siniy1', 'Kapsula 135 gr синий 1', 'LARGE', 10, 5, 20, 50, 10, 100, 4.55, 2.95, false, true, 'kapsula-type', 'kapsula-135gr', 'size-135gr', datetime('now'), datetime('now')),
('kapsula-135-siniy2', 'Kapsula 135 gr синий 2', 'LARGE', 10, 5, 20, 50, 10, 100, 4.55, 2.95, false, true, 'kapsula-type', 'kapsula-135gr', 'size-135gr', datetime('now'), datetime('now')),

-- 250 gramm - 2 ta mahsulot
('kapsula-250-nestle', 'Kapsula 250 gr nestlle', 'LARGE', 5, 2, 10, 25, 5, 25, 8.00, 5.20, false, true, 'kapsula-type', 'kapsula-250gr', 'size-250gr', datetime('now'), datetime('now')),
('kapsula-250-qiyaq', 'Kapsula 250 gr qiyiq', 'LARGE', 5, 2, 10, 25, 5, 25, 7.80, 5.00, false, true, 'kapsula-type', 'kapsula-250gr', 'size-250gr', datetime('now'), datetime('now'));
