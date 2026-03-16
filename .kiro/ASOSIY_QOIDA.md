# ⚠️ ASOSIY QOIDA - DOIM BIRINCHI QILISH KERAK!

## 🚨 ENG MUHIM QOIDA:

### PROMPT OLGANIMDAN KEYIN:
1. ✅ **SAVOL BERAMAN** - Promptni to'liq tushunish uchun
2. ✅ Promptni to'g'rilab tushunaman
3. ✅ Context-gatherer ishlataman (agar kerak bo'lsa)
4. ✅ Mavjud fayllarni o'qiyman
5. ✅ **REJA TAQDIM QILAMAN**
6. ⏸️ **KUTAMAN - Foydalanuvchi "HA" DEYDI**
7. ✅ Keyin kod yozaman

### ❌ XATO - Darhol kod yozish
### ✅ TO'G'RI - Savol → Reja → Tasdiqlash → Kod

---

## 🎯 PROMPT OLGANIMDAN KEYIN BIRINCHI ISH:

### ❌ NOTO'G'RI (Men qilgan xato):
```
1. Darhol kod yozishni boshlash
2. Fayllar yaratishni boshlash
3. O'zim taxmin qilish
```

### ✅ TO'G'RI (Qilishim kerak bo'lgan):
```
1. BIRINCHI: context-gatherer subagent ishga tushirish
2. Mavjud fayllarni o'qish
3. Tizimni tushunish
4. Keyin kod yozish
```

## � TO'G'RI ISH TARTIBI:

### 1. User prompt beradi
```
"saytga chatlar ham qoshgin..."
```

### 2. Men promptni to'g'rilayman va tushunaman
```
Tushundim: Mijoz chat tizimi kerak
- Mijoz botga yozadi
- Saytda ko'rinadi
- Admin javob beradi
- Mijozga boradi
```

### 3. Context-gatherer ishlataman (agar kerak)
```typescript
invokeSubAgent({
  name: "context-gatherer",
  prompt: "Chat tizimi uchun kerakli fayllarni top",
  explanation: "Mavjud tizimni tushunish"
})
```

### 4. REJA TAQDIM QILAMAN
```
📋 REJA:

1. Database model (CustomerChat)
2. API routes (customer-chat.ts)
3. Bot integration (enhanced-customer-bot.ts)
4. Frontend page (CustomerChat.tsx)
5. Navigation (App.tsx, Layout.tsx)

Davom etishimni xohlaysizmi? (ha/yo'q)
```

### 5. ⏸️ KUTAMAN - User "HA" deydi

### 6. Kod yozaman
```typescript
// Faqat user "HA" degan keyin
```

---

## 🚨 MUHIM ESLATMA:

**HECH QACHON KOD YOZMASDAN OLDIN:**
1. Promptni tushunaman
2. Reja tuzaman
3. Rejani ko'rsataman
4. User tasdiqlashini kutaman
5. Keyin kod yozaman

**AGAR DARHOL KOD YOZSAM - XATO!**

---

## 💡 MISOL

### User aytdi:
"saytga chatlar ham qoshgin"

### Men javob beraman:
```
Tushundim! Mijoz chat tizimi yaratish kerak.

📋 REJA:
1. Database: CustomerChat model
2. Backend: customer-chat.ts API
3. Bot: enhanced-customer-bot.ts ga xabar saqlash
4. Frontend: CustomerChat.tsx sahifa
5. Navigation: App.tsx va Layout.tsx

Davom etishimni xohlaysizmi?
```

### User aytadi:
"ha"

### Keyin men kod yozaman:
```typescript
// Endi kod yozish boshlash mumkin
```

---

## 🚨 NEGA BU MUHIM?

### Agar context-gatherer ishlatmasam:
- ❌ Mavjud fayllarni ko'rmayman
- ❌ Dublikat kod yozaman
- ❌ Tizim arxitekturasiga mos kelmaydi
- ❌ Xatolar ko'p bo'ladi
- ❌ Foydalanuvchi qayta tushuntirishi kerak

### Agar context-gatherer ishlatsam:
- ✅ Barcha mavjud fayllarni ko'raman
- ✅ Tizimni to'liq tushunaman
- ✅ To'g'ri arxitektura bilan yozaman
- ✅ Xatolar kam bo'ladi
- ✅ Foydalanuvchi mamnun bo'ladi

## 💡 MISOL

### User aytdi:
"saytga chatlar ham qoshgin bunda saytni uzidan turib mijoz bilan gaplashish mumkin buladi"

### Men qilishim kerak:
```typescript
// 1. BIRINCHI - Context-gatherer
invokeSubAgent({
  name: "context-gatherer",
  prompt: `
    Mijoz chat tizimi uchun quyidagilarni toping:
    - Mavjud bot fayllar (customer-bot, enhanced-customer-bot)
    - Database schema (Customer, Chat modellari)
    - API routes (chat, customer routes)
    - Frontend pages (chat sahifalari)
    - Bot integration (telegram bot kodlari)
  `,
  explanation: "Chat tizimini qo'shishdan oldin mavjud tizimni tushunish"
})

// 2. Natijalarni o'qiyman

// 3. Reja tuzaman

// 4. Kod yozaman
```

## 📝 ESLATMA O'ZIM UCHUN

**HAR SAFAR YANGI PROMPT KELGANDA:**

1. ⏸️ TO'XTAT!
2. 🤔 O'YLA: Context-gatherer kerakmi?
3. ✅ Agar yangi funksiya qo'shish kerak bo'lsa - ALBATTA ISHLATAMAN!
4. 📖 Natijalarni o'qiyman
5. 💻 Keyin kod yozaman

## 🎯 MAQSAD

Context-gatherer ishlatish orqali:
- Tizimni to'liq tushunaman
- Xatolarni kamaytiram
- Foydalanuvchi vaqtini tejayaman
- Professional ishlayaman

---

**BU QOIDANI HAR DOIM ESLAB QOLISH KERAK!**

*Yaratilgan: 2026-03-05*
*Muhimlik darajasi: ⭐⭐⭐⭐⭐ (5/5)*


---

## 🚨 YANGI MUHIM QOIDA - ISH TUGALLANMAGUNCHA TO'XTAMASLIK!

### ❌ XATO - Ishni yarim qoldirish
```
1. Ishni boshladim
2. Biror muammo chiqdi
3. Boshqa narsaga o'tdim
4. Ish yarim qoldi ❌
```

### ✅ TO'G'RI - Ishni to'liq tugatish
```
1. Ishni boshladim
2. Muammo chiqdi
3. Muammoni hal qildim
4. Ishni to'liq tugatdim ✅
5. Keyin boshqa ishga o'tdim
```

---

## 📋 ISH TUGATISH TARTIBI:

### 1. Ish Boshlash
- ✅ Vazifani to'liq tushunaman
- ✅ Reja tuzaman
- ✅ Foydalanuvchidan tasdiqlash olaman

### 2. Ish Jarayoni
- ✅ Rejaga amal qilaman
- ✅ Har bir qadamni to'liq bajaraman
- ❌ Yarim qoldirmayman!

### 3. Muammo Chiqsa
- ✅ Muammoni hal qilaman
- ✅ Alternativ yechim topaman
- ✅ Foydalanuvchidan yordam so'rayman (agar kerak bo'lsa)
- ❌ Boshqa ishga o'tmayman!

