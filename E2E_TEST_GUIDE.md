# 🎭 E2E Test Suite - To'liq Qo'llanma

## 📋 Umumiy Ma'lumot

Bu professional darajadagi End-to-End (E2E) test suite Playwright yordamida yozilgan. Barcha frontend funksiyalarini real brauzerda test qiladi.

## 🚀 O'rnatish

### 1. Playwright o'rnatish
```bash
npm install
npm run playwright:install
```

### 2. Serverni ishga tushirish
```bash
npm run dev
```

## 🧪 Testlarni Ishga Tushirish

### Barcha testlar
```bash
npm run test:e2e
```

### UI mode (interaktiv)
```bash
npm run test:e2e:ui
```

### Brauzer ko'rinishida
```bash
npm run test:e2e:headed
```

### Debug mode
```bash
npm run test:e2e:debug
```

### Faqat bitta brauzer
```bash
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
```

### Mobile testlar
```bash
npm run test:e2e:mobile
```

### Hisobotni ko'rish
```bash
npm run test:e2e:report
```

## 📁 Test Fayllari

### 01-login.spec.ts
- Login sahifasi
- Autentifikatsiya
- Session management
- Xato xabarlari

### 02-dashboard.spec.ts
- Dashboard widgetlari
- Navigatsiya
- Grafiklar
- Responsive dizayn

### 03-products.spec.ts
- Mahsulotlar ro'yxati
- CRUD operatsiyalar
- Qidiruv va filter
- Pagination

### 04-sales.spec.ts
- Sotuv yaratish
- Sana bo'yicha filter
- Export funksiyasi
- Hisob-kitoblar

### 05-customers.spec.ts
- Mijozlar boshqaruvi
- Rang tizimi
- Profil ko'rish
- Xarid tarixi

### 06-orders.spec.ts
- Buyurtmalar
- Status o'zgartirish
- Haydovchi tayinlash
- Timeline tracking

### 07-cashbox.spec.ts
- Kassa operatsiyalari
- Kirim/Chiqim
- Balans
- AI tahlil

### 08-analytics.spec.ts
- Tahlil va hisobotlar
- Grafiklar
- AI tavsiyalar
- Export

### 09-responsive.spec.ts
- Mobile responsive
- Tablet responsive
- Desktop responsive
- Orientation change

### 10-performance.spec.ts
- Yuklanish tezligi
- Core Web Vitals
- Memory leaks
- Large data handling

### 11-accessibility.spec.ts
- Keyboard navigation
- Screen reader support
- ARIA labels
- Color contrast

### 12-integration.spec.ts
- Frontend-Backend integration
- API error handling
- Loading states
- Real-time updates

### 13-visual-regression.spec.ts
- Screenshot testing
- Visual changes detection
- Cross-browser consistency

### 14-edge-cases.spec.ts
- Empty data
- Special characters
- Session expiration
- Error scenarios

## 📊 Test Coverage

### Funksional Testlar
- ✅ Login va autentifikatsiya
- ✅ CRUD operatsiyalar
- ✅ Qidiruv va filtrlash
- ✅ Pagination
- ✅ Form validation
- ✅ Modal windows
- ✅ Navigation
- ✅ Data export

### UI/UX Testlar
- ✅ Responsive dizayn (Mobile, Tablet, Desktop)
- ✅ Loading states
- ✅ Error messages
- ✅ Success notifications
- ✅ Empty states

### Performance Testlar
- ✅ Page load time
- ✅ API response time
- ✅ Memory usage
- ✅ Large data handling

### Accessibility Testlar
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ ARIA labels
- ✅ Form labels
- ✅ Color contrast

### Integration Testlar
- ✅ API error handling
- ✅ Network offline
- ✅ Session management
- ✅ Real-time updates

## 🎯 Best Practices

### 1. Test Isolation
Har bir test mustaqil ishlaydi va boshqa testlarga ta'sir qilmaydi.

### 2. Reliable Selectors
Text-based va semantic selectorlar ishlatilgan.

### 3. Wait Strategies
Proper wait strategiyalari (networkidle, visible, etc.)

### 4. Error Handling
Barcha edge case'lar va xatolar handle qilingan.

### 5. Cross-Browser
Chrome, Firefox, Safari, Mobile brauzerlar.

## 🐛 Debug Qilish

### 1. UI Mode
```bash
npm run test:e2e:ui
```
Interaktiv interfeys, har bir stepni ko'rish mumkin.

### 2. Debug Mode
```bash
npm run test:e2e:debug
```
Playwright Inspector ochiladi.

### 3. Headed Mode
```bash
npm run test:e2e:headed
```
Brauzer ko'rinishida test ishlaydi.

### 4. Screenshot va Video
Test fail bo'lganda avtomatik screenshot va video saqlanadi:
- `test-results/` papkada

## 📈 CI/CD Integration

### GitHub Actions
```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e

- name: Upload test results
  uses: actions/upload-artifact@v3
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## 🔧 Konfiguratsiya

`playwright.config.ts` faylida:
- Timeout settings
- Retry logic
- Screenshot/video settings
- Browser configurations
- Base URL

## 📝 Yangi Test Qo'shish

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should do something', async ({ page }) => {
    await page.goto('/my-page');
    
    // Your test logic
    await expect(page.locator('text=Something')).toBeVisible();
  });
});
```

## 🎨 Visual Regression

Screenshot testlarni yangilash:
```bash
npm run test:e2e -- --update-snapshots
```

## 📞 Yordam

Muammo bo'lsa:
1. `playwright-report/index.html` ni oching
2. Failed testlarni ko'ring
3. Screenshot va videolarni tekshiring
4. Trace fayllarni ko'ring

## 🚀 Production Testing

Production muhitda test qilish:
```bash
BASE_URL=https://your-production-url.com npm run test:e2e
```

## ⚡ Tez Test

Faqat muhim testlar:
```bash
npx playwright test --grep @smoke
```

Test faylda:
```typescript
test('critical feature @smoke', async ({ page }) => {
  // Test logic
});
```

## 📊 Hisobot

HTML hisobot:
```bash
npm run test:e2e:report
```

JSON hisobot:
- `test-results.json` faylida

## 🎯 Keyingi Qadamlar

1. ✅ Playwright o'rnatish
2. ✅ Serverni ishga tushirish
3. ✅ Testlarni ishga tushirish
4. ✅ Hisobotni ko'rish
5. ✅ CI/CD ga qo'shish

---

**Muvaffaqiyatli testlar! 🎉**
