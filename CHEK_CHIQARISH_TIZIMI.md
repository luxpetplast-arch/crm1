# 🖨️ CHEK CHIQARISH TIZIMI

## ✅ YARATILDI: 2026-03-15

## 📋 UMUMIY MA'LUMOT

80mm termik printer uchun avtomatik chek chiqarish tizimi muvaffaqiyatli yaratildi va Sotuv sahifasiga integratsiya qilindi.

## 🎯 ASOSIY FUNKSIYALAR

### 1. Avtomatik Chek Chiqarish
- ✅ Har bir sotuv yaratilgandan keyin avtomatik ravishda chek chiqariladi
- ✅ Chek yangi oynada ochiladi va avtomatik chop etiladi
- ✅ Chop etishdan keyin oyna avtomatik yopiladi

### 2. Qayta Chek Chiqarish
- ✅ Sotuvlar ro'yxatida har bir sotuv kartasida "Chek Chiqarish" tugmasi mavjud
- ✅ Tugmani bosish orqali istalgan vaqtda chekni qayta chop etish mumkin
- ✅ Eski sotuvlar uchun ham chek chiqarish imkoniyati

### 3. Chek Tarkibi
Chekda quyidagi ma'lumotlar ko'rsatiladi:

#### Kompaniya Ma'lumotlari:
- Kompaniya nomi: AZIZ TRADES
- Manzil: Toshkent sh., Chilonzor t.
- Telefon: +998 90 123 45 67
- INN: 123456789

#### Sotuv Ma'lumotlari:
- Chek raqami (Sale ID ning birinchi 8 belgisi)
- Sana va vaqt
- Kassir ismi
- Mijoz ismi va telefoni

#### Mahsulotlar Ro'yxati:
- Mahsulot nomi
- Miqdori (qop)
- Narxi (UZS)
- Jami summa

#### Moliyaviy Ma'lumotlar:
- Jami summa (subtotal)
- QQS (12%)
- Umumiy to'lov
- To'lov turlari (Naqd UZS, Dollar, Karta)
- To'langan summa
- Qarz (agar mavjud bo'lsa)

## 🔧 TEXNIK TAFSILOTLAR

### Fayllar:
1. **src/lib/receiptPrinter.ts** - Chek chiqarish utility
   - `ReceiptData` interface - chek ma'lumotlari strukturasi
   - `generateReceiptHTML()` - HTML chek yaratish
   - `printReceipt()` - chekni chop etish
   - `prepareSaleReceipt()` - sotuv ma'lumotlarini chek formatiga o'tkazish

2. **src/pages/Sales.tsx** - Sotuv sahifasi
   - Avtomatik chek chiqarish `handleSubmit` funksiyasida
   - Qayta chek chiqarish tugmasi sotuvlar ro'yxatida

### Chek Formati:
- Kenglik: 80mm (termik printer standart)
- Font: Courier New (monospace)
- Avtomatik chop etish: Ha
- Responsive dizayn: Ha

## 📊 VALYUTA KONVERTATSIYASI

Barcha summalar USD dan UZS ga avtomatik konvertatsiya qilinadi:
- Exchange rate: 12,500 UZS = 1 USD
- To'lovlar: UZS, USD, Karta (UZS)
- Chekda faqat UZS ko'rsatiladi

## 🖨️ PRINTER SOZLAMALARI

### Aniqlangan Printer:
- Model: **Xprinter XP-365B**
- Portlar: USB001, USB003
- Printer nomi: "Copy 1" (test muvaffaqiyatli)

### Chop Etish Jarayoni:
1. Sotuv yaratiladi
2. Chek HTML formatida generatsiya qilinadi
3. Yangi oyna ochiladi
4. Brauzer print dialog ochiladi
5. Foydalanuvchi printerni tanlaydi va chop etadi
6. Oyna avtomatik yopiladi

## 🎨 DIZAYN XUSUSIYATLARI

- ✅ Kompaniya logotipi va ma'lumotlari yuqorida
- ✅ Chiziqlar bilan bo'limlar ajratilgan (dashed lines)
- ✅ Mahsulotlar jadvali
- ✅ Jami summa katta va qalin shriftda
- ✅ To'lov tafsilotlari
- ✅ Qarz qizil rangda (agar mavjud bo'lsa)
- ✅ Footer: "RAHMAT!" va kontakt ma'lumotlari
- ✅ Chek ID va kompaniya versiyasi

## 🚀 FOYDALANISH

### Yangi Sotuv:
1. "Yangi Sotuv" tugmasini bosing
2. Mijozni tanlang
3. Mahsulotlarni qo'shing
4. To'lov ma'lumotlarini kiriting
5. "Sotuvni tasdiqlash" tugmasini bosing
6. ✅ Chek avtomatik chiqadi!

### Eski Sotuvni Qayta Chop Etish:
1. Sotuvlar ro'yxatidan kerakli sotuvni toping
2. "Chek Chiqarish" tugmasini bosing
3. ✅ Chek qayta chiqadi!

## ⚠️ MUHIM ESLATMALAR

1. **Popup Blocker**: Brauzerda popup oynalariga ruxsat berilgan bo'lishi kerak
2. **Printer Ulanishi**: Printer kompyuterga ulangan va yoqilgan bo'lishi kerak
3. **Brauzer Print**: Chop etish brauzer print funksiyasi orqali amalga oshiriladi
4. **Xatolik Boshqaruvi**: Chek chiqarishda xatolik bo'lsa ham, sotuv saqlanadi

## 📝 KELAJAKDAGI YAXSHILASHLAR

- [ ] Printer sozlamalari (Settings sahifasida)
- [ ] Avtomatik chop etishni yoqish/o'chirish
- [ ] Kompaniya ma'lumotlarini sozlash
- [ ] Chek shablonlarini tanlash
- [ ] QR kod qo'shish (to'lov uchun)
- [ ] Chek tarixini saqlash
- [ ] Email orqali chek yuborish

## 🎉 NATIJA

Chek chiqarish tizimi to'liq ishga tushirildi va foydalanishga tayyor!

**Test qilingan:**
- ✅ Test chek muvaffaqiyatli chop etildi
- ✅ Xprinter XP-365B printer bilan ishlaydi
- ✅ 80mm format to'g'ri ko'rsatiladi
- ✅ Avtomatik chop etish ishlaydi

**Integratsiya:**
- ✅ Sales.tsx sahifasiga qo'shildi
- ✅ Avtomatik chek chiqarish ishlaydi
- ✅ Qayta chek chiqarish tugmasi qo'shildi
- ✅ Barcha diagnostikalar tozalandi

---

**Yaratilgan:** 2026-03-15
**Holat:** ✅ Tayyor
**Printer:** Xprinter XP-365B
**Format:** 80mm termik chek
