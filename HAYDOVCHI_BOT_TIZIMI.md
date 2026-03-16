# 🚗 HAYDOVCHI BOT TIZIMI - TO'LIQ HUJJAT

## 📋 UMUMIY MA'LUMOT

Haydovchi bot tizimi - bu har bir haydovchi uchun alohida Telegram bot instance yaratib, buyurtmalarni avtomatik taqsimlash, real-time kuzatuv va admin bilan muloqot imkoniyatini beruvchi tizim.

## 🎯 ASOSIY XUSUSIYATLAR

### 👤 Har bir haydovchi uchun:
- ✅ Alohida Telegram bot instance
- ✅ Unique bot token
- ✅ Shaxsiy chat ID
- ✅ Real-time buyurtma qabul qilish/rad etish
- ✅ GPS joylashuv yuborish
- ✅ Admin bilan to'g'ridan-to'g'ri chat
- ✅ Statistika va hisobotlar

### 🔄 Avtomatik workflow:
1. **Mijoz buyurtma beradi** → Customer Bot
2. **Ombor tekshiriladi** → Inventory Check
3. **Haydovchi tayinlanadi** → Auto Assignment
4. **Haydovchi xabar oladi** → Driver Bot
5. **Qabul/Rad javobi** → Accept/Reject
6. **Yetkazib berish** → Delivery Process
7. **Tugallash** → Completion

## 🏗️ TIZIM ARXITEKTURASI

### 📁 Fayl tuzilishi:
```
server/
├── bot/
│   ├── driver-bot.ts          # Haydovchi bot manager
│   ├── customer-bot.ts        # Mijoz bot
│   ├── admin-bot.ts           # Admin bot
│   └── bot-manager.ts         # Bot manager
├── routes/
│   ├── drivers.ts             # Haydovchi API
│   ├── orders.ts              # Buyurtma API
│   └── bot-api.ts             # Bot API
├── services/
│   └── order-workflow.ts      # Buyurtma workflow
└── utils/
    └── telegram.ts            # Telegram utilities

src/
└── pages/
    └── Drivers.tsx            # Haydovchi boshqaruv sahifasi

prisma/
└── schema.prisma              # Database schema
```

### 🗄️ Database modellari:
- **Driver** - Haydovchi ma'lumotlari
- **DeliveryAssignment** - Buyurtma tayinlash
- **DriverChat** - Admin-haydovchi chat
- **DriverLocation** - GPS joylashuv

## 🚀 O'RNATISH VA SOZLASH

### 1. Environment Variables
```env
# Haydovchi bot tokenlari
DRIVER_BOT_TOKEN_1=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
DRIVER_BOT_TOKEN_2=0987654321:ZYXwvuTSRqponMLKjihgfedcba

# Admin chat ID'lari
TELEGRAM_ADMIN_CHAT_ID=123456789,987654321
```

### 2. Database Migration
```bash
npx prisma db push
npx prisma generate
```

### 3. Server ishga tushirish
```bash
npm run dev
```

## 📱 HAYDOVCHI BOT KOMANDALAR

### 🎮 Asosiy komandalar:
- `/start` - Botni ishga tushirish
- `/orders` - Buyurtmalarni ko'rish
- `/location` - Joylashuv yuborish
- `/chat` - Admin bilan chat
- `/stats` - Statistika
- `/help` - Yordam

### 🎯 Tugmalar:
- **📋 Buyurtmalar** - Joriy buyurtmalar
- **📍 Joylashuv** - GPS yuborish
- **💬 Admin chat** - Admin bilan muloqot
- **📊 Statistika** - Hisobotlar
- **🟢 Online** - Online holat
- **🔴 Offline** - Offline holat

### ⚡ Inline tugmalar:
- **✅ Qabul qilish** - Buyurtmani qabul qilish
- **❌ Rad etish** - Buyurtmani rad etish
- **🚚 Boshlash** - Yetkazib berishni boshlash
- **✅ Tugallash** - Yetkazib berishni tugallash

## 🌐 WEB INTERFACE

### 👨‍💼 Admin panel (`/drivers`):
- ✅ Haydovchilar ro'yxati
- ✅ Yangi haydovchi qo'shish
- ✅ Buyurtma tayinlash
- ✅ Real-time chat
- ✅ Holat boshqaruvi
- ✅ Statistika ko'rish

