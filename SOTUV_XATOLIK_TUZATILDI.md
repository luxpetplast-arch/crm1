# SOTUV YARATISH XATOLIGI TUZATILDI - FOREIGN KEY

## MUAMMO
Sotuv yaratishda 500 Internal Server Error xatosi:
```
Foreign key constraint violated: `foreign key`
```

Bu xatolik `userId` yoki `customerId` bazada mavjud emasligini bildiradi.

## SABABLARI
1. **User ID tekshirilmagan** - Frontend userId yubormasdan sotuv yaratmoqchi bo'lgan
2. **Customer ID tekshirilmagan** - Ko'chaga bo'lmasa, customerId majburiy
3. **Auth storage noto'g'ri** - localStorage dan userId to'g'ri olinmagan
4. **Foreign key constraint** - Prisma bazada mavjud bo'lmagan ID bilan bog'lanmoqchi

## TUZATISHLAR

### 1. AddSale.tsx - User ID tekshiruvi qo'shildi
```typescript
// Auth storage tekshirish
const authStorage = localStorage.getItem('auth-storage');
if (!authStorage) {
  alert('❌ Siz tizimga kirmagansiz! Iltimos, qaytadan login qiling.');
  navigate('/login');
  return;
}

// User ID olish
let userId = null;
try {
  const authData = JSON.parse(authStorage);
  userId = authData?.state?.user?.id;
  console.log('✅ User ID topildi:', userId);
} catch (e) {
  console.error('❌ Auth storage parse xatosi:', e);
  alert('❌ Autentifikatsiya xatosi! Iltimos, qaytadan login qiling.');
  navigate('/login');
  return;
}

if (!userId) {
  alert('❌ User ID topilmadi! Iltimos, qaytadan login qiling.');
  navigate('/login');
  return;
}
```

### 2. AddSale.tsx - Customer ID tekshiruvi
```typescript
// Ko'chaga bo'lmasa, customerId majburiy
if (!form.isKocha && !form.customerId) {
  console.error('❌ Mijoz tanlanmagan');
  alert(latinToCyrillic('Iltimos, mijoz tanlang yoki "Ko\'chaga" tugmasini bosing!'));
  return;
}
```

### 3. server/routes/sales.ts - User mavjudligini tekshirish
```typescript
// User mavjudligini tekshirish
const userExists = await prisma.user.findUnique({ where: { id: userId } });
if (!userExists) {
  console.error('❌ User topilmadi:', userId);
  return res.status(400).json({ 
    error: 'Foydalanuvchi topilmadi',
    details: `User ID: ${userId} bazada mavjud emas. Iltimos, qaytadan login qiling.`
  });
}
console.log('✅ User topildi:', userExists.email);
```

### 4. server/routes/sales.ts - Customer mavjudligini tekshirish
```typescript
// Customer mavjudligini tekshirish (agar Ko'chaga bo'lmasa)
if (!isKocha && customerId) {
  const customerExists = await prisma.customer.findUnique({ where: { id: customerId } });
  if (!customerExists) {
    console.error('❌ Customer topilmadi:', customerId);
    return res.status(400).json({ 
      error: 'Mijoz topilmadi',
      details: `Customer ID: ${customerId} bazada mavjud emas. Iltimos, mijozni qaytadan tanlang.`
    });
  }
  console.log('✅ Customer topildi:', customerExists.name);
}
```

### 5. server/routes/sales.ts - Prisma xatolarini to'liq ko'rsatish
```typescript
try {
  const sale = await prisma.sale.create({
    data: saleData,
    include: {
      customer: true,
    },
  });
  console.log('✅ Sotuv yaratildi:', sale.id);
} catch (createError: any) {
  console.error('❌ Sotuv yaratishda Prisma xatosi:', createError);
  console.error('❌ Xatolik kodi:', createError.code);
  console.error('❌ Xatolik xabari:', createError.message);
  console.error('❌ Meta ma\'lumotlar:', createError.meta);
  
  return res.status(500).json({
    error: 'Sotuv yaratishda xatolik',
    details: createError.message,
    code: createError.code,
    meta: createError.meta
  });
}
```

## NATIJA
✅ User ID tekshiriladi
✅ Customer ID tekshiriladi
✅ Foreign key xatoliklari oldini olinadi
✅ Aniq xatolik xabarlari ko'rsatiladi
✅ Login sahifasiga yo'naltirish avtomatik

## TESTLASH
1. Brauzerda F12 bosing (Console ochish)
2. Sotuv yaratishga harakat qiling
3. Konsolda quyidagi loglarni ko'ring:
   - 🔐 Auth storage: Mavjud/Yo'q
   - 👤 User localStorage: Mavjud/Yo'q
   - ✅ User ID topildi: [ID]
   - 🔍 User va Customer tekshirilmoqda...
   - ✅ User topildi: [email]
   - ✅ Customer topildi: [name]
4. Agar xatolik bo'lsa:
   - User topilmasa → Login sahifasiga yo'naltiriladi
   - Customer topilmasa → Aniq xabar ko'rsatiladi
   - Foreign key xatosi → Batafsil ma'lumot konsolda

## MUHIM ESLATMA
Agar xatolik davom etsa:
1. Logout qiling
2. Qaytadan login qiling
3. Mijozni to'g'ri tanlang
4. Sotuv yarating

Sana: 2026-04-16

