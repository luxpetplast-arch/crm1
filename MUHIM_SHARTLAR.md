# 🎯 MUHIM SHARTLAR - DOIM ESDA TUTISH KERAK!

## ⚠️ ASOSIY QOIDA

**MIJOZ CHAT TIZIMI:**

1. **Mijoz botga yozadi** → Xabar database'ga saqlanadi
2. **Saytda ko'rinadi** → Admin saytdan ko'radi
3. **Admin saytdan javob yozadi** → Database'ga saqlanadi
4. **Mijozga Telegram orqali boradi** → Bot orqali yuboriladi

## 🔄 TO'LIQ WORKFLOW

```
MIJOZ (Telegram Bot)
        ↓
    [Xabar yozadi]
        ↓
    DATABASE (CustomerChat)
    senderType: 'CUSTOMER'
        ↓
    SAYT (CustomerChat.tsx)
    [Admin ko'radi]
        ↓
    [Admin javob yozadi]
        ↓
    DATABASE (CustomerChat)
    senderType: 'ADMIN'
        ↓
    TELEGRAM BOT
    [Mijozga yuboriladi]
        ↓
    MIJOZ (Telegram)
    [Javobni ko'radi]
```

## 📋 TEXNIK TALABLAR

### 1. Database Model (CustomerChat)
```prisma
model CustomerChat {
  id              String   @id @default(uuid())
  customerId      String
  adminId         String?
  message         String
  senderType      String   // CUSTOMER yoki ADMIN
  messageType     String   @default("TEXT")
  isRead          Boolean  @default(false)
  createdAt       DateTime @default(now())
  
  customer        Customer @relation(...)
  admin           User?    @relation(...)
}
```

### 2. Bot Integration (enhanced-customer-bot.ts)
- Mijoz xabarini eshitish
- Database'ga saqlash
- Admin javobini Telegram'ga yuborish

### 3. API Routes (customer-chat.ts)
- `GET /conversations` - Barcha suhbatlar
- `GET /:customerId/messages` - Chat tarixi
- `POST /:customerId/send` - Admin xabar yuborish
- `GET /unread-count` - O'qilmagan xabarlar

### 4. Frontend (CustomerChat.tsx)
- Suhbatlar ro'yxati (chap tomon)
- Chat oynasi (o'ng tomon)
- Real-time yangilanish (har 3-5 sekund)
- Xabar yuborish formasi

## 🚨 XATOLIK QILMASLIK UCHUN

### ❌ NOTO'G'RI:
- Faqat frontend yaratish
- Faqat backend yaratish
- Bot integratsiyasini unutish
- Real-time yangilanishni qo'shmaslik

### ✅ TO'G'RI:
1. Database model yaratish
2. Bot'ga xabar saqlash qo'shish
3. API routes yaratish
4. Frontend sahifa yaratish
5. Bot orqali admin javobini yuborish
6. Real-time yangilanish qo'shish

## 📝 QANDAY ISHLASHI KERAK

### Mijoz tomoni (Telegram):
```
Mijoz: "Salom, mahsulot bormi?"
  ↓
[Bot xabarni qabul qiladi]
  ↓
[Database'ga saqlanadi]
  ↓
[Saytda ko'rinadi]
```

### Admin tomoni (Sayt):
```
[Admin saytni ochadi]
  ↓
[Yangi xabarni ko'radi]
  ↓
[Javob yozadi: "Ha, bor"]
  ↓
[Database'ga saqlanadi]
  ↓
[Bot orqali mijozga yuboriladi]
```

### Mijoz yana ko'radi (Telegram):
```
Admin: "Ha, bor"
  ↓
[Mijoz Telegram'da ko'radi]
  ↓
[Yana javob yozishi mumkin]
```

## 🔧 AMALGA OSHIRISH KETMA-KETLIGI

1. ✅ Database schema (CustomerChat model)
2. ✅ API routes (customer-chat.ts)
3. ✅ Bot integration (enhanced-customer-bot.ts)
4. ✅ Frontend page (CustomerChat.tsx)
5. ✅ Navigation (App.tsx, Layout.tsx)
6. ⏳ Test qilish
7. ⏳ Real-time yangilanish (WebSocket/Polling)

## 💡 ESLATMA

**BU TIZIM IKKI TOMONLAMA ISHLASHI KERAK:**
- Mijoz → Bot → Database → Sayt → Admin
- Admin → Sayt → Database → Bot → Mijoz

**AGAR BITTA TOMON ISHLAMASA, BUTUN TIZIM ISHLAMAYDI!**

---

*Bu faylni har doim ochiq tuting va ishni boshlashdan oldin o'qib chiqing!*
*Oxirgi yangilangan: 2026-03-05*
