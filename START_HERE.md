# 🎭 E2E Tests - BOSHLASH UCHUN

## ⚡ 3 Qadamda Ishga Tushirish

### 1️⃣ Playwright O'rnatish
```bash
npm install --save-dev @playwright/test@latest
npx playwright install --with-deps
```

**Yoki Windows uchun:**
```bash
setup-e2e.bat
```

**Yoki Linux/Mac uchun:**
```bash
chmod +x setup-e2e.sh
./setup-e2e.sh
```

### 2️⃣ Serverni Ishga Tushirish (yangi terminal)
```bash
npm run dev
```

### 3️⃣ Testlarni Ishga Tushirish
```bash
npm run test:e2e:ui
```

## 📋 Barcha Buyruqlar

```bash
# O'rnatish
npm install --save-dev @playwright/test@latest
npx playwright install --with-deps

# Testlar
npm run test:e2e              # Barcha testlar
npm run test:e2e:ui           # UI mode (eng yaxshi!)
npm run test:e2e:headed       # Brauzerda ko'rish
npm run test:e2e:debug        # Debug mode
npm run test:e2e:chromium     # Faqat Chrome
npm run test:e2e:mobile       # Mobile testlar
npm run test:e2e:report       # Hisobotni ko'rish
```

## ✅ Nima Test Qilinadi?

- ✅ Login va autentifikatsiya
- ✅ Dashboard
- ✅ Mahsulotlar (CRUD)
- ✅ Sotuvlar
- ✅ Mijozlar
- ✅ Buyurtmalar
- ✅ Kassa
- ✅ Analytics
- ✅ Responsive dizayn
- ✅ Performance
- ✅ Accessibility
- ✅ Error handling

## 📚 Qo'shimcha Ma'lumot

- `INSTALL_E2E.md` - O'rnatish qo'llanmasi
- `QUICK_START_E2E.md` - Tez boshlash
- `E2E_TEST_GUIDE.md` - To'liq qo'llanma
- `E2E_PROFESSIONAL_SETUP.md` - Professional setup

## 🐛 Muammo Bo'lsa?

### Playwright topilmasa
```bash
npm install --save-dev @playwright/test@latest
```

### Brauzerlar topilmasa
```bash
npx playwright install --with-deps
```

### Port band bo'lsa
```bash
PORT=5001 npm run dev
```

## 🎯 Tavsiya

Eng yaxshi tajriba uchun UI mode ishlatiladi:
```bash
npm run test:e2e:ui
```

Bu sizga:
- ✅ Har bir testni ko'rish
- ✅ Step-by-step debug
- ✅ Screenshot va videolar
- ✅ Real-time natijalar

---

**Muvaffaqiyatli testlar! 🚀**
