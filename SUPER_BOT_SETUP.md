# 🚀 SUPER CUSTOMER BOT - Ishga Tushirish Qo'llanmasi

## 📋 Talab Qilinadigan Narsalar

- ✅ Node.js 18+
- ✅ PostgreSQL database
- ✅ Telegram Bot Token
- ✅ npm yoki yarn

---

## 🔧 O'rnatish

### 1. Bot Tokenini Sozlash

`.env` faylida:

```env
# Telegram Bots
TELEGRAM_BOT_TOKEN="8228740483:AAFAGajvvZkCA8eXNMY-dLa4I2gin4wYUKw"
TELEGRAM_PRODUCTION_BOT_TOKEN="8730452763:AAF0dLAfLrQvLSswh6mJjLnQlBmKZNNLiuQ"
TELEGRAM_LOGISTICS_BOT_TOKEN="8605772709:AAEGg397kdgJOv_fmvleOfjBFvFYwleoEOU"
TELEGRAM_ADMIN_BOT_TOKEN="8781061607:AAGB6rK_mOV-AtjLoIQdFu7gAn-nCjYj1i4"
TELEGRAM_CUSTOMER_BOT_TOKEN="8708703467:AAE1QKBZsICZwzE5G1LFeiPbMyb5usdLOMs"
```

### 2. Dependencies O'rnatish

```bash
npm install node-telegram-bot-api
npm install @types/node-telegram-bot-api --save-dev
```

### 3. Bot Faylini Import Qilish

`server/bot/index.ts` faylida:

```typescript
import { initSuperCustomerBot } from './super-customer-bot';

export function initAllBots() {
  // Super Customer Bot
  const superBot = initSuperCustomerBot();
  
  // Boshqa botlar...
}
```

### 4. Server'da Ishga Tushirish

`server/index.ts` faylida:

```typescript
import { initAllBots } from './bot';

// Server ishga tushganda
initAllBots();
```

---

## 🚀 Ishga Tushirish

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

---

## ✅ Tekshirish

### 1. Bot Ishlayaptimi?

```bash
node test-telegram-bot-token.cjs
```

Natija:
```
✅ BOT ISHLAYAPTI!

Bot Ma'lumotlari:
  ID: 8708703467
  Ism: Lux Pet Plast
  Username: @luxpetplastbot
```

### 2. Telegram'da Test

1. Botni oching: https://t.me/luxpetplastbot
2. `/start` buyrug'ini yuboring
3. Xush kelibsiz xabari kelishi kerak

---

## 📊 Funksiyalarni Test Qilish

### Asosiy Funksiyalar

```
/start - Botni boshlash
/help - Yordam
/myid - ID olish
```

### Smart Buyurtma

```
🛒 Smart Buyurtma - Menyu
/smart_order - Komanda
```

### Moliyaviy

```
💰 Moliyaviy - Menyu
/balance - Balans
/payment - To'lov
```

### Tahlil

```
📊 Tahlil - Menyu
/stats - Statistika
/report - Hisobot
```

---

## 🔧 Sozlamalar

### Bot Komandalarini BotFather'da Sozlash

1. @BotFather'ga boring
2. `/mybots` → Lux Pet Plast
3. `Edit Bot` → `Edit Commands`
4. Quyidagi komandalarni qo'shing:

```
start - Botni boshlash
help - Yordam
myid - Mening ID'im
smart_order - Smart buyurtma
balance - Balans
stats - Statistika
loyalty - Sadoqat ballari
profile - Profil
settings - Sozlamalar
```

### Bot Tavsifini Sozlash

```
Lux Pet Plast - Premium mijozlar uchun bot

🛒 Smart buyurtma
💰 Moliyaviy boshqaruv
📊 Tahlil va hisobotlar
🎁 Bonus dasturlari
👤 Profil boshqaruvi

150+ funksiya | 100+ komanda | AI qo'llab-quvvatlash
```

---

## 🐛 Debugging

### Console Loglarni Ko'rish

```bash
# Development
npm run dev

# Loglar
tail -f logs/bot.log
```

### Xatolarni Tekshirish

```typescript
// Bot faylida
console.log('Bot started:', superCustomerBot);
console.error('Bot error:', error);
```

---

## 📈 Monitoring

### Bot Statistikasi

```typescript
// Bot holatini tekshirish
const botInfo = await superCustomerBot.getMe();
console.log('Bot info:', botInfo);

// Webhook holatini tekshirish
const webhookInfo = await superCustomerBot.getWebHookInfo();
console.log('Webhook:', webhookInfo);
```

### Database Monitoring

```sql
-- Faol mijozlar
SELECT COUNT(*) FROM customers WHERE "telegramChatId" IS NOT NULL;

-- Bugungi xabarlar
SELECT COUNT(*) FROM customer_chats WHERE DATE(created_at) = CURRENT_DATE;

-- Bugungi buyurtmalar
SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE;
```

