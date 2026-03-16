# 🔌 MCP Serverlarni Faollashtirish

## Hozirgi Holat

`.kiro/settings/mcp.json` da 6 ta MCP server sozlangan:

1. ✅ **github** - Sozlangan, API key kerak
2. ✅ **filesystem** - Tayyor, ishlatish mumkin
3. ⚠️ **postgres** - O'chirilgan, yoqish kerak
4. ⚠️ **sqlite** - O'chirilgan, yoqish kerak
5. ✅ **fetch** - Tayyor, ishlatish mumkin
6. ✅ **memory** - Tayyor, ishlatish mumkin

---

## 1️⃣ GitHub MCP - Repository Management

### Nima Qiladi?
- Repository management
- Pull requests va issues
- File operations
- Code search

### Faollashtirish:

**Qadam 1: GitHub Token Oling**
1. https://github.com/settings/tokens ga boring
2. "Generate new token (classic)" ni bosing
3. Quyidagi permissions tanlang:
   - `repo` (Full control of private repositories)
   - `read:org` (Read org and team membership)
   - `workflow` (Update GitHub Action workflows)
4. Token yarating va nusxalang

**Qadam 2: Token ni Sozlang**

`.kiro/settings/mcp.json` da:
```json
{
  "mcpServers": {
    "github": {
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here"  // Bu yerga token qo'ying
      },
      "disabled": false  // Allaqachon false
    }
  }
}
```

**Yoki Environment Variable:**
```bash
# Windows PowerShell
$env:GITHUB_TOKEN = "ghp_your_token_here"

# Windows CMD
set GITHUB_TOKEN=ghp_your_token_here

# Linux/Mac
export GITHUB_TOKEN=ghp_your_token_here
```

**Qadam 3: Kiro Restart**

**Ishlatish:**
```
"GitHub repolarimni ko'rsat"
"Pull request yaratib ber"
"Issue #123 ni ko'r"
```

---

## 2️⃣ Filesystem MCP - Enhanced File Operations

### Nima Qiladi?
- Enhanced file operations
- Directory listing
- File search
- Batch operations

### Faollashtirish:
✅ **Allaqachon faol!** Hech narsa qilish shart emas.

**Ishlatish:**
```
"Barcha .js fayllarni top"
"src/ papkasidagi fayllarni ko'rsat"
```

---

## 3️⃣ PostgreSQL MCP - Database Operations

### Nima Qiladi?
- Database queries
- Schema inspection
- Data manipulation
- Transaction management

### Faollashtirish:

**Qadam 1: PostgreSQL O'rnatilganligini Tekshiring**
```bash
psql --version
```

Agar yo'q bo'lsa: https://www.postgresql.org/download/

**Qadam 2: Connection String Sozlang**

`.kiro/settings/mcp.json` da:
```json
{
  "mcpServers": {
    "postgres": {
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://username:password@localhost:5432/database_name"
      },
      "disabled": false  // true dan false ga o'zgartiring
    }
  }
}
```

**Misol:**
```
postgresql://myuser:mypassword@localhost:5432/mydb
```

**Qadam 3: Kiro Restart**

**Ishlatish:**
```
"Users jadvalidan ma'lumot ol"
"Database schema ko'rsat"
"SELECT * FROM products WHERE price > 100"
```

---

## 4️⃣ SQLite MCP - Local Database

### Nima Qiladi?
- SQLite database operations
- Local database management
- Query execution

### Faollashtirish:

**Qadam 1: Database Fayl Yo'lini Sozlang**

`.kiro/settings/mcp.json` da:
```json
{
  "mcpServers": {
    "sqlite": {
      "args": ["mcp-server-sqlite", "--db-path", "C:/Users/YourName/Desktop/New folder/database.db"],
      "disabled": false  // true dan false ga o'zgartiring
    }
  }
}
```

**Yoki loyiha ichida:**
```json
{
  "args": ["mcp-server-sqlite", "--db-path", "${workspaceFolder}/database.db"]
}
```

**Qadam 2: Kiro Restart**

**Ishlatish:**
```
"SQLite database yaratib ber"
"Jadvallarni ko'rsat"
"Ma'lumot qo'sh"
```

---

## 5️⃣ Fetch MCP - HTTP Requests

### Nima Qiladi?
- HTTP requests
- API calls
- Web scraping
- Data fetching

### Faollashtirish:
✅ **Allaqachon faol!** Hech narsa qilish shart emas.

**Ishlatish:**
```
"Bu API ga request yubor: https://api.example.com/data"
"JSON data fetch qil"
"Bu URL dan ma'lumot ol"
```

---

## 6️⃣ Memory MCP - Persistent Memory

### Nima Qiladi?
- Persistent memory
- Session data storage
- Context preservation
- Long-term information storage

