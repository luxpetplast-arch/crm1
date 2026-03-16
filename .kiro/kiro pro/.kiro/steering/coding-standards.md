---
inclusion: auto
---

# Coding Standards - Loyiha Standartlari

## Umumiy Qoidalar

### 1. Kod Yozish Uslubi
- **Clean Code**: Kod o'qilishi oson bo'lishi kerak
- **DRY Principle**: Don't Repeat Yourself - takrorlanishdan saqlaning
- **SOLID Principles**: Dizayn printsiplarini qo'llang
- **KISS**: Keep It Simple, Stupid - sodda yozing

### 2. Naming Conventions
```javascript
// ✅ Yaxshi
const userProfile = getUserProfile();
function calculateTotalPrice() {}
class UserAuthentication {}

// ❌ Yomon
const up = getUP();
function calc() {}
class UA {}
```

### 3. Funksiya va Metodlar
- Har bir funksiya bitta vazifani bajarishi kerak
- Funksiya nomi vazifasini aniq ifodalashi kerak
- Parametrlar soni 3 tadan oshmasligi kerak (object ishlatish yaxshiroq)

```javascript
// ✅ Yaxshi
function createUser({ name, email, age }) {
  // ...
}

// ❌ Yomon
function createUser(name, email, age, address, phone, country) {
  // ...
}
```

### 4. Error Handling
- Har doim error handling qo'shing
- Try-catch ishlatish
- Meaningful error messages

```javascript
// ✅ Yaxshi
try {
  const data = await fetchUserData(userId);
  return data;
} catch (error) {
  logger.error('Failed to fetch user data:', error);
  throw new Error(`User data fetch failed for ID: ${userId}`);
}

// ❌ Yomon
const data = await fetchUserData(userId); // Error handling yo'q
```

### 5. Kommentariyalar
- Kod o'zi o'zini tushuntirishi kerak
- Faqat murakkab logika uchun kommentariya yozing
- "Nima" emas, "Nima uchun" ni tushuntiring

```javascript
// ✅ Yaxshi
// Caching to avoid expensive API calls on every request
const cachedData = cache.get(key);

// ❌ Yomon
// Get data from cache
const cachedData = cache.get(key);
```

## Xavfsizlik Standartlari

### 1. Input Validation
```javascript
// ✅ Har doim input tekshiring
function updateUser(userId, data) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid user ID');
  }
  // Validation logic
}
```

### 2. Secrets Management
```javascript
// ✅ Environment variables ishlatish
const apiKey = process.env.API_KEY;

// ❌ Hardcoded secrets
const apiKey = 'sk_live_123456789'; // HECH QACHON!
```

### 3. SQL Injection Prevention
```javascript
// ✅ Prepared statements
const user = await db.query('SELECT * FROM users WHERE id = ?', [userId]);

// ❌ String concatenation
const user = await db.query(`SELECT * FROM users WHERE id = ${userId}`);
```

## Performance Standartlari

### 1. Database Queries
```javascript
// ✅ Eager loading
const users = await User.findAll({
  include: [{ model: Post }]
});

// ❌ N+1 problem
const users = await User.findAll();
for (const user of users) {
  user.posts = await Post.findAll({ where: { userId: user.id } });
}
```

### 2. Caching
```javascript
// ✅ Cache expensive operations
const cacheKey = `user:${userId}`;
let user = await cache.get(cacheKey);
if (!user) {
  user = await fetchUserFromDB(userId);
  await cache.set(cacheKey, user, 3600);
}
```

### 3. Async Operations
```javascript
// ✅ Parallel execution
const [users, posts, comments] = await Promise.all([
  fetchUsers(),
  fetchPosts(),
  fetchComments()
]);

// ❌ Sequential (sekin)
const users = await fetchUsers();
const posts = await fetchPosts();
const comments = await fetchComments();
```

## Testing Standartlari

### 1. Test Coverage
- Unit tests: 80%+ coverage
- Integration tests: kritik flowlar uchun
- E2E tests: asosiy user journeys

### 2. Test Naming
```javascript
// ✅ Descriptive test names
describe('UserAuthentication', () => {
  it('should return error when password is incorrect', () => {
    // ...
  });
});

// ❌ Unclear names
describe('Auth', () => {
  it('test1', () => {
    // ...
  });
});
```

## Git Commit Standartlari

### Commit Message Format
```
type(scope): subject

body (optional)

footer (optional)
```

### Types:
- `feat`: Yangi feature
- `fix`: Bug fix
- `docs`: Dokumentatsiya
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code refactoring
- `test`: Test qo'shish
- `chore`: Build tasks, package manager configs, etc.

### Misol:
```
feat(auth): add JWT token refresh mechanism

Implemented automatic token refresh when access token expires.
Tokens are stored in httpOnly cookies for security.

Closes #123
```

## Code Review Checklist

Har bir PR uchun tekshiring:
- [ ] Kod standartlarga mos
- [ ] Testlar yozilgan va o'tayapti
- [ ] Error handling mavjud
- [ ] Security best practices qo'llanilgan
- [ ] Performance optimized
- [ ] Dokumentatsiya yangilangan
- [ ] No hardcoded secrets
- [ ] Meaningful commit messages

## Eslatma

Bu standartlar barcha jamoada bir xil kod yozish uchun. Agar savollar bo'lsa, so'rang!
