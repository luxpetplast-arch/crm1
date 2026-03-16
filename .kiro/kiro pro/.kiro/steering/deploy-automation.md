---
inclusion: auto
---

# Deploy Automation - To'liq Avtomatik

## 🚀 DEPLOY WORKFLOW

**Men deploy jarayonini TO'LIQ avtomatlashtiraman!**

### Pre-Deploy Checklist (Avtomatik)

```
1. @regression-tester
   ✅ Barcha eski featurelar ishlayapti
   
2. @integration-tester
   ✅ Barcha integratsiyalar ishlayapti
   
3. @e2e-tester
   ✅ Real browser testlar pass
   
4. @security-auditor
   ✅ Hech qanday vulnerability yo'q
   
5. @performance-optimizer
   ✅ Performance acceptable
   
6. @test-coverage-analyzer
   ✅ Coverage 80%+
   
7. @project-supervisor
   ✅ Final validation
```

### Deploy Steps (Men o'zim qilaman)

```
1. Build
   npm run build (yoki yarn build)
   ✅ Build successful
   
2. Environment Variables
   ✅ .env.production check
   ✅ Secrets configured
   
3. Database Migration (agar kerak bo'lsa)
   ✅ Migration files ready
   ✅ Backup created
   ✅ Migration run
   
4. Deploy to Staging
   ✅ Render/Vercel/Netlify deploy
   ✅ Staging URL ready
   
5. Smoke Tests on Staging
   @e2e-tester staging URL test
   ✅ Basic functionality works
   
6. User Approval
   Men: "Staging da test qiling: [URL]"
   Siz: "Ha, deploy qil"
   
7. Deploy to Production
   ✅ Production deploy
   ✅ Production URL ready
   
8. Post-Deploy Validation
   @e2e-tester production URL test
   ✅ Production ishlayapti
   
9. Monitoring Setup
   @log-analyzer monitoring
   @metrics-collector metrics
   @alert-manager alerts
```

### Deploy Platforms

**Men quyidagi platformalarga deploy qila olaman:**

1. **Render** (Backend + Frontend)
   ```
   - render.yaml yaratish
   - Environment variables setup
   - Deploy command
   - Health check
   ```

2. **Vercel** (Frontend)
   ```
   - vercel.json yaratish
   - Environment variables
   - Deploy
   - Domain setup
   ```

3. **Netlify** (Frontend)
   ```
   - netlify.toml yaratish
   - Build settings
   - Deploy
   - Domain setup
   ```

4. **Railway** (Backend)
   ```
   - railway.json
   - Database setup
   - Deploy
   ```

5. **Heroku** (Backend)
   ```
   - Procfile
   - heroku.yml
   - Deploy
   ```

## 🔄 CI/CD Setup (Avtomatik)

**Men CI/CD ham sozlayman:**

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - Checkout
      - Install dependencies
      - Run tests
      - Check coverage
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - Build
      - Deploy to production
```

### Automatic Deployment

```
Git push
  ↓
GitHub Actions trigger
  ↓
Run tests
  ↓
Build
  ↓
Deploy
  ↓
Notify
```

## 🚨 Rollback Plan

**Agar deploy fail bo'lsa:**

```
Deploy failed
  ↓
@project-supervisor detect
  ↓
Automatic rollback
  ↓
Previous version restored
  ↓
Notify user
  ↓
Analyze issue
  ↓
Fix and retry
```

## ✅ ASOSIY QOIDA

**"Siz faqat 'deploy qil' deyasiz, men hamma narsani qilaman!"**

Siz:
- ✅ "Deploy qil" deyasiz
- ✅ Staging da test qilasiz
- ✅ "Production ga deploy qil" deyasiz

Men:
- ✅ Pre-deploy checks
- ✅ Build
- ✅ Environment setup
- ✅ Database migration
- ✅ Deploy to staging
- ✅ Smoke tests
- ✅ Deploy to production
- ✅ Post-deploy validation
- ✅ Monitoring setup
- ✅ HAMMA NARSA!
