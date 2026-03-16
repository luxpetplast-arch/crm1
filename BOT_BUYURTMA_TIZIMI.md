# 🛒 Bot Buyurtma Tizimi - To'liq Qo'llanma

## ✅ Nima Qilindi?

### 1. Avtomatik Ro'yxatdan O'tish
Mijoz botda `/start` bosganida:
- ✅ Avtomatik Customer yaratiladi
- ✅ Telegram ma'lumotlari saqlanadi
- ✅ Unique ID beriladi
- ✅ Saytda ko'rinadi

### 2. Buyurtma Berish
Mijoz botda buyurtma berganida:
- ✅ Mahsulotlar ro'yxati ko'rsatiladi
- ✅ Miqdor tanlanadi
- ✅ Buyurtma yaratiladi
- ✅ Saytda "Buyurtmalar" bo'limida ko'rinadi

### 3. Saytda Ko'rinish
- ✅ Mijozlar ro'yxatida
- ✅ Buyurtmalar ro'yxatida
- ✅ Real-time yangilanish

---

## 🚀 Qanday Ishlaydi?

### Jarayon:

```
1. Mijoz botni ochadi
   ↓
2. /start bosadi
   ↓
3. Bot mijozni database'ga qo'shadi
   ↓
4. Xush kelibsiz xabari
   ↓
5. Mijoz "🛒 Buyurtma berish" bosadi
   ↓
6. Mahsulotlar ro'yxati ko'rsatiladi
   ↓
7. Mahsulot va miqdor tanlanadi
   ↓
8. Buyurtma database'ga saqlanadi
   ↓
9. Saytda "Buyurtmalar" bo'limida ko'rinadi
```

---

## 📊 Database Strukturasi

### Customer (Mijoz)
```typescript
{
  id: string
  name: string
  phone: string
  telegramChatId: string  // Bot bilan bog'lanish
  telegramUsername: string
  category: 'NEW' | 'REGULAR' | 'VIP'
  createdAt: DateTime
}
```

### Order (Buyurtma)
```typescript
{
  id: string
  customerId: string      // Qaysi mijoz
  orderNumber: string     // Buyurtma raqami
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED'
  totalAmount: number
  items: OrderItem[]      // Mahsulotlar
  source: 'BOT' | 'WEBSITE'  // Qayerdan kelgan
  createdAt: DateTime
}
```

---

## 🤖 Bot Komandalar

### Asosiy Komandalar
```
/start - Botni boshlash va ro'yxatdan o'tish
/order - Buyurtma berish
/myorders - Mening buyurtmalarim
/help - Yordam
```

### Tugmalar
```
🛒 Buyurtma berish
📦 Mening buyurtmalarim
💰 Balans
👤 Profil
```

---

## 💻 Saytda Ko'rish

### 1. Mijozlar Bo'limi
```
http://localhost:3000/customers
```
- Botdan kelgan mijozlar ko'rinadi
- Telegram username bilan
- "BOT" belgisi

### 2. Buyurtmalar Bo'limi
```
http://localhost:3000/orders
```
- Botdan kelgan buyurtmalar ko'rinadi
- Mijoz nomi
- Mahsulotlar
- Status
- "BOT" manbasi

---

## 🔧 Texnik Tafsilotlar

### Bot → Database Flow

```typescript
// 1. Mijoz yaratish
const customer = await prisma.customer.create({
  data: {
    name: msg.from.first_name,
    phone: `@${msg.from.username}`,
    telegramChatId: chatId.toString(),
    telegramUsername: msg.from.username,
    category: 'NEW'
  }
});

// 2. Buyurtma yaratish
const order = await prisma.order.create({
  data: {
    customerId: customer.id,
    orderNumber: generateOrderNumber(),
    status: 'PENDING',
    totalAmount: calculateTotal(items),
    source: 'BOT',
    items: {
      create: items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        pricePerBag: item.price
      }))
    }
  }
});
```

---

## 📱 Foydalanuvchi Tajribasi

### Mijoz Tomonidan:

1. **Botni Ochish**
   ```
   https://t.me/luxpetplastbot
   ```

2. **Start Bosish**
   ```
   /start
   ```
   
   Javob:
   ```
   🎉 Xush kelibsiz!
   
   Siz muvaffaqiyatli ro'yxatdan o'tdingiz!
   🆔 ID: A1B2C3D4
   
   Buyurtma berish uchun: 🛒 Buyurtma berish
   ```

