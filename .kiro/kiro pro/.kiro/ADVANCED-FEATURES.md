# 🎯 Kiro Advanced Features - Ilg'or Imkoniyatlar

## 1. 🧠 Context Management

### #File va #Folder
Men fayllarni kontekstga qo'shish uchun:
```
#src/auth.js faylini ko'rib chiq
#components papkasidagi barcha fayllarni tahlil qil
```

### #Problems
Joriy fayldagi muammolarni ko'rish:
```
#Problems ni ko'rib chiq va tuzat
```

### #Terminal
Terminal outputni ko'rish:
```
#Terminal da nima xato?
```

### #Git Diff
O'zgarishlarni ko'rish:
```
#Git Diff ni ko'rib chiq
```

---

## 2. 📝 Spec Mode - Murakkab Loyihalar

### Spec Nima?
Katta funksiyalarni bosqichma-bosqich rejalashtirish va amalga oshirish.

### Spec Yaratish
```
"E-commerce loyiha uchun spec yaratib ber:
1. User authentication
2. Product catalog
3. Shopping cart
4. Payment integration
5. Order management"
```

### Spec Workflow
```
1. Requirements → Design → Tasks
2. Har bir task alohida
3. Incremental development
4. Control va feedback
```

### Spec File Format
```markdown
# Feature: User Authentication

## Requirements
- JWT token based auth
- Email/password login
- Social login (Google, GitHub)
- Password reset

## Design
[Architecture decisions]

## Tasks
- [ ] Task 1: Setup JWT
- [ ] Task 2: Login endpoint
- [ ] Task 3: Register endpoint
```

### Spec Hooks
```json
{
  "name": "Test After Spec Task",
  "when": {
    "type": "postTaskExecution"
  },
  "then": {
    "type": "runCommand",
    "command": "npm test"
  }
}
```

---

## 3. 🎨 Steering Files - Advanced

### File References
Steering fileda boshqa fayllarni reference qilish:
```markdown
API design qoidalari:

#[[file:openapi.yaml]]
#[[file:docs/api-guidelines.md]]
```

### Conditional Inclusion
Faqat ma'lum fayllar ochilganda:
```yaml
---
inclusion: fileMatch
fileMatchPattern: 'api/**/*.js'
---

# API Development Guidelines
[API specific rules]
```

### Manual Inclusion
Faqat kerak bo'lganda:
```yaml
---
inclusion: manual
---

# Advanced Performance Tuning
[Complex optimization strategies]
```

Ishlatish:
```
#AdvancedPerformance ni qo'sh
```

---

## 4. 🤖 Custom Agents - Advanced

### Agent Presets
Bir agent, turli xil rejimlar:

```yaml
---
name: api-developer
presets:
  - rest-api
  - graphql-api
  - grpc-api
---
```

Ishlatish:
```
@api-developer:rest-api endpoint yaratib ber
@api-developer:graphql-api schema yoz
```

### Agent Tool Access
```yaml
---
name: database-admin
tools: ["read", "write", "shell"]
---
```

### Agent Chaining
Bir agent boshqa agentni chaqiradi:
```
@code-reviewer → @security-auditor → @performance-optimizer
```

---

## 5. 🔄 Advanced Hooks

### PreToolUse Hook - Access Control
```json
{
  "name": "Database Write Protection",
  "when": {
    "type": "preToolUse",
    "toolTypes": ["write"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Agar database migration bo'lsa, backup olganingni tekshir"
  }
}
```

### Tool Type Filtering
```json
{
  "toolTypes": ["write"]  // Faqat write operations
}
```

```json
{
  "toolTypes": [".*sql.*"]  // SQL bilan bog'liq barcha toollar (regex)
}
```

### Hook Timeout
```json
{
  "then": {
    "type": "runCommand",
    "command": "npm run long-test",
    "timeout": 300000  // 5 minutes
  }
}
```

---

## 6. 🌐 Internet Access

### Web Search
```
"React 19 ning yangi featurelari nima?"
"Next.js 15 documentation topib ber"
```

Men avtomatik web search qilaman va eng yangi ma'lumot beraman.

### Web Fetch
```
"Bu URL dagi dokumentatsiyani o'qi: https://..."
"Bu article dan code example ol"
```

### Best Practices
- Har doim source link beraman
- 30 so'zdan ko'p to'g'ridan-to'g'ri quote qilmayman
- Content rephrased bo'ladi

---

## 7. 🔧 Diagnostics va Debugging

### getDiagnostics
Avtomatik syntax, lint, type errorlarni topish:
```
"src/auth.js da errorlar bormi?"
```

Men avtomatik:
- Syntax errors
- Type errors
- Lint warnings
- Semantic issues

