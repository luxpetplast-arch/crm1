# Lotin → Kirill O'zgartirish ✅

## Maqsad
Saytdagi barcha lotin yozuvlarini kirill yozuviga o'tkazish.

## O'zgartirilgan Sahifalar

### ✅ Sales.tsx
- "Savatga qo'shish" → Саватга қўшиш
- "Bekor qilish" → Бекор қилиш  
- "Saqlash" → Сақлаш

### 🔄 Qolgan Sahifalar (Tuzatish Kerak)

1. **Users.tsx**
   - "Foydalanuvchi Qo'shish"
   - "Tahrirlash"
   - "Yangi Foydalanuvchi"
   - "Saqlash"
   - "Yaratish"

2. **Tasks.tsx**
   - "Yangi Vazifa"
   - "Bekor qilingan"
   - "Yangilanmadi"

3. **Suppliers.tsx**
   - "Yetkazuvchi Qo'shish"
   - "Tahrirlash"
   - "Yangi Yetkazuvchi"
   - "Saqlash"
   - "Yaratish"

4. **Statistics.tsx**
   - "Yangilash"
   - "Bekor qilingan"
   - "Yangi Mijozlar"

5. **Settings.tsx**
   - "Saqlash"
   - "Saqlanmoqda..."
   - "Barcha Sozlamalarni Saqlash"

## Yechim

Barcha lotin so'zlarni `latinToCyrillic()` funksiyasi bilan o'rab olish:

```typescript
// XATO:
<Button>Yangi Sotuv</Button>

// TO'G'RI:
<Button>{latinToCyrillic("Yangi Sotuv")}</Button>
```

## Qo'llanma

### 1. Import qo'shish
```typescript
import { latinToCyrillic } from '../lib/transliterator';
```

### 2. Barcha lotin matnlarni o'rab olish
```typescript
// Tugmalar
<Button>{latinToCyrillic("Saqlash")}</Button>

// Sarlavhalar
<h1>{latinToCyrillic("Yangi Sotuv")}</h1>

// Alert xabarlari
alert(latinToCyrillic("Muvaffaqiyatli saqlandi!"));

// Placeholder
<input placeholder={latinToCyrillic("Ism kiriting")} />
```

## Keyingi Qadamlar

1. ✅ Sales.tsx - Tayyor
2. [ ] Users.tsx
3. [ ] Tasks.tsx
4. [ ] Suppliers.tsx
5. [ ] Statistics.tsx
6. [ ] Settings.tsx
7. [ ] Products.tsx
8. [ ] Customers.tsx
9. [ ] Orders.tsx
10. [ ] Dashboard.tsx

---
**Sana:** 2026-03-18
**Status:** 🔄 Jarayonda
