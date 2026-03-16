# 🔗 Bot va Sayt Integratsiyasi - To'liq Qo'llanma

**Sana:** 2026-03-11  
**Status:** ✅ Tayyor va Ishlayapti

---

## 📋 Nima Qilindi?

Botda ro'yxatdan o'tgan mijozlar avtomatik saytda ko'rinadi va saytdan ularning ma'lumotlarini tahrirlash mumkin.

### Asosiy Xususiyatlar:

✅ **Avtomatik Ro'yxatdan O'tish**
- Mijoz botda /start bosadi
- Ism, telefon, manzil so'raladi
- Ma'lumotlar database'ga saqlanadi
- Mijoz avtomatik saytda ko'rinadi

✅ **Unique ID Tizimi**
- Har bir mijozga 8 belgili unique ID beriladi
- ID botda ko'rsatiladi
- ID orqali saytda mijozni topish mumkin

✅ **Saytda Tahrirlash**
- Saytda mijozlar ro'yxatida botdan kelgan mijozlar ko'rinadi
- Telegram belgisi (📱) bilan ajratiladi
- Mijoz ma'lumotlarini tahrirlash mumkin
- Barcha o'zgarishlar database'ga saqlanadi

---

## 🔄 Jarayon

### 1. Botda Ro'yxatdan O'tish

```
Mijoz: /start

Bot: 📝 Iltimos, to'liq ismingizni kiriting:

Mijoz: Aziz Rahimov

Bot: ✅ Ism qabul qilindi
     📞 Telefon raqamingizni kiriting:
     [📱 Telefon raqamni yuborish]

Mijoz: +998901234567

Bot: ✅ Telefon qabul qilindi
     📍 Manzilingizni kiriting:

Mijoz: Toshkent shahar, Chilonzor tumani

Bot: 🎉 Tabriklaymiz! Ro'yxatdan o'tdingiz!
     
     ✅ Sizning ma'lumotlaringiz:
     • Ism: Aziz Rahimov
     • Telefon: +998901234567
     • Manzil: Toshkent shahar, Chilonzor tumani
     
     🆔 Sizning ID raqamingiz: A1B2C3D4
     
     Bu ID raqamingizni saqlang!
```

### 2. Database'ga Saqlash

```typescript
// server/bot/super-customer-bot.ts

await prisma.customer.create({
  data: {
    name: 'Aziz Rahimov',
    phone: '+998901234567',
    address: 'Toshkent shahar, Chilonzor tumani',
    telegramChatId: '123456789',
    telegramUsername: 'azizrahimov',
    category: 'REGULAR'
  }
});
```

### 3. Saytda Ko'rinish

```
http://localhost:3000/customers

┌─────────────────────────────────────┐
│ Mijozlar                            │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────┐   │
│ │ Aziz Rahimov            📱  │   │
│ │ +998901234567               │   │
│ │ Toshkent, Chilonzor         │   │
│ │ Kategoriya: REGULAR         │   │
│ │ Telegram: @azizrahimov      │   │
│ └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### 4. Saytda Tahrirlash

```
1. Mijozlar sahifasiga o'ting
2. Mijozni tanlang (Aziz Rahimov)
3. Mijoz profiliga o'ting
4. "Tahrirlash" tugmasini bosing
5. Ma'lumotlarni o'zgartiring:
   - Ism
   - Telefon
   - Email
   - Manzil
   - Kategoriya (NORMAL, VIP, RISK)
   - Kredit limiti
   - Chegirma foizi
6. "Saqlash" tugmasini bosing
```

---

## 🔧 Texnik Tafsilotlar

### Database Schema

```prisma
model Customer {
  id               String   @id @default(uuid())
  name             String
  phone            String
  email            String?
  address          String?
  telegramChatId   String?  @unique
  telegramUsername String?
  category         String   @default("REGULAR")
  balance          Float    @default(0)
  debt             Float    @default(0)
  creditLimit      Float    @default(0)
  discountPercent  Float    @default(0)
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}
```

### Bot Kodi

```typescript
// Ro'yxatdan o'tish
async function handleRegistrationStep(chatId, customerId, text, session) {
  switch (session.step) {
    case 'NAME':
      session.data.name = text.trim();
      session.step = 'PHONE';
      break;
      
    case 'PHONE':
      session.data.phone = formatPhone(text);
      session.step = 'ADDRESS';
      break;
      
    case 'ADDRESS':
      session.data.address = text.trim();
      
      // Database'ga saqlash
      await prisma.customer.update({
        where: { id: customerId },
        data: {
          name: session.data.name,
          phone: session.data.phone,
          address: session.data.address,
          category: 'REGULAR'
        }
      });
      
      // Unique ID
      const uniqueId = customerId.slice(-8).toUpperCase();
      
      // Xabar yuborish
      await superCustomerBot?.sendMessage(chatId, `
🎉 Tabriklaymiz! Ro'yxatdan o'tdingiz!

✅ Sizning ma'lumotlaringiz:
• Ism: ${session.data.name}
• Telefon: ${session.data.phone}
• Manzil: ${session.data.address}

🆔 Sizning ID raqamingiz: ${uniqueId}

Bu ID raqamingizni saqlang!
      `);
      
      break;
  }
}
```

### Sayt Kodi

```typescript
// src/pages/Customers.tsx

