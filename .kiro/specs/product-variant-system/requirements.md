# Requirements Document

## Introduction

Mahsulot Variant/Rang Tizimi - bir xil mahsulotning turli ranglarini (oq, qora, sariq, gidro) bitta cardda ko'rsatish va har bir rang uchun alohida miqdor va narxni boshqarish tizimi. Hozirgi tizimda har bir rang alohida card sifatida ko'rsatiladi (Preform 24gr Oq, Preform 24gr Qora, va hokazo). Yangi tizimda barcha ranglar bitta "Preform 24gr" card ichida ko'rsatiladi va har bir rang alohida miqdor va narxga ega bo'ladi.

## Glossary

- **Product_Variant_System**: Mahsulot variant/rang tizimi - bir xil mahsulotning turli ranglarini boshqarish tizimi
- **Parent_Product**: Asosiy mahsulot - ranglarni birlashtiruvchi mahsulot (masalan: "Preform 24gr")
- **Variant**: Variant - asosiy mahsulotning rangi (masalan: Oq, Qora, Sariq, Gidro)
- **Product_Card**: Mahsulot kartasi - mahsulotni ko'rsatuvchi UI komponenti
- **Variant_Selector**: Rang tanlagich - foydalanuvchi rang tanlashi uchun UI komponenti
- **Detail_Page**: Detail sahifa - mahsulot yoki variant haqida to'liq ma'lumot ko'rsatuvchi sahifa
- **Stock_Quantity**: Ombor miqdori - mahsulot yoki variant miqdori (qop hisobida)
- **Price_Per_Bag**: Qop narxi - bitta qop uchun narx
- **Total_Stock**: Jami miqdor - barcha variantlar miqdorining yig'indisi
- **Telegram_Bot**: Telegram bot - mijozlar uchun buyurtma berish tizimi
- **Sales_Order_System**: Sotuv/Buyurtma tizimi - mahsulot sotish va buyurtma berish tizimi
- **Database_Schema**: Ma'lumotlar bazasi sxemasi - Prisma + SQLite
- **Frontend**: Frontend - React + TypeScript
- **Backend**: Backend - Express.js + TypeScript

## Requirements

### Requirement 1: Parent-Child Product Relationship

**User Story:** Tizim administratori sifatida, men bir xil mahsulotning turli ranglarini bitta asosiy mahsulot ostida guruhlashni xohlayman, shunda tizimda tartib va tushunish oson bo'ladi.

#### Acceptance Criteria

1. THE Database_Schema SHALL support parent-child relationship between products
2. THE Parent_Product SHALL have a unique identifier and base name (masalan: "Preform 24gr")
3. THE Variant SHALL reference its Parent_Product through a foreign key relationship
4. THE Variant SHALL have its own Stock_Quantity and Price_Per_Bag
5. WHEN a Parent_Product is created, THE Product_Variant_System SHALL allow adding multiple Variants
6. THE Variant SHALL store color/variant name (masalan: "Oq", "Qora", "Sariq", "Gidro")

### Requirement 2: Product Card Display

**User Story:** Foydalanuvchi sifatida, men mahsulotlar ro'yxatida bitta cardda barcha ranglarni va ularning miqdorlarini ko'rishni xohlayman, shunda tezda ma'lumot olishim mumkin bo'ladi.

#### Acceptance Criteria

1. THE Product_Card SHALL display Parent_Product name at the top
2. THE Product_Card SHALL display all Variants in a horizontal layout
3. FOR EACH Variant, THE Product_Card SHALL display variant name and Stock_Quantity (masalan: "Oq 34 qop")
4. THE Product_Card SHALL calculate and display Total_Stock across all Variants (masalan: "Jami: 191 qop")
5. WHEN Stock_Quantity is zero for a Variant, THE Product_Card SHALL visually indicate out-of-stock status
6. THE Product_Card SHALL be responsive and display properly on mobile devices

### Requirement 3: Variant Selection and Detail View

**User Story:** Foydalanuvchi sifatida, men har bir rangga bosib, uning to'liq ma'lumotlarini ko'rishni xohlayman, shunda mahsulot haqida batafsil bilishim mumkin bo'ladi.

#### Acceptance Criteria

1. WHEN a user clicks on a Variant in Product_Card, THE Product_Variant_System SHALL navigate to Detail_Page
2. THE Detail_Page SHALL display Variant name, Stock_Quantity, Price_Per_Bag
3. THE Detail_Page SHALL display stock history (kirim/chiqim tarixlari)
4. THE Detail_Page SHALL display sales statistics for the Variant
5. THE Detail_Page SHALL provide edit functionality for Stock_Quantity and Price_Per_Bag
6. THE Detail_Page SHALL show Parent_Product information and links to other Variants

### Requirement 4: Sales and Order Variant Selection

**User Story:** Sotuvchi sifatida, men mahsulot sotishda yoki buyurtma berishda rangni tanlashni xohlayman, shunda to'g'ri mahsulot va narx bilan ishlashim mumkin bo'ladi.

#### Acceptance Criteria

