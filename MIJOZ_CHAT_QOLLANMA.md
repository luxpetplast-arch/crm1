# 💬 MIJOZ CHAT TIZIMI - TO'LIQ QO'LLANMA

## 🎯 ASOSIY MAQSAD

Mijozlar Telegram bot orqali xabar yozadi → Saytda ko'rinadi → Admin saytdan javob beradi → Mijozga Telegram orqali boradi.

## 🚀 QANDAY ISHLAYDI

### 1️⃣ MIJOZ BOTGA XABAR YOZADI

```
Mijoz Telegram'da:
"Assalomu alaykum, mahsulot bormi?"
```

**Nima bo'ladi:**
- Bot xabarni qabul qiladi
- Database'ga saqlanadi (CustomerChat table)
- Mijozga tasdiq xabari: "✅ Xabaringiz qabul qilindi!"

### 2️⃣ SAYTDA KO'RINADI

```
Admin saytga kiradi:
http://localhost:3000/customer-chat

Ko'radi:
┌─────────────────────────────┐
│ 👤 Mijoz Ismi               │
│ 📞 +998901234567           │
│ 🔴 1 yangi xabar           │
│                             │
│ "Assalomu alaykum,         │
│  mahsulot bormi?"          │
└─────────────────────────────┘
```

### 3️⃣ ADMIN JAVOB YOZADI

```
Admin saytda yozadi:
"Ha, barcha mahsulotlar mavjud!"

[Yuborish] tugmasini bosadi
```

**Nima bo'ladi:**
- Xabar database'ga saqlanadi
- Bot orqali mijozga yuboriladi

### 4️⃣ MIJOZ JAVOBNI KO'RADI

```
Mijoz Telegram'da ko'radi:
💬 ADMIN XABARI

Ha, barcha mahsulotlar mavjud!

---
📞 Javob berish uchun xabar yozing.
```

## 📱 SAYT INTERFEYSI

### Suhbatlar ro'yxati (Chap tomon)

```
┌─────────────────────────────────┐
│  SUHBATLAR                      │
├─────────────────────────────────┤
│ 👤 Ahmadjon Karimov            │
│ 📞 +998901234567               │
│ 🔴 3 yangi                     │
│ "Mahsulot bormi?"              │
│ 5 daqiqa oldin                 │
├─────────────────────────────────┤
│ 👤 Dilshod Toshmatov           │
│ 📞 +998907654321               │
│ ✓ "Rahmat!"                    │
│ 1 soat oldin                   │
└─────────────────────────────────┘
```

### Chat oynasi (O'ng tomon)

```
┌─────────────────────────────────┐
│  Ahmadjon Karimov               │
│  +998901234567 • @ahmadjon      │
├─────────────────────────────────┤
│                                 │
│  👤 Mijoz: Salom               │
│     10:30                       │
│                                 │
│           Admin: Assalomu ✓    │
│           alaykum!             │
│                    10:31        │
│                                 │
│  👤 Mijoz: Mahsulot bormi?     │
│     10:32                       │
│                                 │
│           Admin: Ha, bor! ✓    │
│                    10:33        │
│                                 │
├─────────────────────────────────┤
│ [Xabar yozing...] [Yuborish]   │
└─────────────────────────────────┘
```

## 🔧 TEXNIK TAFSILOTLAR

### Database Structure

```sql
CustomerChat:
- id: unique ID
- customerId: Mijoz ID
- adminId: Admin ID (agar admin yozgan bo'lsa)
- message: Xabar matni
- senderType: 'CUSTOMER' yoki 'ADMIN'
- messageType: 'TEXT', 'IMAGE', 'LOCATION'
- isRead: O'qilganmi?
- createdAt: Yaratilgan vaqt
```

### API Endpoints

```
GET  /api/customer-chat/conversations
     → Barcha suhbatlar ro'yxati

GET  /api/customer-chat/:customerId/messages
     → Bitta mijoz bilan chat tarixi

POST /api/customer-chat/:customerId/send
     → Admin xabar yuborish
     Body: { message: "...", messageType: "TEXT" }

GET  /api/customer-chat/unread-count
     → O'qilmagan xabarlar soni

PUT  /api/customer-chat/:customerId/read-all
     → Barcha xabarlarni o'qilgan deb belgilash
```

