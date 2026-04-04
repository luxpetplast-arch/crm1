-- Ma'lumotlar bazasidagi barcha ma'lumotlarni o'chirish skripti
-- Ehtiyot bo'ling: bu skript barcha ma'lumotlarni o'chirib yuboradi!

-- Foreign key cheklovlarini vaqtincha o'chirish
PRAGMA foreign_keys = OFF;

-- Barcha jadvallarni tozalash (to'g'ri tartibda)
-- Avval kichik jadvallar, keyin katta jadvallar

-- Audit log va tarix jadvallari
DELETE FROM AuditLog;
DELETE FROM DeliveryStatusHistory;
DELETE FROM DriverLocation;
DELETE FROM Maintenance;
DELETE FROM Notification;
DELETE FROM StockAlert;
DELETE FROM CustomerChat;
DELETE FROM DriverChat;
DELETE FROM Task;
DELETE FROM Expense;
DELETE FROM VehicleExpense;

-- Sotuv va buyurtma jadvallari
DELETE FROM SaleItem;
DELETE FROM Sale;
DELETE FROM OrderItem;
DELETE FROM "Order";
DELETE FROM DeliveryAssignment;
DELETE FROM DeliveryNew;
DELETE FROM Delivery;

-- Moliya jadvallari
DELETE FROM Payment;
DELETE FROM CashboxTransaction;
DELETE FROM CashierShift;
DELETE FROM Invoice;
DELETE FROM PurchaseOrderItem;
DELETE FROM PurchaseOrder;

-- Mahsulotlar va zahiralar
DELETE FROM StockMovement;
DELETE FROM VariantStockMovement;
DELETE FROM ProductVariant;
DELETE FROM VariantPriceHistory;
DELETE FROM Product;
DELETE FROM ProductSize;
DELETE FROM ProductCategory;
DELETE FROM ProductType;

-- Ishlab chiqarish
DELETE FROM ProductionUsage;
DELETE FROM ProductionTask;
DELETE FROM ProductionPlan;
DELETE FROM ProductionOrder;
DELETE FROM QualityCheck;
DELETE FROM Batch;
DELETE FROM RawMaterial;

-- Mijozlar va yetkazib berish
DELETE FROM Customer;
DELETE FROM Driver;
DELETE FROM DriverNew;
DELETE FROM Vehicle;
DELETE FROM Supplier;
DELETE FROM Contract;

-- Tizim sozlamalari
DELETE FROM LoyaltyTransaction;
DELETE FROM LoyaltyProgram;
DELETE FROM Promotion;
DELETE FROM PriceLevel;
DELETE FROM CardProduct;
DELETE FROM Card;
DELETE FROM User;
DELETE FROM SalesForecast;
DELETE FROM SystemSettings;

-- Foreign key cheklovlarini qayta yoqish
PRAGMA foreign_keys = ON;

-- O'chirilgan ma'lumotlar sonini ko'rish
SELECT 'Barcha ma lumotlar muvaffaqiyatli ochirildi' AS message;
