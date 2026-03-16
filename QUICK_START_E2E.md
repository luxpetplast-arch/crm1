# ⚡ E2E Tests - Quick Start

## 3 Qadamda Boshlash

### 1️⃣ O'rnatish (bir marta)
```bash
npm install
npm run playwright:install
```

### 2️⃣ Serverni ishga tushirish
```bash
npm run dev
```

### 3️⃣ Testlarni ishga tushirish
```bash
# Eng yaxshi variant - UI mode
npm run test:e2e:ui

# Yoki oddiy rejimda
npm run test:e2e
```

## 🎯 Tez Buyruqlar

```bash
# UI mode (interaktiv, eng yaxshi!)
npm run test:e2e:ui

# Brauzerda ko'rish
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# Faqat Chrome
npm run test:e2e:chromium

# Mobile testlar
npm run test:e2e:mobile

# Hisobotni ko'rish
npm run test:e2e:report
```

## 📁 Nima Test Qilinadi?

✅ Login va autentifikatsiya
✅ Dashboard
✅ Mahsulotlar (CRUD)
✅ Sotuvlar
✅ Mijozlar
✅ Buyurtmalar
✅ Kassa
✅ Analytics
✅ Responsive dizayn
✅ Performance
✅ Accessibility
✅ Error handling

## 🎨 UI Mode (Tavsiya!)

```bash
npm run test:e2e:ui
```

Bu sizga:
- Har bir testni ko'rish
- Step-by-step debug qilish
- Screenshot va videolarni ko'rish
- Real-time natijalar

## 📊 Hisobot

Test tugagandan keyin:
```bash
npm run test:e2e:report
```

Yoki avtomatik ochiladi: `playwright-report/index.html`

## 🐛 Muammo Bo'lsa?

1. Serverni tekshiring: `http://localhost:5000`
2. Brauzerlarni qayta o'rnating: `npm run playwright:install`
3. Hisobotni ko'ring: `npm run test:e2e:report`

## 📚 To'liq Qo'llanma

Batafsil ma'lumot uchun:
- `E2E_TEST_GUIDE.md` - To'liq qo'llanma
- `E2E_PROFESSIONAL_SETUP.md` - Professional setup

---

**Muvaffaqiyatli testlar! 🚀**
