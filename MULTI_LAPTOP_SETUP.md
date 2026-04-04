# Ko'p Noutbuk uchun O'rnatish Qo'llanmasi

## Umumiy ma'lumot

Bu loyiha **bir nechta noutbuk** da ishlashi mumkin. Har bir noutbuk:
- O'zining **local SQLite** ma'lumotlar bazasiga ega
- **Supabase** orqali boshqa noutbuklar bilan sinxronlanadi
- Internet yo'q bo'lsa ham to'liq ishlaydi

## Arxitektura

```
Noutbuk 1 ←──→ Supabase Cloud ←──→ Noutbuk 2
   ↓                                    ↓
SQLite                               SQLite
(local)                              (local)
```

## O'rnatish qadamlari (har noutbuk uchun)

### 1. Talablar

- **Node.js** 18+ (https://nodejs.org)
- **Git** (https://git-scm.com)
- **VS Code** (tavsiya etiladi)

### 2. Loyihani klonlash

```bash
# Git orqali yuklash
git clone <REPO_URL> zavod-tizimi
cd zavod-tizimi
```

### 3. Package o'rnatish

```bash
npm install
```

### 4. .env sozlash (MUHIM!)

```bash
# .env.example dan nusxa olish
copy .env.example .env
```

**Har noutbuk uchun .env ni o'zgartiring:**

**Noutbuk 1 (Asosiy Kassa):**
```env
VITE_DEVICE_ID=laptop_1
VITE_DEVICE_NAME="Asosiy Kassa"
```

**Noutbuk 2 (Zaxira Kassa):**
```env
VITE_DEVICE_ID=laptop_2
VITE_DEVICE_NAME="Zaxira Kassa"
```

**Noutbuk 3 (Ombor):**
```env
VITE_DEVICE_ID=laptop_3
VITE_DEVICE_NAME="Ombor Kassa"
```

### 5. Database yaratish

```bash
# SQLite database yaratish
npx prisma generate
npx prisma db push

# Test ma'lumotlar (ixtiyoriy)
npm run db:seed
```

### 6. Ilovani ishga tushirish

```bash
# Development mode
npm run dev

# Yoki faqat frontend
npm run dev:client
```

## Sinchronlash (Sync)

### Avtomatik sync
- Har 30 soniyada avtomatik sinxronlanadi
- Internet yo'q bo'lsa, navbatga qo'shiladi

### Qo'lda sync
- Ilovada "Sync" tugmasini bosish
- Yoki `Ctrl+Shift+S` (tez kлавиша)

## Internet yo'q bo'lsa

- Barcha ma'lumotlar **local SQLite** ga saqlanadi
- Internet qaytganda avtomatik yuklanadi
- Hech qanday ma'lumot yo'qolmaydi!

## Bir noutbuk o'chsa

**Muammo:** Noutbuk 1 o'chdi, Noutbuk 2 ishlamoqda

**Yechim:** 
1. Noutbuk 2 da ishda davom eting
2. Noutbuk 1 qayta yoqilganda, barcha o'zgarishlar avtomatik keladi

## Troubleshooting

### 1. Sync ishlamayapti

```bash
# Supabase tekshirish
- URL va ANON_KEY to'g'riligini tekshiring
- Internet ulanganligini tekshiring
```

### 2. Database xatosi

```bash
# Database qayta yaratish
rm prisma/dev.db
npx prisma db push
```

### 3. Port band

```bash
# .env da port o'zgartiring
PORT=5005
```

## File tarkibi (har noutbukda)

```
zavod-tizimi/
├── .env                    # Har noutbuk uchun alohida
├── prisma/
│   └── dev.db             # Local SQLite (har noutbukda o'ziga)
├── src/
│   └── ...
└── package.json
```

## Muhim eslatmalar

1. **VITE_DEVICE_ID** har noutbukda turlicha bo'lishi shart!
2. **VITE_SUPABASE_URL** va **ANON_KEY** barcha noutbuklarda bir xil
3. **prisma/dev.db** har noutbukda alohida (push qilmang!)
4. `.env` faylni **Git'ga push qilmang!** (gitignore'da)

## Yangilanishlar (Updates)

### Kod yangilansa:

```bash
git pull origin main
npm install
```

**Eslatma:** `prisma/dev.db` va `.env` o'zgarmaydi!

## Qo'llab-quvvatlash

Muammolar yuzaga kelsa:
1. Terminal xabarlarini tekshiring
2. Browser Console (F12) ni tekshiring
3. Supabase Dashboard'da status ni ko'ring
