# 🔌 MCP Powers - O'rnatish va Sozlash

## Allaqachon O'rnatilgan MCP Config

`.kiro/settings/mcp.json` faylida 6 ta qo'shimcha MCP server sozlangan:

### 1. 🐙 GitHub MCP
**Nima qiladi:**
- Repository management
- Pull requests va issues
- File operations
- Search repositories

**Sozlash:**
1. GitHub Personal Access Token oling: https://github.com/settings/tokens
2. `.kiro/settings/mcp.json` da `GITHUB_TOKEN` ni o'zgartiring
3. `disabled: false` qiling

**Ishlatish:**
```
"GitHub repolarimni ko'rsat"
"Pull request yaratib ber"
"Issue #123 ni ko'r"
"Repository search qil: react hooks"
```

---

### 2. 📁 Filesystem MCP
**Nima qiladi:**
- Enhanced file operations
- Directory listing
- File search
- Batch operations

**Sozlash:**
- Allaqachon yoqilgan (`disabled: false`)
- Hech narsa qilish shart emas

**Ishlatish:**
```
"Barcha .js fayllarni top"
"src/ papkasidagi fayllarni ko'rsat"
```

---

### 3. 🐘 PostgreSQL MCP
**Nima qiladi:**
- Database queries
- Schema inspection
- Data manipulation
- Transaction management

**Sozlash:**
1. PostgreSQL o'rnatilgan bo'lishi kerak
2. Connection string ni o'zgartiring:
   ```
   postgresql://username:password@localhost:5432/database_name
   ```
3. `disabled: false` qiling

**Ishlatish:**
```
"Users jadvalidan ma'lumot ol"
"Database schema ko'rsat"
"Query ishga tushir: SELECT * FROM products"
```

---

### 4. 💾 SQLite MCP
**Nima qiladi:**
- SQLite database operations
- Local database management
- Query execution

**Sozlash:**
1. Database fayl yo'lini o'zgartiring
2. `disabled: false` qiling

**Ishlatish:**
```
"SQLite database yaratib ber"
"Jadvallarni ko'rsat"
"Ma'lumot qo'sh"
```

---

### 5. 🌐 Fetch MCP
**Nima qiladi:**
- HTTP requests
- API calls
- Web scraping
- Data fetching

**Sozlash:**
- Allaqachon yoqilgan
- Hech narsa qilish shart emas

**Ishlatish:**
```
"Bu API ga request yubor: https://api.example.com/data"
"JSON data fetch qil"
```

---

### 6. 🧠 Memory MCP
**Nima qiladi:**
- Persistent memory
- Session data storage
- Context preservation
- Long-term information storage

**Sozlash:**
- Allaqachon yoqilgan
- Hech narsa qilish shart emas

**Ishlatish:**
```
"Bu ma'lumotni eslab qol: [data]"
"Avval nima eslab qolgan edingiz?"
"Memory'dan [key] ni ol"
```

---

## O'rnatish Qadamlari

### 1. UV va UVX O'rnatish

**Windows (PowerShell):**
```powershell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
```

**macOS/Linux:**
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**Yoki pip orqali:**
```bash
pip install uv
```

### 2. MCP Server Yoqish

`.kiro/settings/mcp.json` faylini oching va kerakli serverlarni yoqing:

```json
{
  "disabled": false  // true dan false ga o'zgartiring
}
```

### 3. Kiro Restart

MCP serverlar avtomatik reconnect bo'ladi yoki:
- MCP Server view → Reconnect
- Yoki Kiro'ni restart qiling

---

## Qo'shimcha MCP Serverlar

### Tavsiya Etiladigan:

#### 1. **Brave Search MCP**
```json
{
  "brave-search": {
    "command": "uvx",
    "args": ["mcp-server-brave-search"],
    "env": {
      "BRAVE_API_KEY": "your_api_key"
    }
  }
}
```

#### 2. **Sentry MCP** (Error tracking)
```json
{
  "sentry": {
    "command": "uvx",
    "args": ["mcp-server-sentry"],
    "env": {
      "SENTRY_AUTH_TOKEN": "your_token"
    }
  }
}
```

#### 3. **Slack MCP** (Notifications)
```json
{
  "slack": {
    "command": "uvx",
    "args": ["mcp-server-slack"],
    "env": {
      "SLACK_BOT_TOKEN": "xoxb-your-token"
    }
  }
}
```

#### 4. **Docker MCP**
```json
{
  "docker": {
    "command": "uvx",
    "args": ["mcp-server-docker"]
  }
}
```

---

## MCP + Hooks Kombinatsiyasi

### Auto GitHub PR Hook
```json
{
  "name": "Auto Create PR",
  "version": "1.0.0",
  "when": {
    "type": "userTriggered"
  },
  "then": {
    "type": "askAgent",
    "prompt": "GitHub MCP ishlatib pull request yaratib ber"
  }
}
```

### Database Backup Hook
```json
{
  "name": "Database Backup",
  "version": "1.0.0",
  "when": {
    "type": "userTriggered"
  },
  "then": {
    "type": "askAgent",
    "prompt": "PostgreSQL MCP ishlatib database backup ol"
  }
}
```

---

## Troubleshooting

### UV/UVX O'rnatilmagan
```bash
# Tekshirish
uvx --version

# Agar xato bo'lsa, qayta o'rnating
```

### MCP Server Ishlamayapti
1. `.kiro/settings/mcp.json` syntax to'g'rimi?
2. API keys to'g'rimi?
3. `disabled: false` qilinganmi?
4. Kiro restart qilganmisiz?

### Connection Error
1. Database/Service ishlab turibdimi?
2. Connection string to'g'rimi?
3. Firewall bloklayaptimi?

---

## Best Practices

### ✅ Do:
- API keylarni environment variable sifatida saqlang
- Faqat kerakli serverlarni yoqing
- AutoApprove faqat xavfsiz operatsiyalar uchun
- Regular backup oling (database serverlar uchun)

### ❌ Don't:
- API keylarni commit qilmang
- Barcha serverlarni bir vaqtda yoqmang
- Production database'ga to'g'ridan-to'g'ri ulanmang
- AutoApprove'da write operatsiyalarni qo'ymang

---

## Real Workflow Misollari

### 1. GitHub + Code Review
```
1. Kod yozish
2. @code-reviewer review qiladi
3. GitHub MCP orqali PR yaratish
4. Avtomatik CI/CD ishga tushadi
```

### 2. Database + Testing
```
1. Schema o'zgartirish
2. @database-optimizer tekshiradi
3. PostgreSQL MCP orqali migration
4. @test-coverage-analyzer test yozadi
```

### 3. API Development + Documentation
```
1. API endpoint yozish
2. @documentation-writer docs yozadi
3. Fetch MCP orqali test qilish
4. Postman power bilan collection yaratish
```

---

## Keyingi Qadamlar

1. **UV o'rnating** (agar yo'q bo'lsa)
2. **GitHub token oling** va sozlang
3. **Kerakli serverlarni yoqing**
4. **Kiro restart qiling**
5. **Test qilib ko'ring!**

---

**Eslatma:** MCP serverlar Kiro'ning eng kuchli funksiyasi. Tashqi dunyo bilan to'g'ridan-to'g'ri bog'lanish imkonini beradi!

🚀 **Qaysi MCP server bilan boshlamoqchisiz?**