// Mijozlarni yuklash
const loadCustomers = () => {
  api.get('/customers').then(({ data }) => {
    setCustomers(data);
  });
};

// Mijoz kartochkasi
<Card>
  <CardContent>
    <div className="flex items-center gap-2">
      <h3>{customer.name}</h3>
      {customer.telegramChatId && (
        <span className="text-xs bg-blue-100 px-2 py-0.5 rounded-full">
          📱
        </span>
      )}
    </div>
    <p>{customer.phone}</p>
    <p>{customer.address}</p>
    {customer.telegramUsername && (
      <p>Telegram: @{customer.telegramUsername}</p>
    )}
  </CardContent>
</Card>

// Tahrirlash
const handleEdit = async (customerId, data) => {
  await api.put(`/customers/${customerId}`, data);
  loadCustomers();
};
```

---

## 📱 Foydalanish Qo'llanmasi

### Mijoz Uchun (Botda)

**1. Botni Ochish**
```
https://t.me/luxpetplastbot
```

**2. Ro'yxatdan O'tish**
```
/start → Ism → Telefon → Manzil → ID olish
```

**3. ID ni Saqlash**
```
🆔 ID: A1B2C3D4

Bu ID raqamni saqlang!
Saytda ma'lumotlaringizni topish uchun kerak bo'ladi.
```

### Admin Uchun (Saytda)

**1. Mijozlarni Ko'rish**
```
http://localhost:3000/customers

Barcha mijozlar ro'yxati:
- Saytdan qo'shilgan mijozlar
- Botdan ro'yxatdan o'tgan mijozlar (📱 belgisi bilan)
```

**2. Botdan Kelgan Mijozni Topish**
```
Qidiruv:
- Ism bo'yicha
- Telefon bo'yicha
- Telegram username bo'yicha

Yoki:
- 📱 belgisi bo'lgan mijozlarni ko'ring
```

**3. Ma'lumotlarni Tahrirlash**
```
1. Mijozni tanlang
2. Mijoz profiliga o'ting
3. "Tahrirlash" tugmasini bosing
4. Ma'lumotlarni o'zgartiring:
   ✅ Ism
   ✅ Telefon
   ✅ Email qo'shish
   ✅ Manzil
   ✅ Kategoriya (NORMAL → VIP)
   ✅ Kredit limiti
   ✅ Chegirma foizi
5. "Saqlash" tugmasini bosing
```

**4. Qo'shimcha Imkoniyatlar**
```
✅ Mijoz tarixini ko'rish
✅ Buyurtmalarni ko'rish
✅ To'lovlarni ko'rish
✅ Qarzni ko'rish
✅ Statistikani ko'rish
```

---

## 🎯 Misol

### Botda Ro'yxatdan O'tish

```
Mijoz: /start

Bot: 📝 Ismingizni kiriting:
Mijoz: Aziz Rahimov

Bot: 📞 Telefon raqamingizni kiriting:
Mijoz: +998901234567

Bot: 📍 Manzilingizni kiriting:
Mijoz: Toshkent shahar, Chilonzor tumani, 12-kvartal

Bot: 🎉 Ro'yxatdan o'tdingiz!
     🆔 ID: A1B2C3D4
```

### Saytda Ko'rish

```
Mijozlar sahifasi:

┌─────────────────────────────────────┐
│ Aziz Rahimov                    📱  │
│ +998901234567                       │
│ Toshkent, Chilonzor, 12-kvartal    │
│ Telegram: @azizrahimov              │
│ Kategoriya: REGULAR                 │
│ Qarz: 0 USD                         │
└─────────────────────────────────────┘
```

### Saytda Tahrirlash

```
Tahrirlash formasi:

