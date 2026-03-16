# Saytni To'liq Kirilchaga Tarjima Qilish - To'liq Qo'llanma

## 📦 1-Qadam: Kutubxonalarni O'rnatish

### Windows uchun:
```bash
install-i18n.bat
```

### Yoki qo'lda:
```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

## ✅ 2-Qadam: Tayyor Fayllar

Quyidagi fayllar allaqachon yaratilgan:

1. **src/i18n.ts** - Asosiy konfiguratsiya
2. **src/locales/uz.json** - O'zbekcha (Kiril) tarjimalar
3. **src/locales/ru.json** - Ruscha tarjimalar
4. **src/components/LanguageSwitcher.tsx** - Til almashtirish tugmasi
5. **src/App.tsx** - i18n import qilingan

## 🎯 3-Qadam: Komponentlarda Ishlatish

### Oddiy misol:
```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### Input placeholder:
```tsx
<input placeholder={t('auth.username')} />
```

### Dinamik matn:
```tsx
{t('products.totalProducts', { count: 100 })}
```

## 📝 4-Qadam: Mavjud Tarjimalar

### Umumiy so'zlar (common):
- `t('common.save')` → "Сақлаш"
- `t('common.cancel')` → "Бекор қилиш"
- `t('common.delete')` → "Ўчириш"
- `t('common.edit')` → "Таҳрирлаш"
- `t('common.add')` → "Қўшиш"
- `t('common.search')` → "Қидириш"

### Autentifikatsiya (auth):
- `t('auth.login')` → "Кириш"
- `t('auth.logout')` → "Чиқиш"
- `t('auth.username')` → "Фойдаланувчи номи"
- `t('auth.password')` → "Парол"

### Bosh sahifa (dashboard):
- `t('dashboard.title')` → "Бош саҳифа"
- `t('dashboard.totalSales')` → "Жами сотув"
- `t('dashboard.totalRevenue')` → "Жами даромад"

### Mahsulotlar (products):
- `t('products.title')` → "Маҳсулотлар"
- `t('products.addProduct')` → "Маҳсулот қўшиш"
- `t('products.productName')` → "Маҳсулот номи"
- `t('products.price')` → "Нарх"

### Sotuvlar (sales):
- `t('sales.title')` → "Сотувлар"
- `t('sales.newSale')` → "Янги сотув"
- `t('sales.customer')` → "Мижоз"

### Mijozlar (customers):
- `t('customers.title')` → "Мижозлар"
- `t('customers.addCustomer')` → "Мижоз қўшиш"
- `t('customers.phone')` → "Телефон"

### Buyurtmalar (orders):
- `t('orders.title')` → "Буюртмалар"
- `t('orders.status')` → "Ҳолат"
- `t('orders.pending')` → "Кутилмоқда"

### Kassa (cashbox):
- `t('cashbox.title')` → "Касса"
- `t('cashbox.balance')` → "Баланс"

### Hisobotlar (reports):
- `t('reports.title')` → "Ҳисоботлар"
- `t('reports.salesReport')` → "Сотув ҳисоботи"

### Sozlamalar (settings):
- `t('settings.title')` → "Созламалар"
- `t('settings.language')` → "Тил"

## 🔧 5-Qadam: Yangi Tarjima Qo'shish

### 1. src/locales/uz.json ga qo'shing:
```json
{
  "mySection": {
    "myText": "Менинг матним",
    "myButton": "Менинг тугмам"
  }
}
```

### 2. src/locales/ru.json ga qo'shing:
```json
{
  "mySection": {
    "myText": "Мой текст",
    "myButton": "Моя кнопка"
  }
}
```

### 3. Komponentda ishlating:
```tsx
{t('mySection.myText')}
```

## 🌐 6-Qadam: Til Almashtirish

Til almashtirish tugmasi `Layout` komponentida mavjud. Foydalanuvchi:
- **ЎЗ** tugmasini bosib o'zbekchaga
- **РУ** tugmasini bosib ruschaga o'tadi

Tanlangan til `localStorage` da saqlanadi va keyingi safar avtomatik yuklanadi.

## 🚀 7-Qadam: Serverni Ishga Tushirish

```bash
npm run dev
```

## 📋 Misol: Login Sahifasini Tarjima Qilish

### Eski kod:
```tsx
<h1>Login</h1>
<input placeholder="Username" />
<button>Login</button>
```

### Yangi kod:
```tsx
import { useTranslation } from 'react-i18next';

function Login() {
  const { t } = useTranslation();
  
  return (
    <>
      <h1>{t('auth.login')}</h1>
      <input placeholder={t('auth.username')} />
      <button>{t('auth.login')}</button>
    </>
  );
}
```

## 💡 Maslahatlar

1. **Barcha matnlarni tarjima qiling** - Hardcoded matnlar qolmasin
2. **Kalitlarni mantiqiy guruhlang** - Bo'limlarga ajrating
3. **Izohlar qo'shing** - Murakkab tarjimalar uchun
4. **Testdan o'tkazing** - Har ikki tilda tekshiring

## 🎨 Qo'shimcha Imkoniyatlar

### Pluralizatsiya:
```json
{
  "items": "{{count}} та элемент",
  "items_plural": "{{count}} та элемент"
}
```

### Interpolatsiya:
```tsx
t('welcome', { name: 'Алишер' })
// "Хуш келибсиз, Алишер!"
```

### Til o'zgartirish dasturiy:
```tsx
const { i18n } = useTranslation();
i18n.changeLanguage('ru');
```

## ✅ Tayyor!

Endi saytingiz to'liq kirilchada ishlaydi! Barcha sahifalarni bosqichma-bosqich tarjima qilishingiz mumkin.
