# 🌐 Til Almashtirish Tizimi Qo'shildi

**Sana:** 2026-03-18
**Maqsad:** Saytga to'liq til almashtirish (O'zbek ⇄ Rus) funksiyasini qo'shish

## ✅ Amalga Oshirilgan O'zgarishlar

### 1. 🎯 Til Konteksti (LanguageContext)

**Fayl:** `src/contexts/LanguageContext.tsx`

**Funksiyalar:**
```typescript
- language: 'uz' | 'ru' - Joriy til
- setLanguage(lang) - Tilni o'zgartirish
- t(key) - Tarjima olish
```

**Xususiyatlar:**
- ✅ LocalStorage da saqlanadi
- ✅ Sahifa yangilanishda saqlanib qoladi
- ✅ document.documentElement.lang avtomatik yangilanadi
- ✅ Nested keys qo'llab-quvvatlanadi (masalan: "common.save")

### 2. 🎨 Til Almashtirish Tugmasi

**Fayl:** `src/components/LanguageToggle.tsx`

**Dizayn:**
```css
- Gradient background (blue → purple)
- Globe icon
- Til kodi (O'Z / РУ)
- Hover effect: scale + shadow
- Tooltip: Til nomi
```

**Joylashuvi:**
1. Sidebar pastida (Desktop)
2. Header o'ng tarafida (Mobile va Desktop)

### 3. 📝 Tarjima Fayllari

**O'zbek tili:** `src/locales/uz.json`
**Rus tili:** `src/locales/ru.json`

**Mavjud tarjimalar:**
- ✅ common (umumiy so'zlar)
- ✅ auth (autentifikatsiya)
- ✅ dashboard (bosh sahifa)
- ✅ products (mahsulotlar)
- ✅ sales (sotuvlar)
- ✅ customers (mijozlar)
- ✅ orders (buyurtmalar)
- ✅ cashbox (kassa)
- ✅ reports (hisobotlar)
- ✅ settings (sozlamalar)

### 4. 🔧 Integratsiya

**App.tsx:**
```typescript
<LanguageProvider>
  <BrowserRouter>
    <Layout>
      <Routes>...</Routes>
    </Layout>
  </BrowserRouter>
</LanguageProvider>
```

**Layout.tsx:**
```typescript
import LanguageToggle from './LanguageToggle';

// Sidebar pastida
<div className="p-4 border-t border-border space-y-2">
  <div className="px-4 py-2">
    <LanguageToggle />
  </div>
  ...
</div>

// Header o'ng tarafida
<div className="flex items-center gap-4">
  <LanguageToggle />
  <NotificationCenter />
  ...
</div>
```

## 🎯 Foydalanish

### Komponentda:

```typescript
import { useLanguage } from '../contexts/LanguageContext';

function MyComponent() {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button onClick={() => setLanguage('uz')}>O'zbek</button>
      <button onClick={() => setLanguage('ru')}>Русский</button>
    </div>
  );
}
```

### Tarjima qo'shish:

**uz.json:**
```json
{
  "mySection": {
    "title": "Mening Bo'limim",
    "description": "Bu tavsif"
  }
}
```

**ru.json:**
```json
{
  "mySection": {
    "title": "Мой Раздел",
    "description": "Это описание"
  }
}
```

**Komponentda:**
```typescript
<h1>{t('mySection.title')}</h1>
<p>{t('mySection.description')}</p>
```

## 📱 Responsive Dizayn

### Desktop (> 1024px):
- Sidebar pastida to'liq ko'rinadi
- Header o'ng tarafida ham mavjud

### Mobile (< 1024px):
- Sidebar yopiq
- Header o'ng tarafida ko'rinadi
- Touch-friendly (44px minimum)

## 🎨 Vizual Ko'rinish

### Til Tugmasi:
```
┌─────────────────┐
│ 🌐 O'Z          │  ← O'zbek tilida
└─────────────────┘

┌─────────────────┐
│ 🌐 РУ           │  ← Rus tilida
└─────────────────┘
```

### Hover Effect:
- Scale: 1.05
- Shadow: lg
- Transition: 200ms

## 🔄 Til O'zgarishi Jarayoni

1. Foydalanuvchi tugmani bosadi
2. `setLanguage()` chaqiriladi
3. LocalStorage yangilanadi
4. Context yangilanadi
5. Barcha komponentlar avtomatik qayta render qilinadi
6. Yangi til ko'rsatiladi

## 📊 Qo'llab-quvvatlanadigan Tillar

| Til | Kod | Bayroq | Status |
|-----|-----|--------|--------|
| O'zbek | uz | 🇺🇿 | ✅ Tayyor |
| Rus | ru | 🇷🇺 | ✅ Tayyor |

## 🚀 Keyingi Qadamlar

1. ✅ Til almashtirish tizimi yaratildi
2. ✅ Sidebar va Header ga qo'shildi
3. ⏳ Barcha sahifalarni tarjima qilish
4. ⏳ Ingliz tilini qo'shish
5. ⏳ Avtomatik til aniqlash (browser tilidan)

## 📝 Tarjima Qilish Kerak Bo'lgan Sahifalar

### Yuqori Prioritet:
- [ ] Dashboard
- [ ] Products
- [ ] Sales
- [ ] Customers
- [ ] Orders
- [ ] Cashbox

### O'rta Prioritet:
- [ ] Reports
- [ ] Settings
- [ ] Analytics
- [ ] Logistics

### Past Prioritet:
- [ ] AI Manager
- [ ] Super Manager
- [ ] Bot Management
- [ ] Audit Log

## 🎓 Qo'llanma

### Yangi Tarjima Qo'shish:

1. `src/locales/uz.json` ga qo'shing:
```json
{
  "newFeature": {
    "title": "Yangi Funksiya",
    "button": "Bosing"
  }
}
```

2. `src/locales/ru.json` ga qo'shing:
```json
{
  "newFeature": {
    "title": "Новая Функция",
    "button": "Нажмите"
  }
}
```

3. Komponentda ishlating:
```typescript
const { t } = useLanguage();
<h1>{t('newFeature.title')}</h1>
<button>{t('newFeature.button')}</button>
```

## 🐛 Muammolarni Hal Qilish

### Tarjima ko'rinmayapti:
1. Tarjima fayllarda mavjudligini tekshiring
2. Key to'g'ri yozilganligini tekshiring
3. Browser console da xatolarni tekshiring

### Til saqlanmayapti:
1. LocalStorage ishlab turganligini tekshiring
2. Browser console da `localStorage.getItem('language')` ni tekshiring

### Komponent yangilanmayapti:
1. `useLanguage()` hook ishlatilganligini tekshiring
2. LanguageProvider ichida ekanligini tekshiring

## 📞 Qo'llab-quvvatlash

Agar savollar bo'lsa:
- Telegram: @support
- Email: support@luxpetplast.uz
- Tel: +998 90 123 45 67

---

**Yaratildi:** 2026-03-18
**Versiya:** 1.0
**Status:** ✅ Tayyor
