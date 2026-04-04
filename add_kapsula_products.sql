-- Kapsula mahsulotlarini qo'shish SQL skripti

-- 15 gramm - 6 ta mahsulot
INSERT INTO Product (id, name, bagType, unitsPerBag, minStockLimit, optimalStock, maxCapacity, currentStock, currentUnits, pricePerBag, productionCost, isParent, active, createdAt, updatedAt) VALUES
('kapsula-15-prozraya', 'Kapsula 15 gr прозрая', 'SMALL', 100, 50, 200, 500, 100, 10000, 0.50, 0.30, false, true, datetime('now'), datetime('now')),
('kapsula-15-gidro', 'Kapsula 15 gr гидро', 'SMALL', 100, 50, 200, 500, 100, 10000, 0.55, 0.35, false, true, datetime('now'), datetime('now')),
('kapsula-15-siniy', 'Kapsula 15 gr синий', 'SMALL', 100, 50, 200, 500, 100, 10000, 0.52, 0.32, false, true, datetime('now'), datetime('now')),
('kapsula-15-sprite', 'Kapsula 15 gr sprite', 'SMALL', 100, 50, 200, 500, 100, 10000, 0.53, 0.33, false, true, datetime('now'), datetime('now')),
('kapsula-15-qizil', 'Kapsula 15 gr қизил', 'SMALL', 100, 50, 200, 500, 100, 10000, 0.51, 0.31, false, true, datetime('now'), datetime('now')),
('kapsula-15-qora', 'Kapsula 15 gr кора', 'SMALL', 100, 50, 200, 500, 100, 10000, 0.54, 0.34, false, true, datetime('now'), datetime('now')),

-- 21 gramm - 7 ta mahsulot
('kapsula-21-prozraya', 'Kapsula 21 gr прозрая', 'SMALL', 80, 40, 160, 400, 80, 6400, 0.65, 0.40, false, true, datetime('now'), datetime('now')),
('kapsula-21-gidro', 'Kapsula 21 gr гидро', 'SMALL', 80, 40, 160, 400, 80, 6400, 0.70, 0.45, false, true, datetime('now'), datetime('now')),
('kapsula-21-24-ostoch', 'Kapsula 21 gr 24 Осточ', 'SMALL', 80, 40, 160, 400, 80, 6400, 0.68, 0.43, false, true, datetime('now'), datetime('now')),
('kapsula-21-siniy', 'Kapsula 21 gr синий', 'SMALL', 80, 40, 160, 400, 80, 6400, 0.66, 0.41, false, true, datetime('now'), datetime('now')),
('kapsula-21-sprite', 'Kapsula 21 gr sprite', 'SMALL', 80, 40, 160, 400, 80, 6400, 0.67, 0.42, false, true, datetime('now'), datetime('now')),
('kapsula-21-sariq', 'Kapsula 21 gr ёқ', 'SMALL', 80, 40, 160, 400, 80, 6400, 0.64, 0.39, false, true, datetime('now'), datetime('now')),
('kapsula-21-oq', 'Kapsula 21 gr oq', 'SMALL', 80, 40, 160, 400, 80, 6400, 0.63, 0.38, false, true, datetime('now'), datetime('now')),

-- 26 gramm - 2 ta mahsulot
('kapsula-26-yog', 'Kapsula 26 gr ёғ', 'SMALL', 70, 35, 140, 350, 70, 4900, 0.80, 0.50, false, true, datetime('now'), datetime('now')),
('kapsula-26-yog2', 'Kapsula 26 gr ёг', 'SMALL', 70, 35, 140, 350, 70, 4900, 0.80, 0.50, false, true, datetime('now'), datetime('now')),

