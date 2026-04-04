# 🚗 Haydovchi Belgilash Tizimi - Asosiy Qoidalar

## 📋 Umumiy Qoidalar

### 1. 🎯 Haydovchi Tanlash
- **Ixtiyoriy:** Haydovchi tanlash majburiy emas
- **Tanlash variantlari:**
  - Mavjud haydovchini tanlash
  - Yangi haydovchi qo'shish
  - Haydovchisiz sotuv

### 2. ➕ Yangi Haydovchi Qo'shish
- **Talab qilinadigan ma'lumotlar:**
  - Ism (majburiy)
  - Telefon raqami (majburiy, unique)
  - Mashina raqami (ixtiyoriy)

- **Avtomatik saqlash:** Yangi haydovchi avtomatik ravishda drivers jadvaliga saqlanadi
- **Validatsiya:** Ism va telefon raqami bo'sh bo'lmasligi tekshiriladi

### 3. 🔍 Dublikatni Oldini Olish
- **Telefon raqami bo'yicha:** Bir xil telefon raqami faqat bitta haydovchiga biriktirilishi mumkin
- **Tekshirish:** Yangi haydovchi qo'shishdan oldin mavjudligi tekshiriladi

### 4. 💰 To'lov Ma'lumotlari
- **factoryShare:** Zavod tomonidan to'lanadigan summa
- **customerShare:** Mijoz tomonidan to'lanadigan summa
- **Saqlash:** Sotuv yaratilganda avtomatik ravishda saqlanadi

### 5. 🔐 Xavfsizlik
- **Telefon raqami:** Boshqa haydovchilar uchun ko'rinmaydi
- **Ma'lumotlar:** Faqat ruxsati foydalanuvchilar ko'ra oladi

## 🎮 Foydalanish Qoidalari

### 1. Sotuvni Boshlash
1. Savdo formasiga kirish
2. Mijozni tanlash (majburiy)
3. Mahsulotlarni tanlash va savatga qo'shish

### 2. Haydovchini Tanlash
1. **Agar haydovchi kerak bo'lsa:**
   - "Haydovchi tanlash" menyusini ochish
   - Mavjud haydovchilar ro'yxatidan tanlash YOKI
   - "Yangi haydovchi qo'shish" ni tanlash

2. **Yangi haydovchi qo'shish uchun:**
   - "Yangi haydovchi qo'shish" variantini tanlash
   - Formani to'ldirish:
     * Ism (lotin harflarda)
     * Telefon raqami (+998 bilan boshlanishi kerak)
     * Mashina raqami (ixtiyoriy)
   - "Qo'shish" tugmasini bosish
   - Tizim avtomatik tekshiradi va saqlaydi

### 3. Sotuvni Yakunlash
1. To'lov ma'lumotlarini kiritish (agar haydovchi tanlangan bo'lsa)
2. Mahsulotlarni tekshirish
3. "Sotuvni yakunlash" tugmasini bosish
4. Chek avtomatik chiqariladi (agar haydovchi tanlangan bo'lsa, ma'lumotlari chekka yoziladi)

## ⚠️ Muhim Eslatmalar

- Haydovchini o'zgartish faqat adminlar tomonidan amalga oshirilishi mumkin
- Telefon raqami noto'g'ri formatda kiritilishi kerak
- Haydovchi ma'lumotlari faqat tegishli sotuvlarda ishlatiladi
- Agar xatolik yuz bersa, administratorga murojaat qiling

## 🔄 Tizimning Ishlash Tartibi

1. Foydalanuvchi haydovchini tanlaydi
2. Agar yangi bo'lsa, ma'lumotlarni kiritadi
3. Tizim ma'lumotlarni validatsiya qiladi
4. Ma'lumotlar bazaga saqlanadi
5. Haydovchi sotuvga biriktiriladi
6. To'lov ma'lumotlari hisobga olinadi
7. Chek chiqariladi

---

📝 **Yaratilgan:** 2026-03-20  
👤 **Yaratuvchi:** AI Assistant  
🏢 **Tizim:** Zavod Tizimi  
📧 **Versiya:** 1.0
