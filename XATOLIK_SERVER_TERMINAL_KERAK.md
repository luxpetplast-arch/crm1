# Server Terminal Loglari Kerak

## Muammo
- GET `/api/customers` - 500 xatolik
- GET `/api/sales?productId=...` - 500 xatolik

## Kerakli Ma'lumot
Server terminalida (backend ishlab turgan terminal) quyidagi loglar ko'rinishi kerak:

```
❌ GET /customers xatolik: [xatolik xabari]
❌ GET /sales xatolik: [xatolik xabari]
```

## Qanday Topish Kerak

1. **Server terminalini toping** - `npm run dev` buyrug'i ishlab turgan terminal
2. **Sahifani yangilang** (F5)
3. **Server terminalida** qizil rangda xatolik loglari paydo bo'ladi
4. **To'liq xatolik xabarini** ko'chiring va menga yuboring

## Kutilayotgan Log Formati

```bash
❌ GET /customers xatolik: Invalid `prisma.customer.findMany()` invocation...
Stack: Error: ...
    at PrismaClient...
    at ...
```

yoki

```bash
❌ GET /sales xatolik: Cannot read property 'some' of undefined
Stack: TypeError: ...
    at ...
```

## Agar Server Ishlamasa

Agar server to'xtab qolgan bo'lsa:

1. Yangi terminal oching
2. `npm run dev` buyrug'ini ishga tushiring
3. Server ishga tushgandan keyin sahifani yangilang
4. Server terminalidagi xatolik loglarini ko'ring

## Nima Uchun Kerak?

Browser console faqat "500 Internal Server Error" ko'rsatadi, lekin aniq sabab server terminalida yozilgan. Masalan:
- Prisma schema muammosi
- Database connection xatosi
- TypeScript type xatosi
- Kod sintaksis xatosi

Server terminalidagi to'liq xatolik xabarini ko'rmasdan, men aniq sabab ni topa olmayman va tuzata olmayman.

## Qo'shimcha

Agar server terminali yo'q bo'lsa yoki topilmasa:
1. Barcha terminallarni yoping
2. Yangi terminal oching
3. `npm run dev` ishga tushiring
4. Browser'da sahifani yangilang
5. Server terminalidagi xatolik loglarini ko'ring va menga yuboring