-- 30 gramm - 5 ta mahsulot
('kapsula-30-prozraya', 'Kapsula 30 gr прозрая', 'SMALL', 60, 30, 120, 300, 60, 3600, 0.90, 0.55, false, true, datetime('now'), datetime('now')),
('kapsula-30-gidro', 'Kapsula 30 gr гидро', 'SMALL', 60, 30, 120, 300, 60, 3600, 0.95, 0.60, false, true, datetime('now'), datetime('now')),
('kapsula-30-24-ostoch', 'Kapsula 30 gr 24 Осточ', 'SMALL', 60, 30, 120, 300, 60, 3600, 0.92, 0.57, false, true, datetime('now'), datetime('now')),
('kapsula-30-sprite', 'Kapsula 30 gr sprite', 'SMALL', 60, 30, 120, 300, 60, 3600, 0.93, 0.58, false, true, datetime('now'), datetime('now')),
('kapsula-30-siniy', 'Kapsula 30 gr синий', 'SMALL', 60, 30, 120, 300, 60, 3600, 0.91, 0.56, false, true, datetime('now'), datetime('now')),

-- 36 gramm - 1 ta mahsulot
('kapsula-36-yog', 'Kapsula 36 gr ёғ', 'SMALL', 50, 25, 100, 250, 50, 2500, 1.10, 0.70, false, true, datetime('now'), datetime('now')),

-- 52 gramm - 2 ta mahsulot
('kapsula-52-prozraya', 'Kapsula 52 gr прозрая', 'SMALL', 40, 20, 80, 200, 40, 1600, 1.50, 0.95, false, true, datetime('now'), datetime('now')),
('kapsula-52-oq', 'Kapsula 52 gr oq', 'SMALL', 40, 20, 80, 200, 40, 1600, 1.48, 0.93, false, true, datetime('now'), datetime('now')),

-- 70 gramm - 4 ta mahsulot
('kapsula-70-prozraya', 'Kapsula 70 gr прозрая', 'LARGE', 30, 15, 60, 150, 30, 900, 2.00, 1.25, false, true, datetime('now'), datetime('now')),
('kapsula-70-gidro', 'Kapsula 70 gr гидро', 'LARGE', 30, 15, 60, 150, 30, 900, 2.10, 1.35, false, true, datetime('now'), datetime('now')),
('kapsula-70-siniy', 'Kapsula 70 gr синий', 'LARGE', 30, 15, 60, 150, 30, 900, 2.05, 1.30, false, true, datetime('now'), datetime('now')),
('kapsula-70-qizil', 'Kapsula 70 gr қизил', 'LARGE', 30, 15, 60, 150, 30, 900, 2.02, 1.27, false, true, datetime('now'), datetime('now')),

-- 75 gramm - 6 ta mahsulot
('kapsula-75-prozraya', 'Kapsula 75 gr прозрая', 'LARGE', 25, 12, 50, 125, 25, 750, 2.20, 1.40, false, true, datetime('now'), datetime('now')),
('kapsula-75-sayxun', 'Kapsula 75 gr сайхун', 'LARGE', 25, 12, 50, 125, 25, 750, 2.25, 1.45, false, true, datetime('now'), datetime('now')),
('kapsula-75-gidro', 'Kapsula 75 gr гидро', 'LARGE', 25, 12, 50, 125, 25, 750, 2.30, 1.50, false, true, datetime('now'), datetime('now')),
('kapsula-75-prozra', 'Kapsula 75 gr прозра', 'LARGE', 25, 12, 50, 125, 25, 750, 2.18, 1.38, false, true, datetime('now'), datetime('now')),
('kapsula-75-siniy1', 'Kapsula 75 gr синий', 'LARGE', 25, 12, 50, 125, 25, 750, 2.22, 1.42, false, true, datetime('now'), datetime('now')),
('kapsula-75-siniy2', 'Kapsula 75 gr синий', 'LARGE', 25, 12, 50, 125, 25, 750, 2.22, 1.42, false, true, datetime('now'), datetime('now')),

