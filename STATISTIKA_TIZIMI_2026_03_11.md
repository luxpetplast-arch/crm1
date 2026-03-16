# STATISTIKA VA HISOBOTLAR TIZIMI - 2026-03-11

## YARATILGAN YANGI BO'LIM

Keng qamrovli statistika va analitika bo'limi yaratildi. Bu bo'limda barcha ma'lumotlar, hisobotlar, chartlar va aniq hisob-kitoblar mavjud.

## ASOSIY FUNKSIYALAR

### 1. UMUMIY KO'RINISH (Overview)

**Asosiy Metrikalar:**
- 💰 Jami Daromad (o'sish foizi bilan)
- 📈 Sof Foyda (o'sish foizi bilan)
- 🛒 Jami Sotuvlar (dona va buyurtmalar soni)
- 👥 Jami Mijozlar (faol va yangi mijozlar)

**Qo'shimcha Ko'rsatkichlar:**
- 🎯 O'rtacha Sotuv
- 🏆 Eng Yaxshi Kun
- ⚡ Konversiya Sur'ati

**Chartlar:**
- Daromad va Foyda Trendi (Area Chart)
- Kunlik statistika

### 2. SOTUVLAR TAHLILI (Sales)

**Statistika:**
- ✅ Yakunlangan sotuvlar
- ⏳ Kutilayotgan buyurtmalar
- ❌ Bekor qilingan buyurtmalar
- 📊 Muvaffaqiyat foizi

**Chartlar:**
- Soatlik Sotuvlar Taqsimoti (Bar Chart)
- Haftalik Sotuvlar (Bar Chart)
- Kunlik trend

### 3. MAHSULOTLAR TAHLILI (Products)

**Top Mahsulotlar:**
- 🥇 Eng ko'p sotiladigan mahsulotlar (Top 10)
- Har bir mahsulot uchun:
  - Daromad
  - Sotilgan miqdor
  - Sotuvlar soni
  - O'sish foizi
  - Ulush foizi

**Tez Ketayotgan Mahsulotlar:**
- ⚡ Kunlik tezlik (dona/kun)
- Jami sotilgan miqdor
- Ombordagi qoldiq

**Sekin Ketayotgan Mahsulotlar:**
- ⚠️ Past tezlikdagi mahsulotlar
- Omborda ko'p qolgan mahsulotlar
- Tavsiyalar

**Chartlar:**
- Mahsulotlar bo'yicha daromad (Pie Chart)
- Mahsulotlar taqsimoti

### 4. MIJOZLAR TAHLILI (Customers)

**Statistika:**
- 👥 Jami mijozlar
- ✅ Faol mijozlar
- 🆕 Yangi mijozlar
- 👑 VIP mijozlar

**Top Mijozlar:**
- Eng ko'p xarid qilgan mijozlar (Top 10)
- Har bir mijoz uchun:
  - Jami xarid summasi
  - Xaridlar soni
  - Qarz holati
  - Telefon raqami

**Mijozlar Segmentatsiyasi:**
- 👑 VIP mijozlar (10,000+ USD)
- 💎 Doimiy mijozlar (1,000-10,000 USD)
- 🌟 Yangi mijozlar (1-2 xarid)

**Chartlar:**
- Mijozlar Segmentlari (Pie Chart)
- Mijozlar Faolligi (Bar Chart)

### 5. MOLIYAVIY TAHLIL (Financial)

**Asosiy Ko'rsatkichlar:**
- 💰 Jami Daromad
- 📉 Jami Xarajatlar
- 📈 Sof Foyda

**Moliyaviy Metrikalar:**
- 📊 Foyda Marjasi (%)
- 💹 ROI (Return on Investment)
- 📈 O'sish Sur'ati (%)
- 💳 Jami Qarzlar

**Chartlar:**
- Moliyaviy Trend (Line Chart)
- Xarajatlar Kategoriyalari (Pie Chart)

## VAQT ORALIG'I

Statistikani turli vaqt oralig'ida ko'rish mumkin:
- 📅 Oxirgi 7 kun
- 📅 Oxirgi 30 kun
- 📅 Oxirgi 90 kun
- 📅 Oxirgi 6 oy
- 📅 Oxirgi 1 yil

## EXPORT FUNKSIYASI

- 📥 PDF formatda yuklab olish
- 📥 Excel formatda yuklab olish (kelajakda)
- 📥 Barcha ma'lumotlarni export qilish

## YARATILGAN FAYLLAR

### Frontend:
1. **src/pages/Statistics.tsx** - Asosiy statistika sahifasi
   - 5 ta tab (Overview, Sales, Products, Customers, Financial)
   - Responsive dizayn
   - Interaktiv chartlar
   - Real-time ma'lumotlar

### Backend:
2. **server/routes/statistics.ts** - Statistika API
   - `/api/statistics/comprehensive` - To'liq statistika
   - `/api/statistics/export` - Export funksiyasi
   - Barcha hisob-kitoblar
   - Optimizatsiya qilingan query'lar

### Konfiguratsiya:
3. **server/index.ts** - Statistics route qo'shildi
4. **src/App.tsx** - Statistics sahifasi qo'shildi
5. **src/components/Layout.tsx** - Menyu qo'shildi

## TEXNIK TAFSILOTLAR

### Chartlar:
- **Recharts** kutubxonasi ishlatilgan
- Area Chart - Daromad trendi
- Bar Chart - Sotuvlar taqsimoti
- Pie Chart - Kategoriyalar
- Line Chart - Moliyaviy trend

### Ma'lumotlar:
- Real-time database query'lar
- Optimizatsiya qilingan hisob-kitoblar
- Oldingi davr bilan taqqoslash
- O'sish foizlari
- Trendlar tahlili

### Dizayn:
- Gradient backgrounds
- Color-coded metrikalar
- Responsive layout
- Dark mode support
- Interaktiv elementlar

## FOYDALANISH

### 1. Sahifaga kirish:
```
http://localhost:3000/statistics
```

### 2. Menyu:
Chap tarafdagi menyudan "Statistika" tugmasini bosing

### 3. Tab'lar:
- **Umumiy** - Asosiy ko'rinish
- **Sotuvlar** - Sotuvlar tahlili
- **Mahsulotlar** - Mahsulotlar tahlili
- **Mijozlar** - Mijozlar tahlili
- **Moliyaviy** - Moliyaviy tahlil

### 4. Vaqt oralig'i:
Yuqori o'ng burchakdagi dropdown'dan vaqt oralig'ini tanlang

### 5. Export:
"Export" tugmasini bosib, hisobotni yuklab oling

## HISOB-KITOBLAR

### Daromad O'sishi:
```
revenueGrowth = ((currentRevenue - prevRevenue) / prevRevenue) * 100
```

### Foyda Marjasi:
```
profitMargin = (netProfit / totalRevenue) * 100
```

### ROI:
```
roi = (netProfit / totalExpenses) * 100
```

### Konversiya:
```
conversionRate = (activeCustomers / totalCustomers) * 100
```

### Mahsulot Tezligi:
```
velocity = totalQuantity / days
```

### Muvaffaqiyat Foizi:
```
successRate = (completedSales / (completedSales + cancelledOrders)) * 100
```

## KELAJAK REJALAR

### Qo'shimcha Funksiyalar:
- [ ] PDF export to'liq implementatsiya
- [ ] Excel export qo'shish
- [ ] Email orqali hisobot yuborish
- [ ] Avtomatik hisobotlar (kunlik, haftalik, oylik)
- [ ] Prognoz va bashorat
- [ ] AI tavsiyalari
- [ ] Real-time yangilanishlar
- [ ] Filtrlash va qidiruv
- [ ] Custom date range
- [ ] Taqqoslash funksiyasi

### Chartlar:
- [ ] Heatmap
- [ ] Scatter plot
- [ ] Radar chart
- [ ] Funnel chart
- [ ] Gantt chart

### Hisobotlar:
- [ ] Mahsulot rentabelligi
- [ ] Mijoz lifetime value
- [ ] Churn rate
- [ ] Cohort analysis
- [ ] ABC tahlil
- [ ] Pareto tahlil

## XULOSA

✅ To'liq statistika tizimi yaratildi
✅ 5 ta asosiy bo'lim (Overview, Sales, Products, Customers, Financial)
✅ Interaktiv chartlar va grafiklar
✅ Real-time ma'lumotlar
✅ Responsive dizayn
✅ Export funksiyasi
✅ Vaqt oralig'i tanlash
✅ Aniq hisob-kitoblar
✅ Tez ketayotgan mahsulotlar
✅ Top mijozlar va mahsulotlar
✅ Moliyaviy tahlil

Endi biznesingizning barcha statistikasini bir joyda ko'rishingiz mumkin!