1. WHEN a user selects a Parent_Product in Sales_Order_System, THE Variant_Selector SHALL display all available Variants
2. THE Variant_Selector SHALL show Stock_Quantity and Price_Per_Bag for each Variant
3. WHEN a Variant is selected, THE Sales_Order_System SHALL use the Variant's Price_Per_Bag for calculations
4. WHEN a Variant is selected, THE Sales_Order_System SHALL check Stock_Quantity before allowing sale
5. IF Stock_Quantity is insufficient, THEN THE Sales_Order_System SHALL display an error message
6. THE Sales_Order_System SHALL record which Variant was sold in the transaction history

### Requirement 5: Telegram Bot Variant Integration

**User Story:** Mijoz sifatida, men Telegram bot orqali buyurtma berishda rangni tanlashni xohlayman, shunda kerakli mahsulotni olishim mumkin bo'ladi.

#### Acceptance Criteria

1. WHEN a customer selects a Parent_Product in Telegram_Bot, THE Telegram_Bot SHALL display all available Variants with inline keyboard
2. THE Telegram_Bot SHALL show Stock_Quantity for each Variant (masalan: "Oq (34 qop mavjud)")
3. WHEN a customer selects a Variant, THE Telegram_Bot SHALL display Price_Per_Bag
4. THE Telegram_Bot SHALL allow customer to specify quantity and validate against Stock_Quantity
5. IF Stock_Quantity is insufficient, THEN THE Telegram_Bot SHALL notify customer and suggest available quantity
6. THE Telegram_Bot SHALL create order with correct Variant information

### Requirement 6: Stock Management by Variant

**User Story:** Ombor boshqaruvchisi sifatida, men har bir rang uchun alohida miqdorni boshqarishni xohlayman, shunda aniq inventarizatsiya olib borishim mumkin bo'ladi.

#### Acceptance Criteria

1. THE Product_Variant_System SHALL track Stock_Quantity separately for each Variant
2. WHEN stock is added, THE Product_Variant_System SHALL update specific Variant's Stock_Quantity
3. WHEN stock is removed (sale/order), THE Product_Variant_System SHALL decrease specific Variant's Stock_Quantity
4. THE Product_Variant_System SHALL maintain stock history for each Variant separately
5. THE Product_Variant_System SHALL calculate Total_Stock by summing all Variant Stock_Quantities
6. THE Product_Variant_System SHALL trigger low-stock alerts per Variant, not per Parent_Product

### Requirement 7: Price Management by Variant

**User Story:** Narx boshqaruvchisi sifatida, men har bir rang uchun alohida narx belgilashni xohlayman, shunda bozor talabiga moslashishim mumkin bo'ladi.

#### Acceptance Criteria

1. THE Product_Variant_System SHALL allow setting Price_Per_Bag independently for each Variant
2. WHEN Price_Per_Bag is updated for a Variant, THE Product_Variant_System SHALL not affect other Variants
3. THE Product_Variant_System SHALL maintain price history for each Variant
4. THE Product_Variant_System SHALL support bulk price updates for all Variants of a Parent_Product
5. THE Product_Variant_System SHALL validate that Price_Per_Bag is a positive number
6. THE Product_Variant_System SHALL display price differences between Variants in Product_Card

### Requirement 8: Migration from Current System

**User Story:** Tizim administratori sifatida, men hozirgi alohida mahsulotlarni yangi variant tizimiga o'tkazishni xohlayman, shunda ma'lumotlar yo'qolmaydi.

#### Acceptance Criteria

1. THE Product_Variant_System SHALL provide a migration script to convert existing products to Parent-Variant structure
2. THE migration script SHALL identify products with similar names (masalan: "Preform 24gr Oq", "Preform 24gr Qora")
3. THE migration script SHALL create Parent_Product and link existing products as Variants
4. THE migration script SHALL preserve all Stock_Quantity, Price_Per_Bag, and history data
5. THE migration script SHALL create a backup before migration
6. THE migration script SHALL provide a rollback mechanism if migration fails

### Requirement 9: Search and Filter by Variant

**User Story:** Foydalanuvchi sifatida, men mahsulotlarni rang bo'yicha qidirishni va filtrlashni xohlayman, shunda kerakli mahsulotni tezda topishim mumkin bo'ladi.

#### Acceptance Criteria

1. THE Product_Variant_System SHALL support searching by Parent_Product name
2. THE Product_Variant_System SHALL support searching by Variant name
3. THE Product_Variant_System SHALL support filtering products by available Variants
4. WHEN searching, THE Product_Variant_System SHALL highlight matching Variants in Product_Card
5. THE Product_Variant_System SHALL support filtering by Stock_Quantity range per Variant
6. THE Product_Variant_System SHALL support filtering by Price_Per_Bag range per Variant

### Requirement 10: Reporting and Analytics by Variant

**User Story:** Biznes tahlilchi sifatida, men har bir rang bo'yicha sotuv va ombor hisobotlarini ko'rishni xohlayman, shunda qaysi ranglar ko'proq sotilishini bilishim mumkin bo'ladi.

#### Acceptance Criteria

1. THE Product_Variant_System SHALL generate sales reports grouped by Variant
2. THE Product_Variant_System SHALL show which Variants are most popular
3. THE Product_Variant_System SHALL calculate revenue per Variant
4. THE Product_Variant_System SHALL show stock turnover rate per Variant
5. THE Product_Variant_System SHALL compare performance between Variants of same Parent_Product
6. THE Product_Variant_System SHALL export reports in CSV format with Variant details

