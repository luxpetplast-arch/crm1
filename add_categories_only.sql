-- Kapsula kategoriyalarini qo'shish

-- ProductCategory (Mahsulot kategoriyalari)
INSERT INTO ProductCategory (id, name, description, icon, color, active, productTypeId, createdAt, updatedAt) VALUES
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

-- ProductSize (Mahsulot o'lchamlari)
INSERT INTO ProductSize (id, name, description, unit, value, active, categoryId, createdAt, updatedAt) VALUES
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