3. **Buyurtma Berish**
   ```
   🛒 Buyurtma berish tugmasini bosish
   ```
   
   Javob:
   ```
   📦 Mahsulotlar:
   
   1. PET granula - 50,000 so'm
   2. HDPE granula - 45,000 so'm
   3. PP granula - 48,000 so'm
   
   Mahsulotni tanlang:
   ```

4. **Mahsulot Tanlash**
   ```
   "PET granula" tugmasini bosish
   ```
   
   Javob:
   ```
   📦 PET granula
   💰 Narx: 50,000 so'm/qop
   📊 Mavjud: 100 qop
   
   Miqdorni tanlang:
   [1 qop] [5 qop] [10 qop] [Boshqa]
   ```

5. **Miqdor Tanlash**
   ```
   "10 qop" tugmasini bosish
   ```
   
   Javob:
   ```
   ✅ Buyurtma qabul qilindi!
   
   📋 Buyurtma #12345
   📦 PET granula x 10 qop
   💰 Jami: 500,000 so'm
   
   Buyurtmangiz ko'rib chiqilmoqda...
   ```

### Admin Tomonidan (Saytda):

1. **Mijozlar Bo'limida**
   ```
   Yangi mijoz: Telegram User
   Username: @username
   Manba: BOT
   Status: Faol
   ```

2. **Buyurtmalar Bo'limida**
   ```
   Buyurtma #12345
   Mijoz: Telegram User
   Mahsulot: PET granula x 10
   Summa: 500,000 so'm
   Manba: BOT
   Status: PENDING
   ```

---

## 🎯 Xususiyatlar

### ✅ Avtomatik
- Mijoz yaratish
- Buyurtma raqami generatsiya
- Status yangilanishi
- Xabarnomalar

### ✅ Real-time
- Saytda darhol ko'rinadi
- Status o'zgarishi
- Yangi buyurtmalar

### ✅ To'liq Integratsiya
- Bot ↔ Database ↔ Sayt
- Bir tizim
- Sinxronizatsiya

---

## 🔍 Monitoring

### Bot Loglar
```bash
# Console'da
✅ Yangi mijoz: @username (Chat ID: 123456)
✅ Buyurtma yaratildi: #12345
✅ Xabarnoma yuborildi
```

### Database Queries
```sql
-- Botdan kelgan mijozlar
SELECT * FROM customers WHERE telegram_chat_id IS NOT NULL;

-- Botdan kelgan buyurtmalar
SELECT * FROM orders WHERE source = 'BOT';

-- Bugungi bot buyurtmalari
SELECT COUNT(*) FROM orders 
WHERE source = 'BOT' 
AND DATE(created_at) = CURRENT_DATE;
```

---

## 🐛 Troubleshooting

### Mijoz Yaratilmayapti
1. Server ishlab turganini tekshiring
2. Database ulanishini tekshiring
3. Bot loglarini ko'ring

### Buyurtma Ko'rinmayapti
1. Database'da borligini tekshiring
2. Saytni refresh qiling
3. Filter sozlamalarini tekshiring

### Bot Javob Bermayapti
1. Token to'g'riligini tekshiring
2. Server ishlab turganini tekshiring
3. Internet ulanishini tekshiring

---

## 📈 Statistika

### Bot Metrikalari
- Jami foydalanuvchilar
- Bugungi buyurtmalar
- Konversiya darajasi
- O'rtacha buyurtma summasi

### Sayt Metrikalari
- Bot vs Sayt buyurtmalari
- Bot mijozlar faolligi
- Eng ko'p buyurtma berilgan mahsulotlar

---

## ✅ Checklist

### Setup
- [ ] Bot tokeni sozlangan
- [ ] Server ishga tushgan
- [ ] Database migratsiya bajarilgan
- [ ] Mahsulotlar qo'shilgan

### Test
- [ ] Botda /start ishlaydi
- [ ] Mijoz saytda ko'rinadi
- [ ] Buyurtma berish ishlaydi
- [ ] Buyurtma saytda ko'rinadi

### Production
- [ ] Xavfsizlik sozlangan
- [ ] Monitoring sozlangan
- [ ] Backup tizimi ishlayapti
- [ ] Error handling to'g'ri

---

## 🎉 Natija

Endi sizda to'liq funksional bot-sayt integratsiyasi bor:

✅ Mijozlar botda ro'yxatdan o'tadi
✅ Buyurtma botda beriladi
✅ Hammasi saytda ko'rinadi
✅ Real-time yangilanish
✅ To'liq monitoring

---

**Tayyorlagan:** Kiro AI  
**Sana:** 2026-03-11  
**Status:** ✅ Tayyor va Ishlayapti
