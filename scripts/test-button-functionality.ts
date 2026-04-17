console.log('Testing button functionality guide...');

console.log(`
========================================
YANGI MIJOZ TUGMASI TEST QILISH UCHUN:
========================================

1. Kassir sahifasiga o'ting:
   http://localhost:3000/cashier/login

2. Login qiling:
   Login: cashier
   Password: cashier

3. Customers page ga o'ting:
   http://localhost:3000/cashier/customers

4. Brauzer console oching (F12) va "Console" tabiga o'ting

5. "Yangi mijoz" tugmasini bosing

6. Console da quyidagi xabarlarni ko'rishingiz kerak:
   - "Yangi mijoz tugmasi bosildi!"
   - "Modal form ochilishi kerak! showAddForm: true"

7. Agar modal ochilsa, formani to'ldiring va "Qo'shish" tugmasini bosing

8. Console da quyidagi xabarlarni ko'rishingiz kerak:
   - "handleAddCustomer funksiyasi chaqirildi!"
   - "New customer data: {name: '...', phone: '...', ...}"
   - "API ga so'rov yuborilmoqda..."

9. Agar hammasi to'g'ri bo'lsa, mijoz muvaffaqiyatli qo'shiladi

AGAR XATOLIK BO'LSA:
- Console da qanday xatoliklar borligini tekshiring
- Tugma bosilganda "Yangi mijoz tugmasi bosildi!" degan xabar chiqadimi?
- Modal ochiladimi?
- API so'rovi yuboriladimi?

Debug qilingan kodlar:
- Tugma bosilganda console.log chiqadi
- Modal ochilganda console.log chiqadi  
- Customer creation funksiyasida console.log chiqadi
========================================
`);