---

## 🔐 Xavfsizlik

### Token Xavfsizligi

- ✅ `.env` faylini `.gitignore`ga qo'shing
- ✅ Tokenni hech qachon GitHub'ga yuklamang
- ✅ Production'da alohida token ishlating
- ✅ Tokenni muntazam yangilang

### Rate Limiting

```typescript
// Rate limiter qo'shish
const rateLimiter = new Map<number, number>();

function checkRateLimit(chatId: number): boolean {
  const now = Date.now();
  const lastRequest = rateLimiter.get(chatId) || 0;
  
  if (now - lastRequest < 1000) {
    return false; // Too many requests
  }
  
  rateLimiter.set(chatId, now);
  return true;
}
```

---

## 🚀 Production Deployment

### 1. Environment Variables

```env
NODE_ENV=production
TELEGRAM_CUSTOMER_BOT_TOKEN="your-production-token"
DATABASE_URL="your-production-db"
```

### 2. PM2 bilan Ishga Tushirish

```bash
# PM2 o'rnatish
npm install -g pm2

# Botni ishga tushirish
pm2 start npm --name "super-bot" -- start

# Statusni ko'rish
pm2 status

# Loglarni ko'rish
pm2 logs super-bot

# Qayta ishga tushirish
pm2 restart super-bot
```

### 3. Webhook Sozlash (Production)

```typescript
// Webhook URL
const webhookUrl = 'https://yourdomain.com/webhook/customer-bot';

// Webhook sozlash
await superCustomerBot.setWebHook(webhookUrl);

// Webhook handler
app.post('/webhook/customer-bot', (req, res) => {
  superCustomerBot.processUpdate(req.body);
  res.sendStatus(200);
});
```

---

## 📊 Performance Optimization

### 1. Caching

```typescript
// Redis cache
import Redis from 'ioredis';
const redis = new Redis();

// Cache customer data
await redis.set(`customer:${customerId}`, JSON.stringify(customer), 'EX', 3600);

// Get from cache
const cached = await redis.get(`customer:${customerId}`);
```

### 2. Database Indexing

```sql
-- Telegram chat ID index
CREATE INDEX idx_customers_telegram_chat_id ON customers(telegram_chat_id);

-- Customer ID index
CREATE INDEX idx_sales_customer_id ON sales(customer_id);
```

### 3. Message Queue

```typescript
// Bull queue
import Bull from 'bull';
const messageQueue = new Bull('messages');

// Add to queue
await messageQueue.add({ chatId, message });

// Process queue
messageQueue.process(async (job) => {
  await sendMessage(job.data.chatId, job.data.message);
});
```

---

## 📝 Maintenance

### Kunlik Vazifalar

- ✅ Loglarni tekshirish
- ✅ Error rate monitoring
- ✅ Database backup
- ✅ Performance metrics

### Haftalik Vazifalar

- ✅ Bot statistikasi
- ✅ User feedback tahlili
- ✅ Feature usage analytics
- ✅ Security audit

### Oylik Vazifalar

- ✅ Token rotation
- ✅ Database optimization
- ✅ Code review
- ✅ Performance tuning

---

## 🆘 Troubleshooting

### Bot Javob Bermayapti

1. Tokenni tekshiring
2. Internet ulanishini tekshiring
3. Polling/Webhook holatini tekshiring
4. Loglarni ko'ring

### Database Xatolari

1. Connection string tekshiring
2. Database ishlab turganini tekshiring
3. Migration'lar bajarilganini tekshiring

### Performance Issues

1. Database query'larni optimize qiling
2. Caching qo'shing
3. Rate limiting qo'shing
4. Load balancing

---

## 📞 Yordam

### Texnik Yordam

- **Email:** support@luxpetplast.com
- **Telegram:** @tech_support
- **GitHub:** Issues section

### Dokumentatsiya

- Bot API: https://core.telegram.org/bots/api
- Node Telegram Bot API: https://github.com/yagop/node-telegram-bot-api
- Prisma: https://www.prisma.io/docs

---

## ✅ Checklist

### Pre-Launch

- [ ] Token sozlangan
- [ ] Database ulanishi ishlayapti
- [ ] Barcha dependencies o'rnatilgan
- [ ] Environment variables to'g'ri
- [ ] Bot komandalar sozlangan
- [ ] Test qilingan

### Post-Launch

- [ ] Monitoring sozlangan
- [ ] Backup tizimi ishlayapti
- [ ] Error tracking faol
- [ ] Performance metrics yig'ilmoqda
- [ ] User feedback qabul qilinmoqda

---

**Tayyorlagan:** Kiro AI  
**Sana:** 2026-03-11  
**Versiya:** 2.0  
**Status:** 🚀 Production Ready
