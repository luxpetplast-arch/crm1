# Buyurtma Sotuv va To'lov Tizimi

## Umumiy Ma'lumot

Buyurtmalar endi to'liq ishlab chiqarish jarayonidan sotuvgacha kuzatiladi. Ishlab chiqarish tugagandan keyin buyurtma "Tayyor" statusiga o'tadi va keyin sotish va to'lov qabul qilish mumkin.

## Buyurtma Statuslari

1. **PENDING** - Kutilmoqda (yangi buyurtma)
2. **CONFIRMED** - Tasdiqlandi
3. **IN_PRODUCTION** - Ishlab chiqarilmoqda
4. **READY** - Tayyor (ishlab chiqarish tugadi)
5. **SOLD** - Sotildi (to'lov qabul qilindi)
6. **DELIVERED** - Yetkazildi
7. **CANCELLED** - Bekor qilindi

## Yangi Funksiya: READY → SOLD

### Qanday Ishlaydi?

1. Buyurtma "Tayyor" statusiga kelganda, "Sotish va To'lov Qabul Qilish" tugmasi paydo bo'ladi
2. Tugmani bosganda to'lov modali ochiladi
3. To'lov modalida:
   - Jami summa ko'rsatiladi
   - 3 xil to'lov turi kiritiladi: UZS, USD, Click
   - Agar to'liq to'lanmasa, qarz sanasi belgilanadi
   - Mijoz ma'lumotlari ko'rsatiladi

### To'lov Jarayoni

```
READY Status
    ↓
[Sotish va To'lov Qabul Qilish] tugmasi
    ↓
To'lov Modali
    ↓
To'lov ma'lumotlarini kiritish:
  - 💵 UZS (so'm)
  - 💵 USD (dollar)
  - 💳 Click
    ↓
Agar to'liq to'lanmasa:
  - Qarz hisoblanadi
  - Qarz sanasi belgilanadi
  - Mijoz daftariga qarz yoziladi
    ↓
Kassa tranzaksiyasi yaratiladi
    ↓
Telegram orqali chek yuboriladi
    ↓
SOLD Status
```

## Backend API

### POST /api/orders/:id/sell

Buyurtmani sotish va to'lov qabul qilish.

**Request Body:**
```json
{
  "paymentDetails": {
    "uzs": 0,
    "usd": 100,
    "click": 0
  },
  "dueDate": "2026-03-16"
}
```

**Response:**
```json
{
  "order": { ... },
  "totalPaid": 100,
  "remainingDebt": 0,
  "message": "✅ Buyurtma to'liq to'lanib sotildi!"
}
```

## Avtomatik Jarayonlar

### 1. Qarz Yozish
Agar to'lov to'liq bo'lmasa:
- Mijoz daftariga qarz qo'shiladi
- Qarz sanasi saqlanadi (eslatma uchun)

### 2. Kassa Tranzaksiyasi
To'lov qabul qilinganda:
- Kassa tranzaksiyasi avtomatik yaratiladi
- Type: INCOME
- Category: SALE
- Reference: Order ID

### 3. Telegram Chek
Agar mijozda Telegram ID bo'lsa:
- Avtomatik chek yuboriladi
- Mahsulotlar ro'yxati
- To'lov tafsilotlari
- Qarz ma'lumoti (agar bo'lsa)
- Qarz to'lov sanasi

## Telegram Chek Formati

```
🧾 BUYURTMA CHEKI

📋 Buyurtma: #ORD-001
📅 Sana: 09.03.2026, 14:30

📦 MAHSULOTLAR:
1. Mahsulot A
   5 qop, 10 dona x $20.00 = $100.00

2. Mahsulot B
   3 qop, 5 dona x $15.00 = $45.00

━━━━━━━━━━━━━━━━━━━━
💰 JAMI: $145.00

💳 TO'LOV:
💵 Naqd (UZS): 500,000 so'm
💵 Dollar (USD): $50.00

✅ To'langan: $100.00

⚠️ QARZ MA'LUMOTI
💰 Qarz: $45.00
📅 To'lov sanasi: 16.03.2026

📞 Qarzni to'lash uchun biz bilan bog'laning!

📱 Savollar uchun: /help
🏪 Bizni tanlaganingiz uchun rahmat!
```

## Frontend UI

### Kanban Board
6 ta ustun:
1. Kutilmoqda (sariq)
2. Tasdiqlandi (ko'k)
3. Ishlab chiqarilmoqda (binafsha)
4. Tayyor (yashil)
5. **Sotildi (yashil-ko'k)** ← YANGI
6. Yetkazildi (kulrang)

### To'lov Modali
- Responsive dizayn
- 3 xil to'lov input
- Real-time jami hisoblash
- Qarz ko'rsatkichi
- Qarz sanasi tanlash
- Mijoz ma'lumotlari
- Telegram status

## Xavfsizlik

- Faqat ADMIN va CASHIER sotish mumkin
- To'lov ma'lumotlari JSON formatda saqlanadi
- Kassa tranzaksiyalari audit log bilan
- Telegram xatolari asosiy jarayonni to'xtatmaydi

## Kelajakda Qo'shilishi Mumkin

1. ✅ Qarz eslatma tizimi (cron job)
2. ✅ To'lov tarixi
3. ✅ Chek PDF generatsiya
4. ✅ SMS eslatma
5. ✅ Qarz statistikasi

## Test Qilish

1. Buyurtma yarating
2. Tasdiqlang
3. Ishlab chiqarishni boshlang
4. "Tayyor" deb belgilang
5. "Sotish va To'lov Qabul Qilish" tugmasini bosing
6. To'lov ma'lumotlarini kiriting
7. Telegram'da chekni tekshiring
8. Mijoz daftarida qarzni tekshiring

## Muammolar va Yechimlar

### Telegram chek kelmasa:
- Mijozda `telegramChatId` borligini tekshiring
- `notificationsEnabled` yoqilganligini tekshiring
- Bot ishlab turganligini tekshiring

### Qarz yozilmasa:
- Backend loglarni tekshiring
- Database tranzaksiyalarni tekshiring

### To'lov saqlanmasa:
- `paymentDetails` JSON formatini tekshiring
- Kassa tranzaksiyasi yaratilganligini tekshiring

---

**Yaratildi:** 2026-03-09
**Versiya:** 1.0
**Holat:** ✅ Tayyor