### 4. Ish Tugashi
- ✅ Barcha qadamlar bajarildi
- ✅ Test qildim
- ✅ Xatolar yo'q
- ✅ Hisobot tayyorladim
- ✅ Endi boshqa ishga o'tish mumkin!

---

## 🎯 MISOL - TO'G'RI ISH TARTIBI:

### Vazifa: "TypeScript xatolarni tuzat"

#### ❌ NOTO'G'RI:
```
1. TypeScript xatolarni ko'rdim
2. Bitta xatoni tuzatdim
3. Boshqa ishga o'tdim
4. Qolgan xatolar tuzatilmadi ❌
```

#### ✅ TO'G'RI:
```
1. TypeScript xatolarni ko'rdim (10 ta)
2. Birinchi xatoni tuzatdim (1/10)
3. Ikkinchi xatoni tuzatdim (2/10)
4. ...
5. O'ninchi xatoni tuzatdim (10/10)
6. Barcha xatolar tuzatildi ✅
7. Test qildim - 0 ta xato ✅
8. Endi boshqa ishga o'tish mumkin!
```

---

## 💡 QACHON FOYDALANUVCHIDAN SO'RASH KERAK?

### ✅ So'rash kerak:
1. Vazifa noaniq bo'lsa
2. Katta qaror qabul qilish kerak bo'lsa
3. Muammo hal qilib bo'lmasa
4. Alternativ yechimlar bo'lsa

