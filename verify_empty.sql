-- Check if tables are empty
SELECT 'Customer' as table_name, COUNT(*) as record_count FROM "Customer"
UNION ALL
SELECT 'Product' as table_name, COUNT(*) as record_count FROM "Product"
UNION ALL
SELECT 'Sale' as table_name, COUNT(*) as record_count FROM "Sale"
UNION ALL
SELECT 'User' as table_name, COUNT(*) as record_count FROM "User"
UNION ALL
SELECT 'Order' as table_name, COUNT(*) as record_count FROM "Order"
UNION ALL
SELECT 'Batch' as table_name, COUNT(*) as record_count FROM "Batch";
