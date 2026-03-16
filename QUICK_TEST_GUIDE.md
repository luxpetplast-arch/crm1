# Tezkor Test Qo'llanma

## 🚀 Serverni Ishga Tushirish

```bash
# 1. Dependencies o'rnatish
npm install

# 2. Database migratsiya
npx prisma migrate dev

# 3. Serverni ishga tushirish
npm run dev
```

## 🤖 Botlarni Sozlash

### .env faylini yaratish

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# JWT
JWT_SECRET="your-secret-key-here"

# Telegram Bot Tokens
TELEGRAM_BOT_TOKEN=8730452763:AAF0dLAfLrQvLSswh6mJjLnQlBmKZNNLiuQ
TELEGRAM_PRODUCTION_BOT_TOKEN=8730452763:AAF0dLAfLrQvLSswh6mJjLnQlBmKZNNLiuQ
TELEGRAM_LOGISTICS_BOT_TOKEN=8605772709:AAEGg397kdgJOv_fmvleOfjBFvFYwleoEOU
TELEGRAM_ADMIN_BOT_TOKEN=8781061607:AAGB6rK_mOV-AtjLoIQdFu7gAn-nCjYj1i4

# Admin Chat IDs (vergul bilan ajratilgan)
TELEGRAM_ADMIN_CHAT_ID=123456789,987654321

# Server
PORT=5000
NODE_ENV=development
```

## 📱 Botlarni Test Qilish

### 1. Customer Bot (Mijozlar uchun)

Telegram'da botni toping va `/start` yuboring:

```
/start - Botni boshlash
/profile - Profil ma'lumotlari
/balance - Balans va qarzlar
/orders - Buyurtma berish
/history - Sotuvlar tarixi
/catalog - Mahsulotlar katalogi
/help - Yordam
```

**Yoki tugmalardan foydalaning:**
- 🛒 Buyurtma berish
- 💰 Balans
- 📊 Mening sotuvlarim
- 📋 Katalog
- 👤 Profil
- ❓ Yordam

### 2. Production Bot (Ishlab chiqarish)

Admin chat'ga qo'shilganda avtomatik xabarlar oladi:

```
🏭 YANGI ISHLAB CHIQARISH BUYURTMASI
📦 Mahsulot: [Nomi]
📊 Miqdor: [Soni]
📅 Boshlanish: [Sana]
```

### 3. Logistics Bot (Yetkazib berish)

Admin chat'ga qo'shilganda avtomatik xabarlar oladi:

```
🚚 YANGI YETKAZIB BERISH BUYURTMASI
👤 Mijoz: [Nomi]
📍 Manzil: [Manzil]
📅 Rejalashtirilgan: [Sana]
```

### 4. Admin Bot (Boshqaruv)

Barcha jarayonlar haqida xabarlar oladi:

```
📋 YANGI BUYURTMA
✅ YETKAZIB BERISH TUGADI
🏭 ISHLAB CHIQARISH BOSHLANDI
```

## 🧪 Avtomatik Test

```bash
node test-bot-workflow.js
```

Bu test:
1. ✅ Mijoz yaratadi
2. ✅ Mahsulotlar yaratadi (biri mavjud, biri yo'q)
3. ✅ Bot orqali buyurtma beradi
4. ✅ Ombor holatini tekshiradi
5. ✅ Ishlab chiqarish yaratadi
6. ✅ Yetkazib berish yaratadi
7. ✅ Barcha botlarga xabar yuboradi

## 📊 Qo'lda Test Qilish

### 1. Mijoz Yaratish

```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Mijoz",
    "phone": "+998901234567",
    "telegramChatId": "123456789"
  }'
```

### 2. Mahsulot Yaratish

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Mahsulot",
    "pricePerBag": 25.50,
    "currentStock": 10,
    "bagType": "SMALL",
    "unitsPerBag": 50,
    "minStockLimit": 5,
    "optimalStock": 20,
    "maxCapacity": 100
  }'
```

### 3. Bot Orqali Buyurtma

```bash
curl -X POST http://localhost:5000/api/bots/customer/order \
  -H "Content-Type: application/json" \
  -d '{
    "telegramChatId": "123456789",
    "items": [
      {
        "productId": "PRODUCT_ID",
        "quantity": 5,
        "pricePerBag": 25.50
      }
    ],
    "customerInfo": {
      "name": "Test Mijoz",
      "phone": "+998901234567"
    }
  }'
```

### 4. Ishlab Chiqarishni Tugallash

```bash
curl -X PUT http://localhost:5000/api/production/orders/PRODUCTION_ID/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED",
    "actualQuantity": 10
  }'
```

### 5. Yetkazib Berishni Tugallash

```bash
curl -X PUT http://localhost:5000/api/logistics/orders/ORDER_ID/deliver \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔍 Holatni Tekshirish

### Buyurtmalar

```bash
curl http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Ishlab Chiqarish

```bash
curl http://localhost:5000/api/production/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Yetkazib Berish

```bash
curl http://localhost:5000/api/logistics/deliveries \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Bot Holati

```bash
curl http://localhost:5000/api/bots/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## ⚠️ Muammolarni Hal Qilish

### Bot ishlamayapti

1. Token to'g'ri ekanligini tekshiring
2. Bot Telegram'da faol ekanligini tekshiring
3. Server loglarini ko'ring: `npm run dev`

### Xabarlar kelmayapti

1. `TELEGRAM_ADMIN_CHAT_ID` to'g'ri sozlanganligini tekshiring
2. Bot admin chat'ga qo'shilganligini tekshiring
3. Bot'ga `/start` yuboring

### Database xatoliklari

```bash
# Database'ni qayta yaratish
rm prisma/dev.db
npx prisma migrate dev
npx prisma db seed
```

### Port band

```bash
# Boshqa portdan foydalaning
PORT=3000 npm run dev
```

## 📝 Muhim Eslatmalar

1. ✅ Barcha botlar ishga tushirilgan bo'lishi kerak
2. ✅ Admin chat ID'lar to'g'ri sozlangan bo'lishi kerak
3. ✅ Mijozlar botga `/start` yuborgan bo'lishi kerak
4. ✅ Server ishlab turishi kerak
5. ✅ Database migratsiya qilingan bo'lishi kerak

## 🎯 Kutilayotgan Natija

1. Mijoz botdan buyurtma beradi
2. Tizim ombor holatini tekshiradi
3. Yo'q mahsulotlar uchun ishlab chiqarish yaratiladi
4. Production botga xabar yuboriladi
5. Ishlab chiqarish tugaganda ombor yangilanadi
6. Logistics botga xabar yuboriladi
7. Yetkazib berish tugaganda mijozga xabar yuboriladi
8. Admin bot barcha jarayonlardan xabardor bo'ladi

## 🚀 Keyingi Qadamlar

1. ✅ Barcha testlarni o'tkazing
2. ✅ Botlarni real mijozlar bilan sinab ko'ring
3. ✅ Xabar matnlarini sozlang
4. ✅ Qo'shimcha funksiyalar qo'shing
5. ✅ Production'ga deploy qiling
