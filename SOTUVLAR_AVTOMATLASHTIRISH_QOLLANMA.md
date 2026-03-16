# 🤖 SOTUVLAR AVTOMATLASHTIRISH TIZIMI - TO'LIQ QO'LLANMA

## 🎯 MAQSAD

Sotuv yaratilganda barcha jarayonlar avtomatik bo'ladi:
- ✅ Ombor avtomatik kamayadi
- ✅ Kassa avtomatik yangilanadi
- ✅ Mijozga Telegram xabari boradi
- ✅ Invoice avtomatik yaratiladi
- ✅ Qarz tracking
- ✅ Low stock ogohlantirish
- ✅ Audit logging

---

## 🚀 QANDAY ISHLAYDI

### SOTUV YARATILGANDA (11 BOSQICH):

```
1. VALIDATSIYA
   ├─ Mahsulot mavjudmi?
   └─ Stock yetarlimi?

2. SOTUV YARATISH
   └─ Sale record database'ga

3. OMBOR KAMAYTIRISH ⚡
   ├─ Product.currentStock - quantity
   └─ Product.currentUnits - (quantity * unitsPerBag)

4. STOCK MOVEMENT YARATISH ⚡
   ├─ Type: 'SALE'
   ├─ Previous/New stock
   └─ User, reason, notes

5. KASSA TRANZAKSIYASI ⚡
   ├─ Type: 'INCOME'
   ├─ Category: 'SALE'
   └─ Amount: paidAmount

6. INVOICE YARATISH ⚡
   ├─ Unique invoice number
   └─ Invoice record

7. MIJOZGA TELEGRAM XABARI ⚡
   ├─ Sotuv tafsilotlari
   ├─ To'lov ma'lumotlari
   └─ Qarz (agar bor bo'lsa)

8. LOW STOCK TEKSHIRISH ⚡
   ├─ currentStock <= minStockLimit?
   └─ Admin'ga ogohlantirish

9. MIJOZ QARZ YANGILASH ⚡
   ├─ Customer.debt += (total - paid)
   └─ Customer.lastPurchase = now

10. AUDIT LOG ⚡
    ├─ Action: CREATE_SALE
    └─ Barcha tafsilotlar

11. JAVOB QAYTARISH
    └─ Sale + automation status
```

---

## 📁 YARATILGAN FAYLLAR

