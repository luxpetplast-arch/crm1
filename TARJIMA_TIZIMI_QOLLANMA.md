# Saytni To'liq Kirilchaga Tarjima Qilish

## 1. Kutubxonalarni O'rnatish

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

## 2. Tarjima Fayllari Yaratish

`src/locales/uz.json` - O'zbekcha (Kiril)
`src/locales/ru.json` - Ruscha
`src/locales/en.json` - Inglizcha (ixtiyoriy)

## 3. i18n Konfiguratsiyasi

`src/i18n.ts` faylida sozlamalar

## 4. Komponentlarda Ishlatish

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button onClick={() => i18n.changeLanguage('uz')}>
        O'zbekcha
      </button>
    </div>
  );
}
```

## 5. Til Almashtirish Komponenti

`LanguageSwitcher` komponenti orqali foydalanuvchi tilni o'zgartirishi mumkin.
