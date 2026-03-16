# 🚀 RENDER.COM GA DEPLOY QILISH

## 📋 Tayyorgarlik

### 1. GitHub Repository
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/aziztrades-erp.git
git push -u origin main
```

### 2. Render.com Account
1. https://render.com ga kiring
2. GitHub bilan bog'lang
3. Repository tanlang

---

## 🗄️ DATABASE SETUP

### PostgreSQL Database Yaratish

1. Render Dashboard → **New** → **PostgreSQL**
2. Settings:
   - **Name:** `aziztrades-db`
   - **Database:** `aziztrades_erp`
   - **User:** `aziztrades_user`
   - **Region:** Frankfurt (yoki yaqin)
   - **Plan:** Free

3. **Create Database** tugmasini bosing

4. Database URL ni nusxalang:
```
postgresql://user:password@host:5432/database
```

---

## 🔧 BACKEND API SETUP

### Web Service Yaratish

1. Render Dashboard → **New** → **Web Service**
2. Repository tanlang
3. Settings:

**Basic:**
- **Name:** `aziztrades-api`
- **Region:** Frankfurt
- **Branch:** main
- **Root Directory:** (bo'sh qoldiring)
- **Runtime:** Node
- **Build Command:**
```bash
npm install && npm run build && npm run db:generate && npm run db:push
```
- **Start Command:**
```bash
npm start
```

**Advanced:**
- **Plan:** Free
- **Health Check Path:** `/api/health`
- **Auto-Deploy:** Yes

**Environment Variables:**
```
NODE_ENV=production
PORT=5000
DATABASE_URL=<Yuqorida nusxalangan URL>
JWT_SECRET=<Generate qiling>
USD_TO_UZS_RATE=12500
TELEGRAM_BOT_TOKEN=<Bot token>
TELEGRAM_ADMIN_CHAT_ID=<Admin chat ID>
```

4. **Create Web Service** tugmasini bosing

---

## 🎨 FRONTEND SETUP

### Static Site Yaratish

1. Render Dashboard → **New** → **Static Site**
2. Repository tanlang
3. Settings:

**Basic:**
- **Name:** `aziztrades-frontend`
- **Region:** Frankfurt
- **Branch:** main
- **Build Command:**
```bash
npm install && npm run build
```
- **Publish Directory:** `dist`

**Environment Variables:**
```
VITE_API_URL=https://aziztrades-api.onrender.com
```

4. **Create Static Site** tugmasini bosing

---

## 🔐 ENVIRONMENT VARIABLES

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
USD_TO_UZS_RATE=12500
TELEGRAM_BOT_TOKEN=8533381135:AAHyt5WHo9OwOu04sEHfleCbWSZRGNNaKSU
TELEGRAM_ADMIN_CHAT_ID=your-telegram-chat-id
```

### Frontend (.env)
```env
VITE_API_URL=https://aziztrades-api.onrender.com
```

---

## 🧪 TEST QILISH

### 1. Backend Health Check
```bash
curl https://aziztrades-api.onrender.com/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-03-08T..."
}
```

### 2. Frontend
Brauzerda oching:
```
https://aziztrades-frontend.onrender.com
```

### 3. Login Test
```
Email: admin@aziztrades.com
Password: admin123
```

---

## 📊 DATABASE MIGRATION

### Prisma Migrate
```bash
# Local
npm run db:push

# Render (avtomatik build da)
npm run db:generate && npm run db:push
```

### Seed Data
```bash
# Local
npm run db:seed

# Render (manual)
# Render Shell da:
npm run db:seed
```

---

## 🤖 TELEGRAM BOT SETUP

### 1. Bot Token Olish
1. Telegram da @BotFather ga yozing
2. `/newbot` komandasi
3. Bot nomi va username kiriting
4. Token ni nusxalang

### 2. Admin Chat ID
1. @userinfobot ga yozing
2. `/start` komandasi
3. Chat ID ni nusxalang

### 3. Webhook Sozlash
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://aziztrades-api.onrender.com/api/bot/webhook"}'
```

---

## 🔄 AUTO-DEPLOY

### GitHub Push
```bash
git add .
git commit -m "Update"
git push origin main
```

Render avtomatik deploy qiladi:
1. Build boshlandi
2. Tests o'tkaziladi
3. Deploy qilinadi
4. Health check
5. Live!

---

## 📈 MONITORING

### Render Dashboard
- **Logs:** Real-time logs
- **Metrics:** CPU, Memory, Requests
- **Events:** Deploy history

### Health Checks
```bash
# Backend
curl https://aziztrades-api.onrender.com/api/health

# Database
psql $DATABASE_URL -c "SELECT 1"
```

---

## 🐛 TROUBLESHOOTING

### Build Failed
```bash
# Check logs
# Render Dashboard → Service → Logs

# Common issues:
- Node version mismatch
- Missing dependencies
- TypeScript errors
```

### Database Connection Error
```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT version()"
```

### Frontend 404 Error
```bash
# Check vite.config.ts
# Ensure proxy is correct

# Check VITE_API_URL
echo $VITE_API_URL
```

---

## 💰 PRICING

### Free Tier Limits
- **Web Service:** 750 hours/month
- **PostgreSQL:** 1GB storage, 90 days retention
- **Static Site:** 100GB bandwidth/month
- **Sleep after 15 min inactivity**

### Upgrade Options
- **Starter:** $7/month (no sleep)
- **Standard:** $25/month (more resources)
- **Pro:** $85/month (dedicated)

---

## 🔒 SECURITY

### Best Practices
1. ✅ Strong JWT_SECRET (min 32 characters)
2. ✅ HTTPS only
3. ✅ Environment variables (never commit)
4. ✅ CORS configured
5. ✅ Rate limiting
6. ✅ Input validation

### SSL Certificate
Render avtomatik SSL sertifikat beradi (Let's Encrypt)

---

## 📞 SUPPORT

### Render Support
- Docs: https://render.com/docs
- Community: https://community.render.com
- Status: https://status.render.com

### Project Support
- GitHub Issues
- Email: support@aziztrades.com

---

## 🎯 NEXT STEPS

1. ✅ Deploy backend
2. ✅ Deploy frontend
3. ✅ Setup database
4. ✅ Configure environment variables
5. ✅ Test all features
6. ✅ Setup Telegram bot
7. ✅ Monitor logs
8. ✅ Add custom domain (optional)

---

**Muvaffaqiyatli deploy! 🎉**

*Yaratilgan: 2026-03-08*
