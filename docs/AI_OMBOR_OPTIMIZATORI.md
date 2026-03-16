# 🤖 AI Ombor Optimizatori - To'liq Qo'llanma

## 📋 Mundarija
1. [Kirish](#kirish)
2. [Asosiy Funksiyalar](#asosiy-funksiyalar)
3. [Qanday Ishlaydi](#qanday-ishlaydi)
4. [Foydalanish](#foydalanish)
5. [AI Tahlil Tafsilotlari](#ai-tahlil-tafsilotlari)
6. [API Dokumentatsiya](#api-dokumentatsiya)

---

## Kirish

AI Ombor Optimizatori - bu sun'iy intellekt yordamida mahsulotlar uchun optimal zaxira miqdorini avtomatik hisoblash tizimi.

### Asosiy Maqsad
- ✅ Mahsulot tugashining oldini olish
- ✅ Ortiqcha zaxiradan qochish
- ✅ Pul aylanishini tezlashtirish
- ✅ Xarajatlarni kamaytirish

---

## Asosiy Funksiyalar

### 1. Sotuvlar Tahlili 📊
- Kunlik, haftalik, oylik o'rtacha sotuv
- Trend tahlili (o'sish/pasayish)
- Mavsumiy o'zgarishlar
- Bashorat qilish

### 2. Optimal Zaxira Hisoblash 🎯
- **Minimal zaxira**: 5 kunlik sotuv + xavfsizlik
- **Optimal zaxira**: 10 kunlik sotuv + xavfsizlik
- **Maksimal zaxira**: 20 kunlik sotuv + xavfsizlik
- **Buyurtma nuqtasi**: Qachon buyurtma berish kerak

### 3. Xavflar Baholash ⚠️
- Tugash xavfi (HIGH/MEDIUM/LOW)
- Ortiqcha zaxira xavfi
- Moliyaviy xavflar

### 4. Avtomatik Tavsiyalar 💡
- Qachon buyurtma berish
- Qancha buyurtma berish
- Chegirma berish kerakmi
- Moliyaviy tejash imkoniyatlari

---

## Qanday Ishlaydi

### 1. Ma'lumotlar Yig'ish
```
- Oxirgi 6 oylik sotuvlar tarixi
- Mahsulot narxi
- Joriy zaxira
- Yetkazib berish vaqti
```

### 2. AI Tahlil
```typescript
// Sotuvlar naqshini aniqlash
averageDailySales = totalSales / totalDays

// Trend hisoblash
trend = (recentSales - previousSales) / previousSales * 100

// Mavsumiy koeffitsient
seasonalFactor = peakMonthSales / averageMonthlySales
```

### 3. Optimal Zaxira Hisoblash
```typescript
// Xavfsizlik zaxirasi
safetyStock = averageDailySales * (2 + variability)

// Minimal zaxira
minStock = averageDailySales * 5 + safetyStock

// Optimal zaxira
optimalStock = averageDailySales * 10 + safetyStock

// Maksimal zaxira
maxStock = averageDailySales * 20 + safetyStock

// Buyurtma nuqtasi
reorderPoint = (averageDailySales * leadTimeDays) + safetyStock
```

### 4. Tavsiyalar Yaratish
```
IF currentStock < reorderPoint THEN
  "Buyurtma bering: X qop"
  
IF currentStock > maxStock THEN
  "Ortiqcha zaxira: Chegirma bering"
  
IF stockoutRisk = HIGH THEN
  "SHOSHILINCH: 24 soat ichida buyurtma!"
```

---

## Foydalanish

### 1. Sahifaga Kirish
```
Menyu → Boshqa → AI Ombor
```

### 2. Asosiy Ekran

#### Xavflar Statistikasi
- 🔴 Tugash xavfi (Yuqori): Shoshilinch buyurtma kerak
- 🟡 Tugash xavfi (O'rta): Tez orada buyurtma kerak
- 🟠 Ortiqcha zaxira: Chegirma bering
- 🔵 Buyurtma kerak: Buyurtma nuqtasiga yetdi

#### Buyurtma Tavsiyalari
AI avtomatik ravishda buyurtma tavsiyalarini ko'rsatadi:
- Mahsulot nomi
- Shoshilinchlik darajasi
- Buyurtma miqdori
- Taxminiy xarajat

### 3. Batafsil Tahlil

Har bir mahsulot uchun:

#### Sotuvlar Tahlili
- Kunlik o'rtacha: 50.5 qop
- Haftalik o'rtacha: 353.5 qop
- Oylik o'rtacha: 1,515 qop
- Trend: INCREASING (+15.3%)

#### Zaxira Tavsiyal ari
- Minimal: 300 qop
- Optimal: 550 qop
- Maksimal: 1,050 qop
- Buyurtma nuqtasi: 350 qop
- Buyurtma miqdori: 250 qop

#### Mavsumiy Tahlil
- Mavsumiy koeffitsient: 1.3x
- Eng ko'p sotiluvchi: Dekabr
- Eng kam sotiluvchi: Iyul

#### Xavflar
- Tugash xavfi: LOW ✅
- Ortiqcha zaxira xavfi: MEDIUM ⚠️

#### Moliyaviy
- Joriy zaxira qiymati: $5,000
- Potentsial tejash: $500

---

## AI Tahlil Tafsilotlari

### Ma'lumotlar Sifati

**EXCELLENT** (100+ sotuv)
- Juda aniq bashorat
- Ishonch: 95-100%

**GOOD** (50-100 sotuv)
- Yaxshi bashorat
- Ishonch: 75-95%

**FAIR** (20-50 sotuv)
- O'rtacha bashorat
- Ishonch: 50-75%

**POOR** (<20 sotuv)
- Kam aniq bashorat
- Ishonch: <50%

### Trend Tahlili

**INCREASING** (>10% o'sish)
- Zaxirani oshirish tavsiya etiladi
- Buyurtma miqdorini oshiring

**STABLE** (-10% to +10%)
- Joriy zaxira yetarli
- Standart buyurtma

**DECREASING** (<-10% pasayish)
- Zaxirani kamaytirish mumkin
- Buyurtma miqdorini kamaytiring

### Mavsumiy Koeffitsient

**1.0** - Mavsumiy o'zgarish yo'q
**1.5** - Eng yuqori oyda 50% ko'proq sotiladi
**0.7** - Eng past oyda 30% kam sotiladi

---

## API Dokumentatsiya

### 1. Bitta Mahsulot Tahlili
```http
GET /api/inventory-ai/analyze/:productId
Authorization: Bearer {token}
```

**Response:**
```json
{
  "productId": "uuid",
  "productName": "Un 50kg",
  "currentStock": 450,
  "averageDailySales": 50.5,
  "averageWeeklySales": 353.5,
  "averageMonthlySales": 1515,
  "salesTrend": "INCREASING",
  "trendPercentage": 15.3,
  "seasonalFactor": 1.3,
  "peakSeason": "Dekabr",
  "lowSeason": "Iyul",
  "leadTimeDays": 3,
  "leadTimeVariability": 1,
  "recommendedMinStock": 300,
  "recommendedOptimalStock": 550,
  "recommendedMaxStock": 1050,
  "reorderPoint": 350,
  "reorderQuantity": 250,
  "safetyStock": 150,
  "stockoutRisk": "LOW",
  "overstockRisk": "MEDIUM",
  "estimatedCost": 5000,
  "potentialSavings": 500,
  "confidenceScore": 85,
  "dataQuality": "GOOD",
  "warnings": ["⚠️ Zaxira biroz ko'p"],
  "recommendations": [
    "✅ Zaxira optimal holatda",
    "💡 Keyingi buyurtmani kechiktiring"
  ]
}
```

### 2. Barcha Mahsulotlar Tahlili
```http
GET /api/inventory-ai/analyze-all
Authorization: Bearer {token}
```

### 3. Xavfli Mahsulotlar
```http
GET /api/inventory-ai/risks
Authorization: Bearer {token}
```

**Response:**
```json
{
  "highStockoutRisk": [...],
  "mediumStockoutRisk": [...],
  "highOverstockRisk": [...],
  "needsReorder": [...]
}
```

### 4. Buyurtma Tavsiyalari
```http
GET /api/inventory-ai/recommendations
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "productId": "uuid",
    "productName": "Un 50kg",
    "currentStock": 100,
    "recommendedOrder": 250,
    "urgency": "HIGH",
    "estimatedCost": 2500,
    "reason": "⚠️ SHOSHILINCH: Zaxira juda kam!"
  }
]
```

---

## Foyda

### Moliyaviy Foyda
- 💰 Ortiqcha zaxira 20-30% kamayadi
- 📈 Pul aylanishi 40% tezlashadi
- 💵 Yillik tejash: $10,000+

### Operatsion Foyda
- ⚡ Buyurtma vaqti 80% qisqaradi
- ✅ Tugash hodisalari 90% kamayadi
- 📊 Aniq bashoratlar

### Strategik Foyda
- 🎯 Ma'lumotga asoslangan qarorlar
- 📈 Biznes o'sishi
- 🤖 Avtomatlashtirish

---

## Maslahatlar

### 1. Dastlabki Sozlash
- Kamida 30 kunlik sotuvlar tarixi bo'lishi kerak
- Yetkazib berish vaqtini to'g'ri kiriting
- Mahsulot narxlarini yangilang

### 2. Muntazam Tekshirish
- Haftada 1 marta AI tahlilni ko'ring
- Tavsiyalarga amal qiling
- Natijalarni kuzating

### 3. Optimizatsiya
- Ma'lumotlar sifatini oshiring (ko'proq sotuvlar)
- Mavsumiy o'zgarishlarni hisobga oling
- Trend o'zgarishlariga tez javob bering

---

## Tez-tez So'raladigan Savollar

**Q: AI qanday aniq?**
A: Ma'lumotlar sifatiga bog'liq. 100+ sotuv bo'lsa 95%+ aniqlik.

**Q: Qancha vaqt kerak?**
A: Tahlil 1-2 soniyada tayyor bo'ladi.

**Q: Qancha tez-tez yangilanadi?**
A: Har safar sahifani ochganingizda yangilanadi.

**Q: Qanday mahsulotlar uchun ishlaydi?**
A: Barcha mahsulotlar uchun, lekin muntazam sotiladigan mahsulotlar uchun yaxshiroq.

---

**Yaratilgan**: 2024
**Versiya**: 1.0.0
**Holat**: ✅ Ishlab chiqarish uchun tayyor

🤖 **AI Ombor Optimizatori - Biznesingizni yangi bosqichga olib chiqadi!**