### Smart Debugging
```
"Bu error nima: [error message]"
"Stack trace tahlil qil"
"Bug fix qil va test yoz"
```

---

## 8. 📦 Code Intelligence

### readCode
AST-based code analysis:
```
"UserService class ni tahlil qil"
"login funksiyasini ko'rsat"
"UserController.authenticate metodini o'qi"
```

### editCode
AST-based editing:
```javascript
// Funksiya replace
operation: "replace_node"
selector: "functionName"

// Class ichiga insert
operation: "insert_node"
selector: "ClassName"

// Method delete
operation: "delete_node"
selector: "ClassName.methodName"
```

### semanticRename
Barcha referencelar bilan rename:
```
"getUserData funksiyasini fetchUserData ga o'zgartir"
```

### smartRelocate
File move + import updates:
```
"auth.js ni src/services/ ga ko'chir"
```

---

## 9. 🚀 Parallel Operations

### Multiple Tool Calls
Men bir vaqtda bir nechta operatsiya qila olaman:
```
- 3 ta faylni bir vaqtda o'qish
- Parallel code edits
- Multiple diagnostics check
```

### Sub-Agent Parallelization
```
@code-reviewer + @security-auditor + @performance-optimizer
```

Uchala agent parallel ishlaydi!

---

## 10. 🎭 Autopilot vs Supervised Mode

### Autopilot Mode
- Men avtomatik fayllarni o'zgartiraman
- Tezroq development
- Ishonchli vazifalar uchun

### Supervised Mode
- Har bir o'zgarishni ko'rib chiqasiz
- Revert qilish imkoniyati
- Muhim o'zgarishlar uchun

---

## 11. 🔐 Security Best Practices

### Secrets Management
```
# ❌ Hech qachon
const apiKey = "sk_live_123";

# ✅ Har doim
const apiKey = process.env.API_KEY;
```

### Hook: Secret Detection
```json
{
  "name": "Detect Hardcoded Secrets",
  "when": {
    "type": "preToolUse",
    "toolTypes": ["write"]
  },
  "then": {
    "type": "askAgent",
    "prompt": "Hardcoded secrets, API keys, passwords bormi tekshir"
  }
}
```

---

## 12. 📊 Performance Optimization

### Caching Strategy
```javascript
// Memory cache
const cache = new Map();

// Redis cache
const redis = require('redis');

// HTTP cache
res.set('Cache-Control', 'public, max-age=3600');
```

### Database Optimization
```javascript
// ❌ N+1 problem
const users = await User.findAll();
for (const user of users) {
  user.posts = await Post.findAll({ userId: user.id });
}

// ✅ Eager loading
const users = await User.findAll({
  include: [Post]
});
```

---

## 13. 🧪 Testing Strategy

### Test Pyramid
```
E2E Tests (10%)
    ↑
Integration Tests (30%)
    ↑
Unit Tests (60%)
```

### Hook: Auto Test
```json
{
  "name": "Test on Save",
  "when": {
    "type": "fileEdited",
    "patterns": ["src/**/*.js"]
  },
  "then": {
    "type": "runCommand",
    "command": "npm test -- --related"
  }
}
```

---

## 14. 🌍 Multi-Language Support

Men ko'p tillarni tushunaman:
- O'zbek tilida javob beraman
- Code comments ingliz tilida
- Documentation ikki tilda

---

## 15. 🎓 Learning Mode

### Explain Code
```
"Bu kod nima qiladi?"
"Algorithm qanday ishlaydi?"
"Best practice nima?"
```

### Code Examples
```
"JWT authentication misol ko'rsat"
"Redis caching qanday qilinadi?"
"WebSocket implementation"
```

---

## 🚀 Pro Tips

### 1. Context Gatherer + Agents
```
1. context-gatherer loyihani o'rganadi
2. @code-reviewer kod sifatini tekshiradi
3. @security-auditor xavfsizlikni ko'radi
4. @performance-optimizer optimizatsiya qiladi
```

### 2. Hooks Chaining
```
fileEdited → lint → test → security-scan → code-review
```

### 3. Spec + Hooks
```
Spec task tugadi → test → deploy → notification
```

### 4. Powers + Agents
```
Figma → code generation → code-reviewer → deploy (Netlify)
```

### 5. Steering + Context
```
Steering rules + #File context = Perfect code
```

---

## 📚 Keyingi O'rganish

1. **Spec Mode** - Katta loyihalar uchun
2. **Custom Agents** - O'z agentlaringiz
3. **MCP Powers** - Tashqi servislar
4. **Advanced Hooks** - Complex workflows
5. **Performance Tuning** - Optimization

---

**Eslatma:** Bu advanced features. Asta-sekin o'rganing va qo'llang!

🎯 **Qaysi feature bilan boshlamoqchisiz?**
