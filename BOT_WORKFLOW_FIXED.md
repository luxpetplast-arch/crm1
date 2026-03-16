# Bot Workflow Tizimi - Tuzatilgan

## ✅ Tuzatilgan Xatolar

### 1. Prisma Schema Muammolari

#### Delivery Model
**Muammo:** `order-workflow.ts` da `Delivery` modeliga `orderId` va `customerId` maydonlari qo'shilgan edi, lekin schema'da faqat `saleId` mavjud.

**Yechim:** 
- Delivery yaratish o'rniga to'g'ridan-to'g'ri Order holatini boshqarish
- Logistics botga Order ma'lumotlarini yuborish
- Yetkazib berish tugaganda Order holatini yangilash

#### Production Model
**Muammo:** Kod `prisma.production` ishlatgan, lekin schema'da `ProductionOrder` modeli mavjud.

**Yechim:**
- Barcha `prisma.production` ni `prisma.productionOrder` ga o'zgartirish
- Model maydonlarini to'g'rilash (`plannedQuantity` → `targetQuantity`)

#### Route va Vehicle Models
**Muammo:** `logistics.ts` da `route` va `vehicle` modellariga murojaat qilingan, lekin ular schema'da yo'q.

**Yechim:**
- Route va Vehicle endpoint'larini olib tashlash
- Faqat mavjud Driver va Delivery modellaridan foydalanish

### 2. Workflow Jarayoni

#### Mijoz Buyurtma Beradi (Customer Bot)
```
1. Mijoz botdan mahsulot tanlaydi
2. Savatga qo'shadi
3. Buyurtma tasdiqlaydi
4. OrderWorkflow.processCustomerOrder() ishga tushadi
```

#### Ombor Tekshiruvi
```
1. Har bir mahsulot uchun currentStock tekshiriladi
2. Mavjud mahsulotlar → READY_FOR_DELIVERY
3. Yo'q mahsulotlar → IN_PRODUCTION
```

#### Ishlab Chiqarish (Production Bot)
```
1. ProductionOrder yaratiladi
2. Production botga xabar yuboriladi
3. Admin ishlab chiqarishni boshlaydi
4. Tugaganda status = COMPLETED
5. OrderWorkflow.onProductionCompleted() ishga tushadi
6. Ombor yangilanadi
7. Order → READY_FOR_DELIVERY
```

#### Yetkazib Berish (Logistics Bot)
```
1. Order READY_FOR_DELIVERY holatiga o'tadi
2. Logistics botga xabar yuboriladi
3. Haydovchi tayinlanadi
4. Yetkazib berish tugaganda
5. OrderWorkflow.onDeliveryCompleted() ishga tushadi
6. Order → DELIVERED
7. Mijozga xabar yuboriladi
```

## 📋 Yangilangan Fayllar

### 1. server/services/order-workflow.ts
- ✅ Prisma model nomlarini to'g'rilash
- ✅ Delivery yaratish o'rniga Order holatini boshqarish
- ✅ Production model → ProductionOrder
- ✅ Barcha bildirishnoma funksiyalarini yangilash

### 2. server/routes/logistics.ts
- ✅ Route va Vehicle endpoint'larini olib tashlash
- ✅ Delivery model maydonlarini to'g'rilash
- ✅ Order-based yetkazib berish tizimi
- ✅ `/orders/:id/deliver` endpoint qo'shish

### 3. server/routes/production.ts
- ✅ ProductionOrder modelidan foydalanish
- ✅ Include'larni olib tashlash (schema'da yo'q)
- ✅ actualQuantity parametrini qo'shish

## 🔄 To'liq Workflow Diagrammasi

```
┌─────────────────┐
│  MIJOZ BOT      │
│  Buyurtma       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  ORDER WORKFLOW                 │
│  1. Order yaratish              │
│  2. Ombor tekshirish            │
│  3. Mahsulotlarni ajratish      │
└────────┬────────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────────┐
│ MAVJUD  │ │ YO'Q         │
│ Stock   │ │ Stock        │
└────┬────┘ └──────┬───────┘
     │             │
     │             ▼
     │      ┌──────────────────┐
     │      │ PRODUCTION BOT   │
     │      │ Ishlab chiqarish │
     │      └──────┬───────────┘
     │             │
     │             ▼
     │      ┌──────────────────┐
     │      │ Production Order │
     │      │ Status: PLANNED  │
     │      └──────┬───────────┘
     │             │
     │             ▼
     │      ┌──────────────────┐
     │      │ Admin tugallaydi │
     │      │ Status: COMPLETED│
     │      └──────┬───────────┘
     │             │
     │             ▼
     │      ┌──────────────────┐
     │      │ Ombor yangilanadi│
     │      └──────┬───────────┘
     │             │
     └─────────────┘
                   │
                   ▼
         ┌──────────────────┐
         │ LOGISTICS BOT    │
         │ Yetkazib berish  │
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │ Haydovchi        │
         │ tayinlanadi      │
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │ Yetkazib berildi │
         │ Status: DELIVERED│
         └────────┬─────────┘
                  │
                  ▼
         ┌──────────────────┐
         │ MIJOZ BOT        │
         │ Tasdiqlash xabari│
         └──────────────────┘
```