### 📊 Haydovchi kartasi:
```
┌─────────────────────────────┐
│ 👤 Haydovchi Ismi           │
│ 🟢 Mavjud                   │
│                             │
│ 📞 +998901234567           │
│ 🚗 01A123BC                │
│ 📄 AB1234567               │
│ ⭐ 4.8/5.0                 │
│ 🚚 25 yetkazish            │
│ 📱 @username               │
│ 📍 Toshkent, Chilonzor     │
│                             │
│ [Buyurtma berish] [Chat]    │
│ [Online qilish]             │
└─────────────────────────────┘
```

## 🔄 BUYURTMA WORKFLOW

### 1️⃣ Mijoz buyurtma beradi:
```javascript
// Customer Bot
const orderData = {
  customerId: "customer-id",
  items: [{
    productId: "product-id",
    quantity: 5,
    pricePerBag: 25000
  }],
  telegramChatId: "123456789"
};

await OrderWorkflow.processCustomerOrder(orderData);
```

### 2️⃣ Ombor tekshiriladi:
```javascript
// Inventory Check
const stockCheck = await OrderWorkflow.checkStockAvailability(
  productId, 
  quantity
);

if (stockCheck.available) {
  // Yetkazib berishga tayyor
  await createDeliveryOrder(orderId, items);
} else {
  // Ishlab chiqarishga yuborish
  await createProductionOrder(orderId, items);
}
```

### 3️⃣ Haydovchi tayinlanadi:
```javascript
// Auto Assignment
const availableDrivers = await prisma.driver.findMany({
  where: { 
    status: 'AVAILABLE',
    active: true 
  },
  orderBy: { totalDeliveries: 'asc' }
});

const selectedDriver = availableDrivers[0];
await DriverBotManager.assignOrderToDriver(orderId, driverId, 'system');
```

### 4️⃣ Haydovchi xabar oladi:
```
🚚 YANGI BUYURTMA

📋 Buyurtma: #ORD-1234567890
👤 Mijoz: Ahmadjon Karimov
📍 Manzil: Toshkent, Chilonzor
📞 Telefon: +998901234567
💰 Summa: 125,000 so'm

Buyurtmani qabul qilasizmi?

[✅ Qabul qilish] [❌ Rad etish]
```

### 5️⃣ Mijoz haydovchi ma'lumotlarini oladi:
```
🚚 HAYDOVCHI TAYINLANDI

📋 Buyurtma: #ORD-1234567890
👤 Haydovchi: Bobur Toshmatov
📞 Telefon: +998907654321
📱 Telegram: @bobur_driver

📍 Yetkazib berish manzili: Toshkent, Chilonzor
⏰ Taxminiy vaqt: 60 daqiqa

🚛 Haydovchi tez orada siz bilan bog'lanadi.

[📞 Haydovchi bilan bog'lanish]
[📍 Buyurtma holatini kuzatish]
```

## 🛠️ API ENDPOINTS

### 🚗 Haydovchilar:
```
GET    /api/drivers                    # Barcha haydovchilar
POST   /api/drivers                    # Yangi haydovchi
PUT    /api/drivers/:id                # Haydovchi yangilash
DELETE /api/drivers/:id                # Haydovchi o'chirish
PUT    /api/drivers/:id/status         # Holat yangilash
POST   /api/drivers/:id/assign-order   # Buyurtma tayinlash
GET    /api/drivers/:id/assignments    # Haydovchi buyurtmalari
GET    /api/drivers/:id/stats          # Statistika
GET    /api/drivers/:id/chat           # Chat tarixi
POST   /api/drivers/:id/chat           # Xabar yuborish
POST   /api/drivers/:id/start-bot      # Bot ishga tushirish
POST   /api/drivers/:id/stop-bot       # Bot to'xtatish
```

### 📋 Buyurtmalar:
```
GET    /api/orders                     # Barcha buyurtmalar
POST   /api/orders                     # Yangi buyurtma
PUT    /api/orders/:id                 # Buyurtma yangilash
GET    /api/orders/:id/status          # Buyurtma holati
```

