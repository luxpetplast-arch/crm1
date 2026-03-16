# ⚡ Tezkor E2E Test Boshlash

## 🚀 3 Qadamda Test Qilish

### 1️⃣ Server Ishga Tushirish
Yangi terminal oching va quyidagi buyruqni bajaring:
```bash
npm run dev
```

Server manzili: **http://localhost:3000**

### 2️⃣ Testlarni Ishga Tushirish
Ushbu terminalda quyidagi buyruqlardan birini bajaring:

#### A) Barcha Testlar (Tavsiya)
```bash
npx playwright test --project=chromium
```

#### B) UI Mode (Interaktiv - Eng Yaxshi!)
```bash
npx playwright test --ui
```

#### C) Headed Mode (Brauzer Ko'rinadi)
```bash
npx playwright test --headed --project=chromium
```

#### D) Bitta Test Fayl
```bash
npx playwright test e2e/01-login.spec.ts --project=chromium
```

### 3️⃣ Natijalarni Ko'rish
Test tugagandan keyin:
```bash
npx playwright show-report
```

---

## 📊 Test Modullari

| # | Modul | Test Soni | Tavsif |
|---|-------|-----------|--------|
| 01 | Login | 5 | Autentifikatsiya |
| 02 | Dashboard | 8 | Asosiy sahifa |
| 03 | Products | 8 | Mahsulotlar |
| 04 | Sales | 7 | Sotuvlar |
| 05 | Customers | 8 | Mijozlar |
| 06 | Orders | 7 | Buyurtmalar |
| 07 | Cashbox | 8 | Kassa |
| 08 | Analytics | 8 | Tahlil |
| 09 | Responsive | 21+ | Responsive |
| 10 | Performance | 5 | Tezlik |
| 11 | Accessibility | 7 | Accessibility |
| 12 | Integration | 5 | Integratsiya |
| 13 | Visual | 7 | Vizual |
| 14 | Edge Cases | 8 | Xatolar |

**JAMI: 100+ test**

---

## 🎯 Tezkor Testlar

### Faqat Login
```bash
npx playwright test e2e/01-login.spec.ts --project=chromium
```

### Faqat Dashboard
```bash
npx playwright test e2e/02-dashboard.spec.ts --project=chromium
```

### Faqat CRUD (Products, Sales, Customers)
```bash
npx playwright test e2e/03-products.spec.ts e2e/04-sales.spec.ts e2e/05-customers.spec.ts --project=chromium
```

### Faqat Responsive
```bash
npx playwright test e2e/09-responsive.spec.ts --project=chromium
```

---

## 🐛 Debug Mode

Agar test muvaffaqiyatsiz bo'lsa:

### 1. Debug Mode
```bash
npx playwright test e2e/01-login.spec.ts --debug
```

### 2. Headed Mode
```bash
npx playwright test e2e/01-login.spec.ts --headed --project=chromium
```

### 3. Trace Ko'rish
```bash
npx playwright show-trace test-results/trace.zip
```

---

## ✅ Checklist

- [ ] Server ishlamoqda (http://localhost:3000)
- [ ] Database sozlangan (`npm run db:push`)
- [ ] Playwright o'rnatilgan (`npx playwright --version`)
- [ ] Test buyrug'i bajarildi
- [ ] Natijalar ko'rildi

---

## 💡 Maslahatlar

1. **UI Mode** - Eng yaxshi debugging uchun
2. **Headed Mode** - Brauzerda ko'rish uchun
3. **Debug Mode** - Step-by-step debugging uchun
4. **Report** - Batafsil natijalar uchun

---

## 🎬 Boshlash

```bash
# Terminal 1: Server
npm run dev

# Terminal 2: Tests
npx playwright test --ui
```

**Omad! 🚀**
