# Ommaviy Narx O'zgartirish - Vizual Qo'llanma

## 🎨 Interfeys Ko'rinishi

### Oldingi Holat (Eski Versiya)

```
┌────────────────────────────────────────────────────────────┐
│  📦 Mahsulot uchun har bir mijozga alohida narx belgilang │
│  💰 Asosiy narx: 100,000 UZS/qop                          │
├────────────────────────────────────────────────────────────┤
│  ℹ️ Jami 10 ta mijoz topildi                              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │ [1] Mijoz A                                      │    │
│  │     📞 +998901234567                             │    │
│  │                          UZS [100000] /qop       │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │ [2] Mijoz B                                      │    │
│  │     📞 +998901234568                             │    │
│  │                          UZS [150000] /qop       │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  ... (har birini alohida o'zgartirish kerak edi)         │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Yangi Holat (Ommaviy O'zgartirish Bilan)

```
┌────────────────────────────────────────────────────────────┐
│  📦 Mahsulot uchun har bir mijozga alohida narx belgilang │
│  💰 Asosiy narx: 100,000 UZS/qop                          │
├────────────────────────────────────────────────────────────┤
│  ⚡ BARCHA MIJOZLAR UCHUN NARXNI BIRDAN O'ZGARTIRISH      │
│  ┌────────────────────────────────────────────────────┐  │
│  │                                                    │  │
│  │  [Miqdorni kiriting: 10]  [% Foiz✓] [UZS So'm]  │  │
│  │                                                    │  │
│  │  [📈 Ko'tarish]          [📉 Tushirish]          │  │
│  │                                                    │  │
│  │  💡 Masalan: 10% yoki 5000 UZS ga barcha         │  │
│  │     narxlarni birdan o'zgartiring                │  │
│  └────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────┤
│  ℹ️ Jami 10 ta mijoz topildi                              │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │ [1] Mijoz A                                      │    │
│  │     📞 +998901234567                             │    │
│  │                          UZS [110000] /qop       │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │ [2] Mijoz B                                      │    │
│  │     📞 +998901234568                             │    │
│  │                          UZS [165000] /qop       │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  ... (barcha narxlar avtomatik o'zgardi!)                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## 🎬 Foydalanish Animatsiyasi

### Qadam 1: Miqdorni Kiriting

```
┌─────────────────────────────────────────┐
│  [Miqdorni kiriting: _]                │
│                                         │
│  Foydalanuvchi yozadi: 10              │
│                                         │
│  [Miqdorni kiriting: 10]               │
└─────────────────────────────────────────┘
```

### Qadam 2: Tur Tanlang

```
┌─────────────────────────────────────────┐
│  [% Foiz]  [UZS So'm]                  │
│     ↓                                   │
│  [% Foiz✓] [UZS So'm]                  │
│   (yashil)  (kulrang)                  │
└─────────────────────────────────────────┘
```

### Qadam 3: Yo'nalish Tanlang

```
┌─────────────────────────────────────────┐
│  [📈 Ko'tarish]  [📉 Tushirish]        │
│        ↓                                │
│  Foydalanuvchi "Ko'tarish" ni bosadi   │
└─────────────────────────────────────────┘
```

### Qadam 4: Tasdiqlash

```
┌─────────────────────────────────────────┐
│           ✅ Tasdiqlash                 │
│                                         │
│  10 ta mijoz uchun narx 10% ga         │
│  ko'tarildi!                            │
│                                         │
│              [OK]                       │
└─────────────────────────────────────────┘
```

### Qadam 5: Natija

```
Oldingi narxlar:          Yangi narxlar:
┌──────────────┐         ┌──────────────┐
│ 100,000 UZS  │   →     │ 110,000 UZS  │
│ 150,000 UZS  │   →     │ 165,000 UZS  │
│ 200,000 UZS  │   →     │ 220,000 UZS  │
│ 120,000 UZS  │   →     │ 132,000 UZS  │
│ 180,000 UZS  │   →     │ 198,000 UZS  │
└──────────────┘         └──────────────┘
```

## 🎯 Interaktiv Misollar

### Misol 1: 10% Ko'tarish

```
BOSHLANG'ICH HOLAT:
┌─────────────────────────────────────────────────┐
│ Mijoz A: 100,000 UZS                           │
│ Mijoz B: 150,000 UZS                           │
│ Mijoz C: 200,000 UZS                           │
└─────────────────────────────────────────────────┘

AMAL:
┌─────────────────────────────────────────────────┐
│ Miqdor: 10                                      │
│ Tur: % Foiz                                     │
│ Yo'nalish: Ko'tarish                            │
└─────────────────────────────────────────────────┘

HISOBLASH:
┌─────────────────────────────────────────────────┐
│ Mijoz A: 100,000 + (100,000 × 10%) = 110,000  │
│ Mijoz B: 150,000 + (150,000 × 10%) = 165,000  │
│ Mijoz C: 200,000 + (200,000 × 10%) = 220,000  │
└─────────────────────────────────────────────────┘

YAKUNIY HOLAT:
┌─────────────────────────────────────────────────┐
│ Mijoz A: 110,000 UZS (+10,000) ✅              │
│ Mijoz B: 165,000 UZS (+15,000) ✅              │
│ Mijoz C: 220,000 UZS (+20,000) ✅              │
└─────────────────────────────────────────────────┘
```

### Misol 2: 5,000 UZS Tushirish

```
BOSHLANG'ICH HOLAT:
┌─────────────────────────────────────────────────┐
│ Mijoz A: 100,000 UZS                           │
│ Mijoz B: 150,000 UZS                           │
│ Mijoz C: 200,000 UZS                           │
└─────────────────────────────────────────────────┘

AMAL:
┌─────────────────────────────────────────────────┐
│ Miqdor: 5000                                    │
│ Tur: UZS So'm                                   │
│ Yo'nalish: Tushirish                            │
└─────────────────────────────────────────────────┘

HISOBLASH:
┌─────────────────────────────────────────────────┐
│ Mijoz A: 100,000 - 5,000 = 95,000             │
│ Mijoz B: 150,000 - 5,000 = 145,000            │
│ Mijoz C: 200,000 - 5,000 = 195,000            │
└─────────────────────────────────────────────────┘

YAKUNIY HOLAT:
┌─────────────────────────────────────────────────┐
│ Mijoz A: 95,000 UZS (-5,000) ✅                │
│ Mijoz B: 145,000 UZS (-5,000) ✅               │
│ Mijoz C: 195,000 UZS (-5,000) ✅               │
└─────────────────────────────────────────────────┘
```

### Misol 3: Xavfsizlik (Manfiy Narx)

```
BOSHLANG'ICH HOLAT:
┌─────────────────────────────────────────────────┐
│ Mijoz A: 3,000 UZS                             │
│ Mijoz B: 8,000 UZS                             │
│ Mijoz C: 15,000 UZS                            │
└─────────────────────────────────────────────────┘

AMAL:
┌─────────────────────────────────────────────────┐
│ Miqdor: 5000                                    │
│ Tur: UZS So'm                                   │
│ Yo'nalish: Tushirish                            │
└─────────────────────────────────────────────────┘

HISOBLASH (XAVFSIZLIK BILAN):
┌─────────────────────────────────────────────────┐
│ Mijoz A: max(0, 3,000 - 5,000) = 0            │
│ Mijoz B: max(0, 8,000 - 5,000) = 3,000        │
│ Mijoz C: max(0, 15,000 - 5,000) = 10,000      │
└─────────────────────────────────────────────────┘

YAKUNIY HOLAT:
┌─────────────────────────────────────────────────┐
│ Mijoz A: 0 UZS (manfiy emas!) ✅               │
│ Mijoz B: 3,000 UZS (-5,000) ✅                 │
│ Mijoz C: 10,000 UZS (-5,000) ✅                │
└─────────────────────────────────────────────────┘
```

## 🎨 Rang Sxemasi

### Ommaviy O'zgartirish Bo'limi

```
┌────────────────────────────────────────┐
│  Fon: Yashil gradient                 │
│  (from-green-50 to-emerald-50)        │
│                                        │
│  Border: Yashil                        │
│  (border-green-200)                   │
│                                        │
│  Matn: Qora/Oq (dark mode)            │
└────────────────────────────────────────┘
```

### Tugmalar

```
Ko'tarish:                  Tushirish:
┌──────────────┐           ┌──────────────┐
│ 📈 Ko'tarish │           │ 📉 Tushirish │
│              │           │              │
│ Fon: Ko'k    │           │ Fon: Qizil   │
│ gradient     │           │ gradient     │
└──────────────┘           └──────────────┘
```

### Tur Tanlash

```
Tanlangan:                  Tanlanmagan:
┌──────────┐               ┌──────────┐
│ % Foiz   │               │ UZS So'm │
│          │               │          │
│ Yashil   │               │ Kulrang  │
│ Oq matn  │               │ Qora matn│
└──────────┘               └──────────┘
```

## 📱 Responsive Dizayn

### Desktop (≥ 640px)

```
┌────────────────────────────────────────────────────┐
│  [Miqdor: 10]  [% Foiz✓] [UZS So'm]              │
│                                                    │
│  [📈 Ko'tarish]          [📉 Tushirish]          │
└────────────────────────────────────────────────────┘
     Gorizontal joylashuv
```

### Mobil (< 640px)

```
┌──────────────────────┐
│  [Miqdor: 10]       │
│                      │
│  [% Foiz✓]          │
│  [UZS So'm]         │
│                      │
│  [📈 Ko'tarish]     │
│                      │
│  [📉 Tushirish]     │
└──────────────────────┘
  Vertikal joylashuv
```

## 🔄 Workflow Diagrammasi

```
START
  │
  ├─→ [Mahsulot sahifasini och]
  │
  ├─→ ["Narx belgilash" tugmasini bos]
  │
  ├─→ [Modal ochiladi]
  │
  ├─→ [Ommaviy o'zgartirish bo'limini top]
  │
  ├─→ [Miqdorni kiritish]
  │     │
  │     ├─→ Foiz (5, 10, 15, ...)
  │     └─→ So'm (1000, 5000, ...)
  │
  ├─→ [Tur tanlash]
  │     │
  │     ├─→ % Foiz
  │     └─→ UZS So'm
  │
  ├─→ [Yo'nalish tanlash]
  │     │
  │     ├─→ Ko'tarish (+)
  │     └─→ Tushirish (-)
  │
  ├─→ [Hisoblash]
  │     │
  │     ├─→ Har bir mijoz uchun
  │     ├─→ Yangi narx = f(hozirgi, miqdor, tur)
  │     └─→ Xavfsizlik: max(0, yangi_narx)
  │
  ├─→ [Tasdiqlash xabari]
  │
  ├─→ [Natijani ko'rish]
  │
  ├─→ ["Saqlash" tugmasini bos]
  │
  └─→ [Bazaga yozish]
       │
       └─→ END
```

## ✅ Tayyor!

Vizual qo'llanma tugallandi. Endi interfeys va funksiyalarni to'liq tushunasiz!

---

**Yaratilgan:** 2026-03-14
**Versiya:** 1.0.0
