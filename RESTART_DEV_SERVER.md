# Development Serverni Qayta Ishga Tushirish

## Muammo
Mahsulot tanlash ishlamayapti, chunki brauzer eski kodni cache qilgan.

## Yechim

### 1. Development Serverni To'xtatish
Terminal da `Ctrl + C` bosing

### 2. Cache ni Tozalash
```bash
# Node modules cache
rm -rf node_modules/.vite

# Yoki Windows da:
rmdir /s /q node_modules\.vite
```

### 3. Serverni Qayta Ishga Tushirish
```bash
npm run dev
```

### 4. Brauzerda Hard Refresh
- **Windows/Linux**: `Ctrl + Shift + R` yoki `Ctrl + F5`
- **Mac**: `Cmd + Shift + R`

### 5. Agar Hali Ham Ishlamasa
Brauzerni to'liq yoping va qaytadan oching.

## Console Loglar
Agar mahsulot tugmasini bossangiz, console da quyidagi loglar ko'rinishi kerak:
```
🔍 ProductSelector render - products: 35
🔍 Filtered: 35
🔄 Render product button: Kapsula 15 gr
🖱️ CLICKED: Kapsula 15 gr
✅ onSelect called
🎯 Orders onSelect called: {id: "...", name: "Kapsula 15 gr", ...}
```

Agar bu loglar ko'rinmasa, sahifa yangilanmagan.