### Bot Integration

**Mijoz xabarini qabul qilish:**
```typescript
enhancedCustomerBot.on('message', async (msg) => {
  // Xabarni database'ga saqlash
  await prisma.customerChat.create({
    data: {
      customerId: customer.id,
      message: msg.text,
      senderType: 'CUSTOMER',
      isRead: false
    }
  });
});
```

**Admin javobini yuborish:**
```typescript
// Admin saytdan yozadi
POST /api/customer-chat/:customerId/send

// Backend mijozga yuboradi
await customerBot.sendMessage(telegramChatId, `
💬 ADMIN XABARI

${message}
`);
```

## 📊 REAL-TIME YANGILANISH

Sayt har 3-5 sekundda avtomatik yangilanadi:

```typescript
useEffect(() => {
  // Suhbatlarni yangilash
  const interval = setInterval(fetchConversations, 5000);
  return () => clearInterval(interval);
}, []);

useEffect(() => {
  // Xabarlarni yangilash
  if (selectedCustomerId) {
    const interval = setInterval(() => 
      fetchMessages(selectedCustomerId), 3000
    );
    return () => clearInterval(interval);
  }
}, [selectedCustomerId]);
```

## 🎨 XUSUSIYATLAR

### ✅ Mavjud:
- ✅ Ikki tomonlama chat
- ✅ Real-time yangilanish
- ✅ O'qilgan/o'qilmagan belgilash
- ✅ Vaqt ko'rsatish
- ✅ Mijoz ma'lumotlari
- ✅ Suhbatlar ro'yxati
- ✅ Yangi xabarlar soni

### 🔄 Qo'shimcha imkoniyatlar:
- 📷 Rasm yuborish
- 📍 Joylashuv yuborish
- 📎 Fayl yuborish
- 🔔 Push bildirishnomalar
- 🔍 Qidiruv
- 📊 Statistika

## 🧪 TEST QILISH

### 1. Mijoz botga yozadi:
```bash
# Telegram'da botni oching
/start

# Oddiy xabar yozing
"Salom, mahsulot bormi?"
```

### 2. Saytda tekshiring:
```bash
# Saytga kiring
http://localhost:3000/customer-chat

# Xabar ko'rinishini tekshiring
```

### 3. Admin javob beradi:
```bash
# Saytda javob yozing
"Ha, barcha mahsulotlar mavjud!"

# [Yuborish] tugmasini bosing
```

### 4. Mijoz Telegram'da ko'radi:
```bash
# Telegram'da botni oching
# Admin javobini ko'ring
```

## 🚨 MUAMMOLAR VA YECHIMLAR

### ❓ Xabar saytda ko'rinmayapti?

**Tekshiring:**
1. Bot ishlab turibmi? → `npm run dev`
2. Database yangilanganmi? → `npx prisma studio`
3. API ishlayaptimi? → `curl http://localhost:3001/api/customer-chat/conversations`

### ❓ Admin javobi mijozga bormayapti?

**Tekshiring:**
1. Mijozning telegramChatId to'g'rimi?
2. Bot tokeni to'g'rimi?
3. Bot xabar yuborish huquqiga egami?

### ❓ Real-time yangilanmayapti?

**Tekshiring:**
1. useEffect ishlayaptimi?
2. setInterval to'g'ri sozlanganmi?
3. API so'rovlari muvaffaqiyatlimi?

## 📞 YORDAM

Agar muammo bo'lsa:
1. Console loglarni tekshiring
2. Network tabni tekshiring
3. Database'ni tekshiring: `npx prisma studio`
4. Bot loglarini tekshiring

---

## 🎉 XULOSA

Bu tizim mijozlar bilan to'g'ridan-to'g'ri muloqot qilish imkonini beradi:
- ✅ Tez javob berish
- ✅ Barcha xabarlar bir joyda
- ✅ Qulay interfeys
- ✅ Real-time yangilanish

**Saytga kiring va sinab ko'ring:**
http://localhost:3000/customer-chat

---

*Oxirgi yangilangan: 2026-03-05*
*Versiya: 1.0.0*
