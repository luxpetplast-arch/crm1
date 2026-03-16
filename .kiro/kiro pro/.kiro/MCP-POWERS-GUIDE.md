# 🔌 MCP Powers - Tashqi Servislar Integratsiyasi

## O'rnatilgan Powers (5 ta)

### 1. 🎨 **Figma Power**
**Nima qiladi:**
- Figma dizayndan avtomatik kod generatsiya
- Design system yaratish
- Component mapping (Figma → Code)
- UI implementation

**Qachon ishlatish:**
```
"Figma fayldan component yaratib ber"
"Bu Figma URL dan kod generatsiya qil: [URL]"
"Design system rules yaratib ber"
```

**Faollashtirish:**
```
Figma bilan ishlashni boshlamoqchiman
```

---

### 2. 📮 **Postman Power**
**Nima qiladi:**
- API testing avtomatlashtirish
- Collection yaratish va boshqarish
- Environment sozlash
- Test scriptlar yozish

**Qachon ishlatish:**
```
"Postman collection yaratib ber"
"API testlarni avtomatlashtir"
"REST API uchun test suite yarat"
```

**Faollashtirish:**
```
Postman bilan API test qilmoqchiman
```

---

### 3. 🌐 **Netlify Deployment Power**
**Nima qiladi:**
- React, Next.js, Vue deploy qilish
- Avtomatik build va deploy
- Global CDN
- Environment variables sozlash

**Qachon ishlatish:**
```
"Loyihamni Netlify ga deploy qil"
"Production environment sozla"
"Deploy status tekshir"
```

**Faollashtirish:**
```
Netlify ga deploy qilmoqchiman
```

---

### 4. ☁️ **AWS Cost Optimization Power**
**Nima qiladi:**
- AWS xarajatlarni tahlil qilish
- Cost optimization takliflari
- Budget management
- Rightsizing recommendations

**Qachon ishlatish:**
```
"AWS xarajatlarimni tahlil qil"
"Cost optimization takliflari ber"
"Budget alert sozla"
```

**Faollashtirish:**
```
AWS cost optimization kerak
```

---

### 5. 📊 **AWS MSK Express Broker Power**
**Nima qiladi:**
- Amazon MSK (Kafka) bilan ishlash
- Broker yaratish va boshqarish
- Monitoring va troubleshooting
- Best practices

**Qachon ishlatish:**
```
"MSK broker yaratib ber"
"Kafka monitoring sozla"
"MSK troubleshooting"
```

**Faollashtirish:**
```
AWS MSK bilan ishlashni boshlamoqchiman
```

---

## Qo'shimcha Powers (O'rnatish Mumkin)

### Database Powers
- **PostgreSQL MCP** - Database bilan to'g'ridan-to'g'ri ishlash
- **MongoDB MCP** - NoSQL operations
- **Redis MCP** - Caching va session management

### Development Tools
- **GitHub MCP** - Repository management, PR, Issues
- **GitLab MCP** - CI/CD, merge requests
- **Jira MCP** - Task management

### Cloud Providers
- **AWS Full Suite** - EC2, S3, Lambda, RDS, etc.
- **Google Cloud** - GCP services
- **Azure** - Microsoft cloud services

### AI & ML
- **OpenAI MCP** - GPT models integration
- **Anthropic MCP** - Claude integration
- **Hugging Face** - ML models

### Monitoring & Analytics
- **Datadog MCP** - Monitoring va logging
- **Sentry MCP** - Error tracking
- **Google Analytics** - Analytics integration

---

## Power Ishlatish

### 1. Power Faollashtirish
```
[Power nomi] bilan ishlashni boshlamoqchiman
```

Misol:
```
Figma bilan ishlashni boshlamoqchiman
```

### 2. To'g'ridan-to'g'ri Ishlatish
```
[Vazifa] - [Power nomi] ishlatib
```

Misol:
```
API testlarni avtomatlashtir - Postman ishlatib
```

### 3. Avtomatik Aniqlash
Men avtomatik tushunaman:
- Figma URL ko'rsangiz → Figma power
- AWS haqida gaplashsangiz → AWS powers
- Deploy deyilsa → Netlify power

---

## Power Sozlash

### MCP Config Fayl
**Joylashuv:** `.kiro/settings/mcp.json`

**Misol:**
```json
{
  "mcpServers": {
    "github": {
      "command": "uvx",
      "args": ["mcp-server-github"],
      "env": {
        "GITHUB_TOKEN": "your_token_here"
      },
      "disabled": false,
      "autoApprove": ["list_repos", "get_file"]
    }
  }
}
```

### Power O'rnatish
1. Command Palette → "Configure Powers"
2. Yoki men bilan:
   ```
   "GitHub power o'rnatmoqchiman"
   ```

---

## Hooks + Powers Kombinatsiyasi

### Deploy Hook
```json
{
  "name": "Auto Deploy to Netlify",
  "version": "1.0.0",
  "when": {
    "type": "userTriggered"
  },
  "then": {
    "type": "askAgent",
    "prompt": "Netlify power ishlatib loyihani deploy qil"
  }
}
```

### API Test Hook
```json
{
  "name": "Run Postman Tests",
  "version": "1.0.0",
  "when": {
    "type": "postTaskExecution"
  },
  "then": {
    "type": "askAgent",
    "prompt": "Postman power ishlatib API testlarni ishga tushir"
  }
}
```

---

## Real Workflow Misollari

### 1. Figma → Code → Deploy
```
1. "Figma URL dan component yarat: [URL]"
2. Code review agent ishlaydi
3. "Netlify ga deploy qil"
```

### 2. API Development
```
1. API kod yozish
2. "Postman collection yaratib test qil"
3. Security auditor tekshiradi
4. Deploy
```

### 3. AWS Cost Monitoring
```
1. "AWS xarajatlarimni tahlil qil"
2. Hook: Har hafta cost report
3. Optimization takliflari
```

---

## Yangi Power O'rnatish

### Qo'lda
```
Command Palette → "Configure Powers"
```

### Men Bilan
```
"[Power nomi] o'rnatmoqchiman"
```

Misol:
```
"GitHub power o'rnatmoqchiman"
"PostgreSQL bilan ishlash kerak"
```

---

## Troubleshooting

### Power Ishlamayapti

1. **Config tekshirish:**
   ```
   .kiro/settings/mcp.json ni tekshir
   ```

2. **Restart:**
   - MCP Server view → Reconnect
   - Yoki Kiro restart

3. **Yordam:**
   ```
   "[Power nomi] ishlamayapti"
   ```

### Token/API Key Kerak

Ba'zi powerlar API key talab qiladi:
```json
{
  "env": {
    "API_KEY": "your_key_here",
    "TOKEN": "your_token_here"
  }
}
```

---

## Best Practices

### ✅ Do
- Kerakli powerlarni o'rnating
- API keylarni environment variable sifatida saqlang
- AutoApprove faqat xavfsiz toollar uchun
- Powerlarni hook bilan birlashtiring

### ❌ Don't
- API keylarni hardcode qilmang
- Barcha powerlarni bir vaqtda o'rnatmang
- Ishlatmaydigan powerlarni o'chirib qo'ying

---

## Keyingi Qadamlar

1. **Kerakli powerni tanlang**
2. **Men bilan gaplashing:**
   ```
   "[Power nomi] bilan ishlashni boshlamoqchiman"
   ```
3. **Workflow yarating**

---

**Eslatma:** Powers - bu Kiro'ning eng kuchli funksiyasi. Tashqi servislar bilan to'g'ridan-to'g'ri ishlash imkonini beradi!

🚀 **Qaysi power bilan boshlaysiz?**
