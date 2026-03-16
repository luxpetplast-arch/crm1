# Changelog

## [2.0.0] - 2024-02-21

### 🎉 Katta Yangilanishlar

#### 🧠 AI Tahlil Tizimi Kuchaytirildi
- ✅ 15+ kengaytirilgan metrika (CLV, ROI, Churn Rate, va boshqalar)
- ✅ Mijozlar segmentatsiyasi (VIP, Sodiq, Oddiy, Xavf ostida, Nofaol)
- ✅ Anomaliyalar aniqlash (daromad sakrashi/pasayishi)
- ✅ Xavf baholash (Moliyaviy, Mijozlar, Operatsion, Bozor)
- ✅ Strategik tavsiyalar (O'sish, Retention, Samaradorlik, Narx, Xavf)
- ✅ Mahsulot tavsiyalari (Optimize, Improve, Expand)
- ✅ AI ishonch darajasi (0-100%)
- ✅ Vizual tahlil (Pie, Line, Area, Bar charts)

#### 📦 Ombor Dona Boshqaruvi
- ✅ Dona darajasida hisobni yuritish
- ✅ Dona qo'shish/kamaytirish funksiyasi
- ✅ Qop qo'shish/kamaytirish funksiyasi
- ✅ Avtomatik qop ↔ dona konvertatsiya
- ✅ To'liq harakat tarixi (kim, qachon, nima, nega)
- ✅ Sabab va izoh qo'shish
- ✅ Oldingi va yangi qiymatlarni ko'rish
- ✅ Mahsulot tafsilotlari sahifasi

#### ⏰ Vaqt va Tarix Tizimi
- ✅ Aniq vaqt formatlari (5 xil)
- ✅ Nisbiy vaqt ("5 daqiqa oldin")
- ✅ Aqlli format ("Bugun, 14:30:45")
- ✅ To'liq format ("21 Fevral 2024, Chorshanba")
- ✅ O'zbek tilida lokalizatsiya
- ✅ TimeStamp komponentlari (TimeOnly, RelativeTime, DetailedTime)
- ✅ Barcha sahifalarda izchil vaqt ko'rsatish

### Yangi Fayllar
- `server/utils/advanced-analytics.ts` - AI funksiyalari
- `src/lib/dateUtils.ts` - Vaqt utility funksiyalari
- `src/components/TimeStamp.tsx` - Vaqt komponentlari
- `src/components/AdvancedMetricsCard.tsx`
- `src/components/CustomerSegmentsChart.tsx`
- `src/components/StrategicRecommendations.tsx`
- `src/components/RiskAssessment.tsx`
- `src/components/AnomaliesDetection.tsx`
- `src/pages/ProductDetail.tsx` - Mahsulot tafsilotlari

### Yangilangan Fayllar
- `server/routes/analytics.ts` - Kengaytirilgan AI tahlil
- `server/routes/products.ts` - Dona boshqaruvi API
- `src/pages/Analytics.tsx` - Yangi AI komponentlar
- `src/pages/Products.tsx` - Tafsilotlarga o'tish
- `src/pages/AuditLog.tsx` - Aniq vaqt ko'rsatish
- `src/pages/Notifications.tsx` - Vaqt formatlari
- `src/App.tsx` - Yangi route
- `prisma/schema.prisma` - Yangi modellar

### Hujjatlar
- ✅ `AI_ANALYTICS_YANGILANGAN.md` - AI tahlil qo'llanma
- ✅ `OMBOR_DONA_QOLLANMA.md` - Ombor qo'llanma
- ✅ `VAQT_TARIX_TIZIMI.md` - Vaqt tizimi qo'llanma
- ✅ `YANGILANISHLAR_XULOSA.md` - Umumiy xulosa
- ✅ `AI_UPGRADE_SUMMARY.md` - AI yangilanish xulosa

### Performance
- ⚡ Optimallashtirilgan database queries
- ⚡ Komponentlar qayta foydalanish
- ⚡ Lazy loading
- ⚡ Memoization

### Bug Fixes
- 🐛 Vaqt zonasi muammolari hal qilindi
- 🐛 Dona hisoblash xatoliklari tuzatildi
- 🐛 UI responsiveness yaxshilandi

---

## [1.0.0] - 2024-02-20

### Qo'shilgan
- ✅ To'liq autentifikatsiya va avtorizatsiya tizimi
- ✅ Qop asosida ombor boshqaruvi
- ✅ Ko'p mahsulotli sotuv tizimi
- ✅ Ko'p valyutali kassa va xarajatlar
- ✅ AI asosida prognoz moduli
- ✅ CRM (Mijozlar boshqaruvi)
- ✅ Telegram integratsiya strukturasi
- ✅ Rollar va ruxsatlar (RBAC)
- ✅ Dashboard real vaqt statistika bilan
- ✅ Hisobotlar va CSV eksport
- ✅ Qorong'u/Yorug' rejim
- ✅ Responsive dizayn
- ✅ Foydalanuvchilar boshqaruvi
- ✅ Bildirishnomalar markazi
- ✅ Audit log tizimi
- ✅ Docker qo'llab-quvvatlash
- ✅ Rate limiting
- ✅ Error handling
- ✅ Input validation (Zod)
- ✅ Professional UI komponentlar
- ✅ O'zbek tili qo'llab-quvvatlash

### Texnik
- React 18 + TypeScript
- Node.js + Express
- PostgreSQL + Prisma ORM
- Tailwind CSS
- Zustand (state management)
- JWT autentifikatsiya
- Bcrypt parol shifrlash

### API Endpoints
- `/api/auth` - Autentifikatsiya
- `/api/products` - Mahsulotlar
- `/api/sales` - Sotuvlar
- `/api/customers` - Mijozlar
- `/api/expenses` - Xarajatlar
- `/api/dashboard` - Dashboard statistika
- `/api/forecast` - Prognoz
- `/api/reports` - Hisobotlar
- `/api/users` - Foydalanuvchilar (Admin)
- `/api/audit-logs` - Audit loglar (Admin)

## [Keyingi Versiyalar]

### [1.1.0] - Rejalashtirilgan
- [ ] Telegram bot to'liq integratsiyasi
- [ ] Mijoz kabineti
- [ ] Email bildirishnomalar
- [ ] PDF fakturalar
- [ ] Excel eksport

### [1.2.0] - Rejalashtirilgan
- [ ] Ko'p filial qo'llab-quvvatlash
- [ ] Kengaytirilgan hisobotlar
- [ ] Grafik tahlillar
- [ ] Backup va restore

### [2.0.0] - Rejalashtirilgan
- [ ] Mobil ilova (React Native)
- [ ] Shtrix-kod skanerlash
- [ ] Offline rejim
- [ ] Ishlab chiqarish rejalashtirish moduli