### Faollashtirish:
✅ **Allaqachon faol!** Hech narsa qilish shart emas.

**Ishlatish:**
```
"Bu ma'lumotni eslab qol: [data]"
"Avval nima eslab qolgan edingiz?"
"Memory'dan user_preferences ni ol"
```

---

## ⚡ Tezkor Faollashtirish

### Minimal Setup (Hozir Ishlatish Mumkin):
- ✅ **filesystem** - Tayyor
- ✅ **fetch** - Tayyor
- ✅ **memory** - Tayyor

### GitHub Setup (5 daqiqa):
1. GitHub token oling
2. `.kiro/settings/mcp.json` da token qo'ying
3. Kiro restart

### PostgreSQL Setup (Agar kerak bo'lsa):
1. PostgreSQL o'rnating
2. Connection string sozlang
3. `disabled: false` qiling
4. Kiro restart

### SQLite Setup (Agar kerak bo'lsa):
1. Database fayl yo'lini sozlang
2. `disabled: false` qiling
3. Kiro restart

---

## 🔧 Sozlash Qo'llanmasi

### MCP Config Fayl Joylashuvi:
```
.kiro/settings/mcp.json
```

### Serverlarni Yoqish/O'chirish:
```json
{
  "disabled": false  // Yoqish
  "disabled": true   // O'chirish
}
```

### Kiro Restart:
1. Kiro'ni yoping
2. Qayta oching
3. Yoki: MCP Server view → Reconnect

---

## 🎯 Tavsiya Etilgan Setup

### Har Bir Developer Uchun:
- ✅ **filesystem** - File operations
- ✅ **fetch** - API calls
- ✅ **memory** - Context preservation
- ✅ **github** - Repository management

### Backend Developers Uchun:
- ✅ **postgres** - Database operations
- ✅ **sqlite** - Local testing

### Frontend Developers Uchun:
- ✅ **fetch** - API testing
- ✅ **memory** - State management

---

## 🐛 Troubleshooting

### MCP Server Ishlamayapti

**1. Config Tekshirish:**
```json
// .kiro/settings/mcp.json
{
  "disabled": false,  // false ekanligini tekshiring
  "command": "uvx",   // To'g'ri command
  "args": [...]       // To'g'ri args
}
```

**2. UV/UVX O'rnatilganligini Tekshiring:**
```bash
uvx --version
```

Agar yo'q bo'lsa:
```bash
# Windows PowerShell
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Yoki pip orqali
pip install uv
```

**3. Kiro Restart:**
- Kiro'ni to'liq yoping
- Qayta oching

**4. MCP Server View:**
- Kiro'da MCP Server view ni oching
- Reconnect tugmasini bosing

### GitHub Token Ishlamayapti

**Tekshirish:**
1. Token to'g'ri nusxalanganmi?
2. Token permissions to'g'rimi? (`repo`, `read:org`)
3. Token expired bo'lmaganmi?

**Yangi Token:**
https://github.com/settings/tokens

### PostgreSQL Connection Error

**Tekshirish:**
1. PostgreSQL ishlab turibdimi?
   ```bash
   psql -U username -d database_name
   ```
2. Connection string to'g'rimi?
   ```
   postgresql://user:pass@host:port/dbname
   ```
3. Firewall bloklayaptimi?

---

## 📊 Hozirgi Holat

**Faol MCP Serverlar:**
- ✅ filesystem (3 ta tool)
- ✅ fetch (HTTP requests)
- ✅ memory (Persistent storage)

**Sozlash Kerak:**
- ⚠️ github (Token kerak)
- ⚠️ postgres (Connection string + yoqish)
- ⚠️ sqlite (DB path + yoqish)

---

## 🚀 Keyingi Qadamlar

### 1. GitHub Token Sozlang (Tavsiya)
```
5 daqiqa - Eng foydali MCP server
```

### 2. PostgreSQL Yoqing (Agar kerak bo'lsa)
```
Faqat database bilan ishlaydigan loyihalar uchun
```

### 3. SQLite Yoqing (Agar kerak bo'lsa)
```
Local testing uchun
```

---

## 💡 Pro Tip

**Barcha serverlarni bir vaqtda yoqmang!**
- Faqat kerakli serverlarni yoqing
- Performance yaxshi bo'ladi
- Kam confusion

**Tavsiya:**
1. Boshlang: filesystem, fetch, memory
2. Keyin: github (agar GitHub bilan ishlasangiz)
3. Oxirida: postgres/sqlite (agar database kerak bo'lsa)

---

**Eslatma:** MCP serverlar Kiro'ning eng kuchli funksiyasi. Lekin faqat kerakli serverlarni yoqing!

🎯 **Qaysi serverni birinchi yoqmoqchisiz?**
