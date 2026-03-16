# Tarjima Tizimi - Misol

## Komponentda Ishlatish

```tsx
import { useTranslation } from 'react-i18next';

function LoginPage() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('auth.login')}</h1>
      <input placeholder={t('auth.username')} />
      <input type="password" placeholder={t('auth.password')} />
      <button>{t('auth.login')}</button>
    </div>
  );
}
```

## O'rnatish Buyruqlari

```bash
# Kutubxonalarni o'rnatish
npm install i18next react-i18next i18next-browser-languagedetector

# Serverni qayta ishga tushirish
npm run dev
```

## Tarjima Kalitlari

Barcha tarjimalar `src/locales/uz.json` va `src/locales/ru.json` fayllarida.

### Asosiy Bo'limlar:
- `common.*` - Umumiy so'zlar (saqlash, bekor qilish, va h.k.)
- `auth.*` - Autentifikatsiya
- `dashboard.*` - Bosh sahifa
- `products.*` - Mahsulotlar
- `sales.*` - Sotuvlar
- `customers.*` - Mijozlar
- `orders.*` - Buyurtmalar
- `cashbox.*` - Kassa
- `reports.*` - Hisobotlar
- `settings.*` - Sozlamalar

## Yangi Tarjima Qo'shish

1. `src/locales/uz.json` ga kalit qo'shing:
```json
{
  "mySection": {
    "myKey": "Менинг матним"
  }
}
```

2. Komponentda ishlating:
```tsx
{t('mySection.myKey')}
```

## Til Almashtirish

`LanguageSwitcher` komponenti Layout da mavjud. Foydalanuvchi tugmani bosib tilni o'zgartiradi.
