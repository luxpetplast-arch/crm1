# 🚀 E2E Testlarni O'rnatish

## Qadamma-qadam

### 1. Playwright o'rnatish
```bash
npm install --save-dev @playwright/test@latest
```

### 2. Brauzerlarni o'rnatish
```bash
npx playwright install --with-deps
```

### 3. Serverni ishga tushirish (yangi terminal)
```bash
npm run dev
```

### 4. Testlarni ishga tushirish

#### UI Mode (Tavsiya!)
```bash
npm run test:e2e:ui
```

#### Oddiy rejim
```bash
npm run test:e2e
```

#### Brauzerda ko'rish
```bash
npm run test:e2e:headed
```

## ⚡ Tez O'rnatish (Windows)

```bash
npm install --save-dev @playwright/test@latest && npx playwright install --with-deps
```

Keyin:
```bash
npm run dev
```

Yangi terminalda:
```bash
npm run test:e2e:ui
```

## 🐛 Muammo Bo'lsa?

### Playwright topilmasa
```bash
npm install --save-dev @playwright/test@latest
```

### Brauzerlar topilmasa
```bash
npx playwright install chromium firefox webkit
```

### Port band bo'lsa
`.env` faylida portni o'zgartiring yoki:
```bash
PORT=5001 npm run dev
```

## ✅ Tayyor!

Endi barcha testlar ishlashi kerak:
- ✅ 14 ta test fayli
- ✅ 100+ test cases
- ✅ Cross-browser testing
- ✅ Mobile testing

---

**Muvaffaqiyatli testlar! 🎉**
