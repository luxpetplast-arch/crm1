-- Avval bazani tekshiramiz
SELECT 'ProductType jami:', COUNT(*) FROM ProductType WHERE name = 'Kapsula';
SELECT 'ProductCategory kapsula jami:', COUNT(*) FROM ProductCategory WHERE name LIKE '%gramm%';
SELECT 'ProductSize kapsula jami:', COUNT(*) FROM ProductSize WHERE name LIKE '%gr';
SELECT 'Product kapsula jami:', COUNT(*) FROM Product WHERE name LIKE 'Kapsula%';

-- Mavjud bo'lsa o'chirish
DELETE FROM Product WHERE name LIKE 'Kapsula%';
DELETE FROM ProductSize WHERE name LIKE '%gr';
DELETE FROM ProductCategory WHERE name LIKE '%gramm%';
DELETE FROM ProductType WHERE name = 'Kapsula';

-- Tekshirish - qolganlarni ko'rish
SELECT 'ProductType qoldi:', COUNT(*) FROM ProductType;
SELECT 'ProductCategory qoldi:', COUNT(*) FROM ProductCategory;
SELECT 'ProductSize qoldi:', COUNT(*) FROM ProductSize;
SELECT 'Product qoldi:', COUNT(*) FROM Product;