┌─────────────────────────────────────┐
│ Mijozni Tahrirlash                  │
├─────────────────────────────────────┤
│ Ism: [Aziz Rahimov            ]    │
│ Telefon: [+998901234567       ]    │
│ Email: [aziz@example.com      ]    │ ← Yangi qo'shildi
│ Manzil: [Toshkent, Chilonzor  ]    │
│ Kategoriya: [VIP ▼]                │ ← O'zgartirildi
│ Kredit limiti: [5000          ]    │ ← Yangi qo'shildi
│ Chegirma: [10%                ]    │ ← Yangi qo'shildi
│                                     │
│ [Saqlash] [Bekor qilish]           │
└─────────────────────────────────────┘
```

### Natija

```
✅ Ma'lumotlar yangilandi!

Yangi ma'lumotlar:
- Ism: Aziz Rahimov
- Telefon: +998901234567
- Email: aziz@example.com ✨ Yangi
- Manzil: Toshkent, Chilonzor
- Kategoriya: VIP ✨ O'zgartirildi
- Kredit limiti: $5,000 ✨ Yangi
- Chegirma: 10% ✨ Yangi
```

---

## 🔍 Monitoring

### Database Queries

```sql
-- Botdan ro'yxatdan o'tgan mijozlar
SELECT * FROM customers 
WHERE telegram_chat_id IS NOT NULL
ORDER BY created_at DESC;

-- Bugungi ro'yxatdan o'tganlar
SELECT COUNT(*) FROM customers 
WHERE DATE(created_at) = CURRENT_DATE
AND telegram_chat_id IS NOT NULL;

-- Kategoriya bo'yicha
SELECT category, COUNT(*) 
FROM customers 
WHERE telegram_chat_id IS NOT NULL
GROUP BY category;
```

### Loglar

```bash
# Bot loglar
✅ Ro'yxatdan o'tish boshlandi: Chat ID 123456
✅ Ism qabul qilindi: Aziz Rahimov
✅ Telefon qabul qilindi: +998901234567
✅ Manzil qabul qilindi: Toshkent...
✅ Ro'yxatdan o'tish tugadi: Customer ID abc123
✅ Unique ID: A1B2C3D4

# Sayt loglar
✅ Mijoz tahrirlandi: abc123
✅ Kategoriya o'zgartirildi: REGULAR → VIP
✅ Kredit limiti o'rnatildi: $5,000
✅ Chegirma o'rnatildi: 10%
```

---

## ✅ Xususiyatlar

### Bot Tomonidan

✅ **Ro'yxatdan O'tish**
- 3 bosqichli jarayon
- Telefon formatlash
- Kontakt tugmasi
- Unique ID generatsiya

✅ **Ma'lumotlar**
- Ism
- Telefon
- Manzil
- Telegram username
- Telegram chat ID

### Sayt Tomonidan

✅ **Ko'rish**
- Barcha mijozlar ro'yxati
- Botdan kelgan mijozlar belgisi (📱)
- Telegram username
- Kategoriya

✅ **Tahrirlash**
- Ism
- Telefon
- Email qo'shish
- Manzil
- Kategoriya o'zgartirish
- Kredit limiti
- Chegirma foizi

✅ **Qo'shimcha**
- Mijoz profili
- Buyurtmalar tarixi
- To'lovlar tarixi
- Qarz holati
- Statistika

---

## 🎉 Natija

Endi:

✅ Mijoz botda ro'yxatdan o'tadi
✅ Ma'lumotlar avtomatik saytda ko'rinadi
✅ Saytdan mijoz ma'lumotlarini tahrirlash mumkin
✅ Barcha o'zgarishlar database'ga saqlanadi
✅ Bot va sayt to'liq sinxronlashgan

---

## 📝 Qo'shimcha Ma'lumot

### Telegram ID Tizimi

Agar mijoz saytda qo'shilgan bo'lsa va keyin botga kirsa:

```
1. Saytda mijoz yaratiladi (Telegram ID yo'q)
2. Mijoz botga kiradi (/start)
3. Bot mijozni topadi (telefon bo'yicha)
4. Telegram ma'lumotlari qo'shiladi
5. Saytda mijoz yangilanadi (📱 belgisi paydo bo'ladi)
```

### Kategoriya Tizimi

```
NORMAL (REGULAR):
- Oddiy mijoz
- Standart narxlar
- Standart shartlar

VIP:
- Maxsus mijoz
- Chegirmalar
- Yuqori kredit limiti
- Tezkor xizmat

RISK:
- Qarzli mijoz
- Cheklangan kredit
- Maxsus nazorat
```

---

**Tayyorlagan:** Kiro AI  
**Sana:** 2026-03-11  
**Status:** ✅ To'liq Tayyor va Ishlayapti  
**Versiya:** 1.0.0