### ❌ So'ramaslik kerak:
1. Oddiy xatolarni tuzatishda
2. Rejaga amal qilishda
3. Standart ishlarni bajarishda
4. Texnik muammolarni hal qilishda

---

## 🔥 ENG MUHIM QOIDA:

**ISH BOSHLANGAN BO'LSA - TO'LIQ TUGATILISHI KERAK!**

**YARIM QOLDIRISH = XATO!**

**TO'LIQ TUGATISH = TO'G'RI!**

---

## 📝 NAZORAT RO'YXATI:

Har bir ish uchun:

- [ ] Vazifa tushunildi
- [ ] Reja tuzildi
- [ ] Tasdiqlash olindi
- [ ] Ish boshlandi
- [ ] Barcha qadamlar bajarildi
- [ ] Muammolar hal qilindi
- [ ] Test qilindi
- [ ] Xatolar yo'q
- [ ] Hisobot tayyorlandi
- [ ] **ISH TO'LIQ TUGADI** ✅

Faqat shundan keyin boshqa ishga o'tish mumkin!

---

**ESLATMA:** Bu qoida har doim, har bir ish uchun amal qiladi!

*Yangilangan: 2026-03-08*
*Muhimlik: ⭐⭐⭐⭐⭐ (5/5)*


---

## 📄 MD FAYLLAR HAQIDA QOIDA

### ❌ NOTO'G'RI - Har doim MD fayl yaratish
```
1. Ish qildim
2. MD hisobot yaratdim ❌
3. Yana ish qildim
4. Yana MD hisobot yaratdim ❌
5. Juda ko'p keraksiz fayllar! ❌
```

### ✅ TO'G'RI - Faqat kerak bo'lganda yaratish
```
1. Ish qildim
2. Foydalanuvchiga og'zaki xabar berdim ✅
3. MD fayl FAQAT kerak bo'lsa yarataman ✅
```

---

## 🎯 QACHON MD FAYL YARATISH KERAK?

### ✅ Yaratish kerak:
1. **Foydalanuvchi so'rasa**
   - "Hisobot yarat"
   - "Dokumentatsiya yoz"
   - "Qo'llanma qil"

2. **Muhim hujjatlar**
   - README.md
   - API_DOCUMENTATION.md
   - DEPLOYMENT.md
   - Qo'llanmalar

3. **Kelajak uchun kerak**
   - Deploy instructions
   - Setup guides
   - Important notes

### ❌ Yaratmaslik kerak:
1. **Oddiy hisobotlar**
   - Test natijalari
   - Xatolar ro'yxati
   - Ish jarayoni
   - Vaqtinchalik ma'lumotlar

2. **Har safar ish qilganda**
   - "YAKUNIY_HISOBOT_2026_03_08.md" ❌
   - "TEST_NATIJASI_2026_03_08.md" ❌
   - "XULOSA_2026_03_08.md" ❌

3. **O'zim uchun**
   - Men MD faylsiz ham ishlashim mumkin
   - Foydalanuvchiga og'zaki aytish yetarli

---

## 💡 ALTERNATIVA - OG'ZAKI XABAR

### ❌ Noto'g'ri:
```
Ish tugadi! Hisobot: YAKUNIY_HISOBOT.md ❌
```

### ✅ To'g'ri:
```
✅ Ish tugadi!
- TypeScript: 0 xato
- Botlar: 100% ishlaydi
- Deploy: Tayyor

Batafsil kerakmi? ✅
```

---

## 🔥 ASOSIY QOIDA:

**MD FAYL = FAQAT KERAK BO'LGANDA!**

**Og'zaki xabar = Ko'pincha yetarli!**

**Keraksiz fayllar = Tartibsizlik!**

---

*Yangilangan: 2026-03-08*
*Muhimlik: ⭐⭐⭐⭐⭐ (5/5)*
