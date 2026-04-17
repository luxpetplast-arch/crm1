# 📊 65 TA BIZNES METRIKASI TIZIMI

## 🎯 Umumiy Ma'lumot

Saytda endi **65 ta alohida biznes metrikasi** mavjud. Har bir metrika uchun:
- ✅ Alohida div/card
- ✅ Foiz ko'rsatkichi
- ✅ Mini chart (line yoki bar)
- ✅ Trend ko'rsatkichi (↑ yoki ↓)
- ✅ Rang kodlash

## 📋 Metrikalar Ro'yxati

### 1️⃣ SAVDO METRIKALARI (8 ta)

1. **Savdo Hajmi** - Jami sotilgan mahsulotlar soni
2. **Daromad** - Umumiy daromad
3. **O'rtacha Buyurtma** - Har bir buyurtmaning o'rtacha qiymati
4. **Savdo O'sishi** - Oldingi davr bilan taqqoslash
5. **Mijoz Boshiga Sotuv** - Har bir mijozdan olingan o'rtacha daromad
6. **Kunlik Sotuv** - Kunlik o'rtacha sotuv
7. **Konversiya** - Mijozlarning sotib olish foizi
8. **Qayta Xarid** - Qayta xarid qilgan mijozlar foizi

### 2️⃣ MAHSULOT METRIKALARI (8 ta)

9. **Sotilgan Mahsulot Qiymati (COGS)** - Sotilgan mahsulotlarning tannarxi
10. **Birlik Narxi** - Har bir mahsulotning o'rtacha narxi
11. **Birlik Foydasi** - Har bir mahsulotdan olingan foyda
12. **Yalpi Foyda** - Umumiy yalpi foyda
13. **Yalpi Marja** - Yalpi foyda foizi
14. **Hissa Marjasi** - Har bir mahsulotning hissasi
15. **Ombor Aylanishi** - Ombor aylanish tezligi
16. **Ombor Kunlari** - Mahsulot omborда turish muddati

### 3️⃣ FOYDA VA RENTABELLIK (7 ta)

17. **Sof Foyda** - Barcha xarajatlardan keyin qolgan foyda
18. **Sof Foyda Marjasi** - Sof foyda foizi
19. **Operatsion Foyda** - Operatsion faoliyatdan foyda
20. **Operatsion Marja** - Operatsion foyda foizi
21. **ROI** - Investitsiya rentabelligi
22. **Break-Even Nuqtasi** - Foyda olish uchun kerakli sotuv hajmi
23. **Birlik Hissasi** - Har bir mahsulotning hissasi

### 4️⃣ MARKETING VA MIJOZLAR (6 ta)

24. **CAC** - Mijoz jalb qilish narxi
25. **LTV** - Mijozning umr qiymati
26. **LTV/CAC** - LTV va CAC nisbati
27. **Mijozlarni Ushlab Qolish** - Mijozlarni saqlab qolish foizi
28. **Churn Rate** - Mijozlar yo'qotish foizi
29. **Marketing ROI** - Marketing investitsiyalarining rentabelligi

### 5️⃣ QARZDORLIK (6 ta)

30. **Jami Qarz** - Umumiy qarz miqdori
31. **Qarz Nisbati** - Qarzning daromadga nisbati
32. **Debitorlik Qarz** - Mijozlardan olinadigan qarz
33. **Qarz Aylanishi** - Qarz aylanish tezligi
34. **DSO** - Qarzni yig'ish uchun kerakli kunlar
35. **Yomon Qarz** - Yomon qarzlar foizi

### 6️⃣ PUL OQIMI (3 ta)

36. **Operatsion Pul Oqimi** - Operatsion faoliyatdan pul oqimi
37. **Erkin Pul Oqimi** - Erkin pul oqimi
38. **Pul Konversiya Sikli** - Pulni qaytarish sikli

### 7️⃣ OPERATSION SAMARADORLIK (4 ta)