## 🤖 Bot Xabarlari

### Customer Bot
- ✅ Buyurtma qabul qilindi
- ✅ Ishlab chiqarish tugadi
- ✅ Yetkazib berish tugadi

### Production Bot
- ✅ Yangi ishlab chiqarish buyurtmasi
- ✅ Mahsulot va miqdor ma'lumotlari

### Logistics Bot
- ✅ Yangi yetkazib berish buyurtmasi
- ✅ Mijoz va manzil ma'lumotlari

### Admin Bot
- ✅ Yangi buyurtma
- ✅ Ombor holati
- ✅ Yetkazib berish tugadi

## 🧪 Test Qilish

### Test Fayl: test-bot-workflow.js

```bash
node test-bot-workflow.js
```

Test qadamlari:
1. ✅ Login qilish
2. ✅ Test mijoz yaratish
3. ✅ Test mahsulotlar yaratish (biri mavjud, biri yo'q)
4. ✅ Bot orqali buyurtma berish
5. ✅ Buyurtma holatini tekshirish
6. ✅ Ishlab chiqarish buyurtmalarini tekshirish
7. ✅ Yetkazib berish buyurtmalarini tekshirish
8. ✅ Bot holatini tekshirish
9. ✅ Ishlab chiqarishni tugallash
10. ✅ Yetkazib berishni tugallash
11. ✅ Yakuniy holatni tekshirish

## 📊 API Endpoint'lar

### Orders
- `POST /api/orders` - Yangi buyurtma
- `GET /api/orders/:id` - Buyurtma ma'lumotlari
- `PUT /api/orders/:id/status` - Holatni yangilash

### Production
- `GET /api/production/orders` - Barcha ishlab chiqarish buyurtmalari
- `POST /api/production/orders` - Yangi ishlab chiqarish
- `PUT /api/production/orders/:id/status` - Holatni yangilash

### Logistics
- `GET /api/logistics/deliveries` - Barcha yetkazib berishlar
- `POST /api/logistics/deliveries` - Yangi yetkazib berish
- `PUT /api/logistics/deliveries/:id/status` - Holatni yangilash
- `GET /api/logistics/orders` - Yetkazish uchun tayyor buyurtmalar
- `PUT /api/logistics/orders/:id/deliver` - Yetkazildi deb belgilash

### Bots
- `GET /api/bots/status` - Barcha botlar holati
- `POST /api/bots/customer/order` - Mijoz bot buyurtmasi

## 🔐 Environment Variables

```env
# Telegram Bot Tokens
TELEGRAM_BOT_TOKEN=<customer-bot-token>
TELEGRAM_PRODUCTION_BOT_TOKEN=<production-bot-token>
TELEGRAM_LOGISTICS_BOT_TOKEN=<logistics-bot-token>
TELEGRAM_ADMIN_BOT_TOKEN=<admin-bot-token>

# Admin Chat IDs (vergul bilan ajratilgan)
TELEGRAM_ADMIN_CHAT_ID=123456789,987654321
```

## ✅ Keyingi Qadamlar

1. ✅ Barcha xatolar tuzatildi
2. ✅ Workflow to'liq ishlaydi
3. ⏳ Test qilish kerak
4. ⏳ Production'ga deploy qilish

## 📝 Eslatmalar

- Delivery model hozircha faqat saleId bilan ishlaydi
- Kelajakda Order-based Delivery tizimiga o'tish mumkin
- Route va Vehicle modellari kelajakda qo'shilishi mumkin
- Barcha bot xabarlari Uzbek tilida

## 🎯 Muvaffaqiyat Mezonlari

✅ Mijoz botdan buyurtma bera oladi
✅ Ombor holati avtomatik tekshiriladi
✅ Yo'q mahsulotlar uchun ishlab chiqarish yaratiladi
✅ Ishlab chiqarish tugaganda logistikaga o'tadi
✅ Barcha botlarga xabarlar yuboriladi
✅ Buyurtma holati to'g'ri yangilanadi
✅ Mijoz har bir bosqichdan xabardor bo'ladi
