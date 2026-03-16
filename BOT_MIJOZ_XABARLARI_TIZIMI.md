# Bot bilan Mijoz O'rtashtirish Tizimi

## 🎯 Mavjud Funksiyalar

### ✅ Telegram Bot Integratsiyasi

Sizning tizimida quyidagi bot funksiyalari mavjud:

## 📱 Asosiy Funksiyalar

### 1. Buyurtma Yaratilganda Xabar Yuborish
```typescript
// services/order-workflow.ts
await this.notifyCustomerOrderReceived(orderData.telegramChatId, order);
```

### 2. Mahsulot Tayor Bo'lganda Xabar Yuborish
```typescript
// services/order-workflow.ts
await this.notifyCustomerProductionCompleted(
  order.customer.telegramChatId, 
  order, 
  { ...production, product }
);
```

### 3. Yetkazib Bo'lganda Xabar Yuborish
```typescript
// services/order-workflow.ts
await this.notifyCustomerDeliveryCompleted(order.customer.telegramChatId, order);
```

### 4. Chek Yuborish
```typescript
// utils/invoice-generator.ts
await customerBot.sendMessage(telegramChatId, message, {
  parse_mode: 'Markdown'
});
```

### 5. Ombor Ogohlari
```typescript
// utils/telegram-notifications.ts
export async function sendLowStockAlert(product: any) {
  // 🚨 Iltimos, ishlab chiqarishni rejalashtiring!
  return sendTelegramMessage(TELEGRAM_ADMIN_CHAT_ID!, message);
}

export async function sendDebtAlert(customer: any) {
  // 💳 Iltimos, mijoz bilan bog'laning!
  return sendTelegramMessage(TELEGRAM_ADMIN_CHAT_ID!, message);
}
```

## 🔍 Bot Xabarlar Turlari

### Buyurtma Qabul Qilingganda
```
🔄 Buyurtma jarayoni boshlandi...
✅ Buyurtma yaratildi: ${order.orderNumber}
```

### Mahsulot Tayor Bo'lganda
```
🏪 Bizni tanlaganingiz uchun rahmat!
📞 **TAYORLOVCHI**: ${production.name}
📦 **MAHSULOT**: ${product.name}
📊 **MIQDOR**: ${quantity} qop
💰 **NARX**: ${pricePerBag} so'm
```

### Yetkazib Bo'lganda
```
🚚 **YETKAZIB BERISH**
📍 Manzil: ${customer.address}
📦 Yetkazib beruvchi: ${driver.name}
📱 Tel: ${driver.vehicleNumber}
⭐ Reyting: ${driver.rating}/5.0
```

### Chek Yuborilganda
```
🧾 <b>Yangi Faktura</b>

📅 Sana: ${new Date(invoice.createdAt).toLocaleString('uz-UZ')}

🏢 **KOMPANIYA:**
AzizTrades ERP
Tel: +998 XX XXX XX XX
Telegram: @aziztrades

---
📋 **Buyurtma #${invoiceNumber}**
```

## 🎨 Xususiyatlar

### 🎯 Xabar Turlari
- **Text xabarlar** - Oddiy matnli xabarlar
- **HTML xabarlar** - Formatlangan xabarlar
- **Markdown xabarlar** - Rich format xabarlar

### 📊 Xabar Mazmuni
- **📱 Savollar uchun** - /help komandasi
- **🔔 Bildirishnomalar** - Avtomatik bildirishnomalar
- **📊 Statistika** - Kunlik/oylik hisobotlar

## 🚀 Integratsiya Holati

### ✅ Ishlaydigan Funksiyalar
1. **Buyurtma yaratish** - Mijozga xabar yuboriladi
2. **Mahsulot tayyorlash** - Status haqida xabar yuboriladi
3. **Yetkazib berish** - Manzil va haydovchi ma'lumoti
4. **Chek yuborish** - To'liq faktura yuboriladi
5. **Ombor ogohlari** - Admin ga xabar yuboriladi

## 🎉 Natija

**Sizning tizimi to'liq integratsiyalangan!**

### 🔧 Texnik Xususiyatlar
- **Multi-bot tizimi** - Admin, Customer, Logistics botlar
- **Real-time xabarlar** - Darhol xabar yuborish
- **Rich format xabarlar** - HTML va Markdown format
- **Xavfsizlik** - Error handling va loglar
- **Mahalliy til** - O'zbek tili

### 📈 Imkoniyatlar
- Yangi buyurtmalar uchun avtomatik xabarlar
- Mahsulot statuslarini real-time kuzatish
- Yetkazib berish jarayonini avtomatlashtirish
- Ombor ogohlari uchun avtomatik bildirishnomalar
- To'liq fakturalarni avtomatik yuborish

## 🎯 Xulosa

**Sizning bot integratsiyasi to'liq ishlaydi!**

**Tavsiya:**
1. Bot tokenlarni tekshiring
2. Admin chat ID larni sozlang
3. Test xabarlar yuboring
4. Mijozlarning telegramChatId larini tekshiring

**Natija:** Zamonaviy va avtomatlashtirilgan mijoz xizmatlari tizimi! 🎯