### 1. `server/utils/telegram-notifications.ts`
**Funksiyalar:**
- `notifyCustomerSale(saleId)` - Mijozga sotuv haqida xabar
- `sendDailyReport()` - Kunlik hisobot (admin'ga)
- `notifyLowStock(productId)` - Low stock ogohlantirish
- `sendDebtReminder(customerId)` - Qarz eslatmasi

### 2. `server/utils/invoice-generator.ts`
**Funksiyalar:**
- `createInvoiceForSale(saleId)` - Invoice yaratish
- `generateInvoiceText(invoice)` - Invoice matni (Telegram uchun)
- `generateInvoiceNumber()` - Unique invoice raqami

### 3. `server/routes/sales.ts` (Yangilangan)
**Yangi funksiyalar:**
- Stock validation
- Automatic stock deduction
- StockMovement creation
- CashboxTransaction creation
- Invoice generation
- Telegram notifications
- Low stock alerts
- Debt tracking
- Audit logging

### 4. `test-sales-automation.js`
**Test funksiyalar:**
- `testCompleteSalesAutomation()` - To'liq test
- `testLowStockAlert()` - Low stock test
- `runAllTests()` - Barcha testlar

---

## 💬 TELEGRAM XABARLARI

### Mijozga Sotuv Xabari:
```
🛒 YANGI SOTUV

👤 Mijoz: Ahmadjon Karimov
📅 Sana: 05.03.2026, 14:30

📦 Mahsulotlar:
1. Kichik qop - 5 qop x 25 = 125 USD

💰 Jami: 125 USD

💵 Naqd: 500,000 so'm
💳 Karta: 50 USD
📱 CLICK: 125,000 so'm

⚠️ Holat: Qisman to'langan
⚠️ Qarz: 25.00 USD

📞 Qarzni to'lash uchun biz bilan bog'laning.
```

### Admin'ga Low Stock Xabari:
```
🚨 JUDA MUHIM

📦 OMBOR KAMAYDI

🏷️ Mahsulot: Kichik qop
📊 Joriy zaxira: 15 qop
⚠️ Minimal limit: 20 qop
✅ Optimal: 50 qop
📈 Foiz: 30.0%

🚨 Shoshilinch buyurtma bering!
```

### Admin'ga Kunlik Hisobot:
```
📊 KUNLIK HISOBOT
📅 Juma, 5 mart 2026

💰 SOTUVLAR:
📦 Jami sotuvlar: 25 ta
💵 Jami summa: 3,125.00 USD
✅ To'langan: 2,800.00 USD
⚠️ Qarz: 325.00 USD

📈 HOLAT:
✅ To'liq to'langan: 20 ta
⚠️ Qisman: 3 ta
❌ To'lanmagan: 2 ta

👥 TOP MIJOZLAR:
1. Ahmadjon - 500 USD (5 ta)
2. Dilshod - 350 USD (3 ta)
...
```

---

## 🧪 TEST QILISH

### 1. Test dasturini ishga tushirish:
```bash
node test-sales-automation.js
```

### 2. Qo'lda test qilish:

#### A. Sotuv yaratish:
```bash
curl -X POST http://localhost:3001/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-id",
    "productId": "product-id",
    "quantity": 5,
    "pricePerBag": 25,
    "totalAmount": 125,
    "paidAmount": 100,
    "paymentStatus": "PARTIAL"
  }'
```

#### B. Natijani tekshirish:
```json
{
  "id": "sale-id",
  "totalAmount": 125,
  "paidAmount": 100,
  "stockUpdated": true,
  "cashboxUpdated": true,
  "invoiceCreated": true,
  "notificationSent": true,
  "lowStockAlert": false
}
```

### 3. Database tekshirish:
```bash
npx prisma studio
```

Tekshirish kerak:
- ✅ Sale yaratildi
- ✅ Product.currentStock kamayd
- ✅ StockMovement yaratildi
- ✅ CashboxTransaction yaratildi
- ✅ Invoice yaratildi
- ✅ Customer.debt yangilandi
- ✅ AuditLog yaratildi

---

## 📊 API RESPONSE

### Muvaffaqiyatli sotuv:
```json
{
  "id": "sale-123",
  "customerId": "customer-456",
  "productId": "product-789",
  "quantity": 5,
  "pricePerBag": 25,
  "totalAmount": 125,
  "paidAmount": 100,
  "paymentStatus": "PARTIAL",
  "customer": { ... },
  "product": { ... },
  "stockUpdated": true,
  "cashboxUpdated": true,
  "invoiceCreated": true,
  "notificationSent": true,
  "lowStockAlert": false
}
```

### Xatolik (stock yetarli emas):
```json
{
  "error": "Omborda yetarli mahsulot yo'q",
  "available": 3,
  "requested": 5
}
```

---

## ⚙️ SOZLAMALAR

### Environment Variables:
```env
# Telegram Bot Tokens
TELEGRAM_BOT_TOKEN=your-customer-bot-token
TELEGRAM_ADMIN_BOT_TOKEN=your-admin-bot-token

# Admin Chat IDs (vergul bilan ajratilgan)
TELEGRAM_ADMIN_CHAT_ID=123456789,987654321

# Database
DATABASE_URL="file:./dev.db"
```

---

## 🔧 XUSUSIYATLAR

### ✅ Mavjud:
- Automatic stock deduction
- Automatic cashbox update
- Telegram notifications (customer & admin)
- Invoice generation
- Low stock alerts
- Debt tracking
- Audit logging
- Multi-currency support
- Partial payment support

### 🔄 Qo'shimcha (kelajakda):
- Scheduled reports (cron jobs)
- Debt reminders automation
- SMS notifications
- Email notifications
- Barcode scanning
- Receipt printing
- Multi-warehouse support

---

## 🚨 MUAMMOLAR VA YECHIMLAR

### ❓ Ombor kamaymayd?
**Tekshiring:**
1. Sale yaratilganmi? → Database'da Sale record
2. StockMovement yaratilganmi? → StockMovement table
3. Product.currentStock yangilanganmi? → Product table

### ❓ Mijozga xabar bormayapti?
**Tekshiring:**
1. Customer.telegramChatId to'g'rimi?
2. Bot token to'g'rimi?
3. Bot ishlab turibmi?
4. Console loglarni tekshiring

### ❓ Kassa yangilanmayd?
**Tekshiring:**
1. paidAmount > 0 mi?
2. CashboxTransaction yaratilganmi?
3. Cashbox API ishlayaptimi?

### ❓ Invoice yaratilmayd?
**Tekshiring:**
1. Invoice table mavjudmi?
2. Invoice generator ishlayaptimi?
3. Console loglarni tekshiring

---

## 📞 YORDAM

### Loglarni ko'rish:
```bash
# Server logs
npm run dev

# Database
npx prisma studio

# Test
node test-sales-automation.js
```

### Debug mode:
```javascript
// server/routes/sales.ts da
console.log('Sale created:', sale);
console.log('Stock updated:', updatedProduct);
console.log('Cashbox transaction:', transaction);
```

---

## 🎉 XULOSA

Sotuvlar tizimi to'liq avtomatlashtirildi! Endi sotuv yaratilganda:

1. ✅ Ombor avtomatik kamayadi
2. ✅ Kassa avtomatik yangilanadi
3. ✅ Mijozga xabar boradi
4. ✅ Invoice yaratiladi
5. ✅ Qarz tracking
6. ✅ Low stock ogohlantirish
7. ✅ Audit logging

**Barcha jarayonlar avtomatik va real-time!** 🚀

---

*Oxirgi yangilangan: 2026-03-05*
*Versiya: 2.0.0*
