# Kiro Hooks - O'rnatilgan Hooklarni Boshqarish

## O'rnatilgan Hooklar:

### 1. **Auto Format on Save** (`auto-format-on-save.json`)
- **Nima qiladi:** JS/TS/CSS/HTML fayllarni saqlaganingizda avtomatik formatlaydi
- **Kerak:** `npm install -D prettier`
- **Faollashtirish:** Prettier o'rnatilgandan keyin avtomatik ishlaydi

### 2. **Lint on Save** (`lint-on-save.json`)
- **Nima qiladi:** Kod saqlanganida lint tekshiruvi
- **Kerak:** `package.json` da `"lint"` script bo'lishi kerak
- **Misol:** `"lint": "eslint . --ext .js,.ts,.jsx,.tsx"`

### 3. **Security Check Before Write** (`security-check-before-write.json`)
- **Nima qiladi:** Faylga yozishdan oldin xavfsizlik tekshiruvi
- **Kerak:** Hech narsa, darhol ishlaydi
- **Foydasi:** Xavfli kod yozishdan oldin ogohlantiradi

### 4. **Run Tests After Task** (`test-after-task.json`)
- **Nima qiladi:** Spec task tugaganidan keyin testlarni ishga tushiradi
- **Kerak:** `package.json` da `"test"` script
- **Misol:** `"test": "jest"` yoki `"test": "vitest run"`

### 5. **Review Code Changes** (`review-code-changes.json`)
- **Nima qiladi:** Agent ish tugatgach, o'zgarishlarni ko'rib chiqadi
- **Kerak:** Hech narsa, darhol ishlaydi
- **Foydasi:** Sifatni nazorat qiladi

### 6. **Git Commit Helper** (`git-commit-helper.json`)
- **Nima qiladi:** Commit qilishdan oldin lint, test va staging
- **Kerak:** Git va npm scripts
- **Ishlatish:** Command Palette → "Trigger Hook" → "Git Commit Helper"

### 7. **Python Format on Save** (`python-format-on-save.json`)
- **Nima qiladi:** Python fayllarni avtomatik formatlaydi
- **Kerak:** `pip install black`
- **Faollashtirish:** Black o'rnatilgandan keyin avtomatik ishlaydi

## Hookni o'chirish yoki o'zgartirish:

1. **O'chirish:** Faylni o'chiring yoki `.json` ichida `"disabled": true` qo'shing
2. **O'zgartirish:** JSON faylni tahrirlang
3. **Ko'rish:** Explorer → "Agent Hooks" bo'limi

## Qo'shimcha hooklar qo'shish:

Menga ayting qanday hook kerak - men yaratib beraman!

## Maslahatlar:

- Hooklar loyihangiz strukturasiga qarab ishlaydi
- Agar `npm run lint` yoki `npm test` yo'q bo'lsa, tegishli hooklar xato beradi
- Kerak bo'lmagan hooklarni o'chirib qo'ying
- Har bir hookni alohida test qilib ko'ring