-- 80 gramm - 8 ta mahsulot
('kapsula-80-prozraya', 'Kapsula 80 gr прозрая', 'LARGE', 20, 10, 40, 100, 20, 400, 2.50, 1.60, false, true, datetime('now'), datetime('now')),
('kapsula-80-prozrach', 'Kapsula 80 gr прозрач', 'LARGE', 20, 10, 40, 100, 20, 400, 2.48, 1.58, false, true, datetime('now'), datetime('now')),
('kapsula-80-gidro1', 'Kapsula 80 gr гидро', 'LARGE', 20, 10, 40, 100, 20, 400, 2.55, 1.65, false, true, datetime('now'), datetime('now')),
('kapsula-80-gidro2', 'Kapsula 80 gr гидро', 'LARGE', 20, 10, 40, 100, 20, 400, 2.55, 1.65, false, true, datetime('now'), datetime('now')),
('kapsula-80-sayxun1', 'Kapsula 80 gr сайхун', 'LARGE', 20, 10, 40, 100, 20, 400, 2.60, 1.70, false, true, datetime('now'), datetime('now')),
('kapsula-80-sayxun2', 'Kapsula 80 gr сайхун', 'LARGE', 20, 10, 40, 100, 20, 400, 2.60, 1.70, false, true, datetime('now'), datetime('now')),
('kapsula-80-siniy1', 'Kapsula 80 gr синий', 'LARGE', 20, 10, 40, 100, 20, 400, 2.52, 1.62, false, true, datetime('now'), datetime('now')),
('kapsula-80-siniy2', 'Kapsula 80 gr синий', 'LARGE', 20, 10, 40, 100, 20, 400, 2.52, 1.62, false, true, datetime('now'), datetime('now')),

-- 85 gramm - 2 ta mahsulot
('kapsula-85-prozraya1', 'Kapsula 85 gr прозрая', 'LARGE', 18, 9, 36, 90, 18, 324, 2.80, 1.80, false, true, datetime('now'), datetime('now')),
('kapsula-85-prozraya2', 'Kapsula 85 gr прозрая', 'LARGE', 18, 9, 36, 90, 18, 324, 2.80, 1.80, false, true, datetime('now'), datetime('now')),

-- 86 gramm - 2 ta mahsulot
('kapsula-86-prozraya1', 'Kapsula 86 gr прозрая', 'LARGE', 18, 9, 36, 90, 18, 324, 2.85, 1.85, false, true, datetime('now'), datetime('now')),
('kapsula-86-prozraya2', 'Kapsula 86 gr прозрая', 'LARGE', 18, 9, 36, 90, 18, 324, 2.85, 1.85, false, true, datetime('now'), datetime('now')),

-- 135 gramm - 8 ta mahsulot
('kapsula-135-prozraya1', 'Kapsula 135 gr прозрая', 'LARGE', 10, 5, 20, 50, 10, 100, 4.50, 2.90, false, true, datetime('now'), datetime('now')),
('kapsula-135-prozraya2', 'Kapsula 135 gr прозрая', 'LARGE', 10, 5, 20, 50, 10, 100, 4.50, 2.90, false, true, datetime('now'), datetime('now')),
('kapsula-135-gidro1', 'Kapsula 135 gr гидро', 'LARGE', 10, 5, 20, 50, 10, 100, 4.60, 3.00, false, true, datetime('now'), datetime('now')),
('kapsula-135-gidro2', 'Kapsula 135 gr гидро', 'LARGE', 10, 5, 20, 50, 10, 100, 4.60, 3.00, false, true, datetime('now'), datetime('now')),
('kapsula-135-sayxun1', 'Kapsula 135 gr сайхун', 'LARGE', 10, 5, 20, 50, 10, 100, 4.70, 3.10, false, true, datetime('now'), datetime('now')),
('kapsula-135-sayxun2', 'Kapsula 135 gr сайхун+', 'LARGE', 10, 5, 20, 50, 10, 100, 4.75, 3.15, false, true, datetime('now'), datetime('now')),
('kapsula-135-siniy1', 'Kapsula 135 gr синий', 'LARGE', 10, 5, 20, 50, 10, 100, 4.55, 2.95, false, true, datetime('now'), datetime('now')),
('kapsula-135-siniy2', 'Kapsula 135 gr синий', 'LARGE', 10, 5, 20, 50, 10, 100, 4.55, 2.95, false, true, datetime('now'), datetime('now')),

-- 250 gramm - 2 ta mahsulot
('kapsula-250-nestle', 'Kapsula 250 gr nestlle', 'LARGE', 5, 2, 10, 25, 5, 25, 8.00, 5.20, false, true, datetime('now'), datetime('now')),
('kapsula-250-qiyaq', 'Kapsula 250 gr qiyiq', 'LARGE', 5, 2, 10, 25, 5, 25, 7.80, 5.00, false, true, datetime('now'), datetime('now'));