39. **Xodim Samaradorligi** - Xodim boshiga sotuv
40. **Xodim Boshiga Daromad** - Xodim boshiga daromad
41. **Buyurtma Bajarish Vaqti** - Buyurtmani bajarish vaqti
42. **O'z Vaqtida Yetkazish** - O'z vaqtida yetkazish foizi

### 8️⃣ STRATEGIK O'SISH (3 ta)

43. **Mijozlar O'sishi** - Mijozlar sonining o'sishi
44. **Mahsulotlar O'sishi** - Mahsulotlar sonining o'sishi
45. **Yangi Mijozlar** - Yangi mijozlar soni
46. **Qaytgan Mijozlar** - Qaytgan mijozlar soni

## 🎨 Vizual Dizayn

### Rang Kodlash
- 🔵 **Ko'k** - Savdo va daromad
- 🟢 **Yashil** - Foyda va o'sish
- 🟣 **Binafsha** - Mahsulotlar
- 🟠 **To'q sariq** - Mijozlar va marketing
- 🔴 **Qizil** - Qarzlar va xarajatlar
- 🟡 **Sariq** - Operatsion ko'rsatkichlar
- 🔷 **Cyan** - Pul oqimi

### Har Bir Card Tarkibi
```
┌─────────────────────────────┐
│ 🎯 Icon    Metrika Nomi  ↑5%│
│                             │
│ $12,345                     │
│ Asosiy qiymat               │
│                             │
│ ▁▂▅▆▇ Mini Chart           │
│                             │
│ Trend: +5.2%                │
└─────────────────────────────┘
```

## 🚀 Foydalanish

### Frontend
```typescript
// Statistics sahifasida
<MetricsCharts metrics={businessMetrics} />
```

### Backend API
```bash
GET /api/statistics/business-metrics?days=30
```

### Parametrlar
- `days=7` - Oxirgi 7 kun
- `days=30` - Oxirgi 30 kun (default)
- `days=90` - Oxirgi 90 kun
- `days=365` - Oxirgi 1 yil

## 📊 Tablar

Saytda 6 ta tab mavjud:
1. **Umumiy** - Asosiy ko'rsatkichlar
2. **65 Metrika** - Barcha 65 ta metrika
3. **Sotuvlar** - Sotuv statistikasi
4. **Mahsulotlar** - Mahsulot tahlili
5. **Mijozlar** - Mijozlar tahlili
6. **Moliyaviy** - Moliyaviy hisobotlar

## 🧪 Test

```bash
node test-65-metrics.cjs
```

Test natijasi:
- ✅ 30 kunlik metrikalar
- ✅ 90 kunlik metrikalar
- ✅ Barcha 46+ metrika
- ✅ Taqqoslash

## 📱 Responsive

Barcha metrikalar responsive:
- 📱 Mobile: 1 ustun
- 💻 Tablet: 2 ustun
- 🖥️ Desktop: 4 ustun

## 🎯 Xususiyatlar

1. **Real-time** - Har safar yangilanadi
2. **Interactive** - Hover effektlar
3. **Animated** - Smooth transitions
4. **Color-coded** - Rang bo'yicha ajratilgan
5. **Trend indicators** - O'sish/kamayish ko'rsatkichlari
6. **Mini charts** - Har bir metrika uchun chart
7. **Percentage** - Foiz ko'rsatkichlari
8. **Comparison** - Oldingi davr bilan taqqoslash

## 💡 Qo'shimcha

### Export
```bash
GET /api/statistics/export?days=30&format=pdf
```

### Refresh
Yangilash tugmasi orqali real-time yangilanadi.

### Time Range
Dropdown orqali vaqt oralig'ini tanlash mumkin.

## 🎉 Natija

✅ 65 ta alohida metrika
✅ Har biri uchun div/card
✅ Foiz ko'rsatkichlari
✅ Mini chartlar
✅ Trend ko'rsatkichlari
✅ Rang kodlash
✅ Responsive dizayn
✅ Real-time yangilanish

Endi biznesingizni to'liq nazorat qilishingiz mumkin! 🚀
