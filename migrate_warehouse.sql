UPDATE Product SET warehouse = 'krishka' WHERE name LIKE '%krishka%' OR name LIKE '%cap%';
UPDATE Product SET warehouse = 'ruchka' WHERE name LIKE '%ruchka%' OR name LIKE '%handle%';
UPDATE Product SET warehouse = 'preform' WHERE (name LIKE '%g%' OR name LIKE '%gr%') AND warehouse = 'preform';