### 🤖 Bot API:
```
GET    /api/bot-api/status             # Bot holati
GET    /api/bot-api/bots               # Barcha botlar
POST   /api/bot-api/send-message       # Xabar yuborish
```

## 📊 STATISTIKA VA HISOBOTLAR

### 👤 Haydovchi statistikasi:
- **Jami buyurtmalar** - Barcha tayinlangan buyurtmalar
- **Tugallangan** - Muvaffaqiyatli yetkazilgan
- **Bugungi** - Bugun tugallangan
- **Oylik** - Bu oy tugallangan
- **Tugallash foizi** - Muvaffaqiyat darajasi
- **O'rtacha vaqt** - Yetkazib berish vaqti

### 📈 Tizim statistikasi:
- **Faol haydovchilar** - Online haydovchilar soni
- **Kutilayotgan buyurtmalar** - PENDING holatidagi
- **Jarayondagi** - IN_PROGRESS holatidagi
- **Tugallangan** - COMPLETED holatidagi

## 🔧 TEXNIK TAFSILOTLAR

### 🏗️ Arxitektura:
- **Node.js + Express** - Backend server
- **React + TypeScript** - Frontend
- **Prisma + SQLite** - Database
- **node-telegram-bot-api** - Telegram bot
- **Socket.io** - Real-time updates

### 🔒 Xavfsizlik:
- **JWT Authentication** - API himoyasi
- **Role-based Access** - Rol asosida ruxsat
- **Input Validation** - Ma'lumot tekshiruvi
- **Rate Limiting** - So'rovlar cheklash

### 📱 Telegram Bot Features:
- **Polling Mode** - Real-time xabarlar
- **Inline Keyboards** - Interaktiv tugmalar
- **Location Sharing** - GPS joylashuv
- **File Upload** - Rasm yuklash
- **Callback Queries** - Tugma bosilishi

## 🧪 TESTING

### Test fayllar:
- `test-driver-workflow.js` - To'liq workflow testi
- `test-bot-integration.js` - Bot integratsiya testi
- `test-api-endpoints.js` - API endpoint testi

### Test ishga tushirish:
```bash
# To'liq test
node test-driver-workflow.js

# API test
node test-api-endpoints.js

# Bot test
node test-bot-integration.js
```

## 🚨 MUAMMOLAR VA YECHIMLAR

### ❓ Tez-tez so'raladigan savollar:

**Q: Bot javob bermayapti?**
A: Bot tokenini tekshiring va internetni tekshiring.

**Q: Haydovchi xabar olmayapti?**
A: Haydovchi botni ishga tushirganini va chat ID to'g'ri ekanini tekshiring.

**Q: Buyurtma tayinlanmayapti?**
A: Faol haydovchilar borligini va ularning holati AVAILABLE ekanini tekshiring.

**Q: Database xatoligi?**
A: Prisma schemani yangilang: `npx prisma db push`

### 🔧 Debugging:
```bash
# Server loglarini ko'rish
npm run dev

# Database holatini tekshirish
npx prisma studio

# Bot holatini tekshirish
curl http://localhost:3001/api/bot-api/status
```

## 📞 YORDAM VA QO'LLAB-QUVVATLASH

### 🆘 Texnik yordam:
- **Email**: support@company.com
- **Telegram**: @tech_support
- **Telefon**: +998 XX XXX XX XX

### 📚 Qo'shimcha resurslar:
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides)

---

## 🎉 XULOSA

Haydovchi bot tizimi to'liq avtomatlashtirilgan, real-time kuzatuv va boshqaruv imkoniyatlarini beruvchi zamonaviy yechim. Tizim mijozdan buyurtma olishdan tortib, yetkazib berish tugagunga qadar barcha jarayonlarni avtomatik boshqaradi.

**Asosiy afzalliklar:**
- ✅ To'liq avtomatlashtirish
- ✅ Real-time kuzatuv
- ✅ Oson boshqaruv
- ✅ Moslashuvchan arxitektura
- ✅ Kengaytirilishi mumkin

**Keyingi bosqichlar:**
- 🔄 AI-powered route optimization
- 📊 Advanced analytics
- 🌍 Multi-language support
- 📱 Mobile app integration
- 🔔 Push notifications

---

*Hujjat oxirgi yangilangan: 2026-03-05*
*Versiya: 1.0.0*