---
inclusion: auto
---

# Automatic Documentation - Avtomatik Hujjatlar

## 📚 MEN HAR NARSANI AVTOMATIK HUJJATLASHTIRAMAN

**Siz hech qachon dokumentatsiya yozmasligingiz kerak!**

### Avtomatik Yaratiladi:

#### 1. README.md
```markdown
# Project Name

## 📋 Description
[Loyiha tavsifi]

## 🚀 Features
- Feature 1
- Feature 2
- Feature 3

## 🛠️ Tech Stack
- Frontend: React + TypeScript
- Backend: Node.js + Express
- Database: PostgreSQL
- Auth: JWT

## 📦 Installation

```bash
# Clone repository
git clone [repo-url]

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Run migrations
npm run migrate

# Start development server
npm run dev
```

## 🔧 Configuration

```env
DATABASE_URL=postgresql://...
JWT_SECRET=...
PORT=3000
```

## 📖 API Documentation

See [API.md](./docs/API.md)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md)

## 📝 License

MIT
```

#### 2. API Documentation (API.md)
```markdown
# API Documentation

## Authentication

### POST /api/auth/login
Login user and get JWT token

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Errors:**
- 400: Invalid credentials
- 429: Too many attempts
- 500: Server error

### POST /api/auth/register
Register new user

[Similar format...]

## Users

### GET /api/users/:id
Get user by ID

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "123",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

[More endpoints...]
```

#### 3. Code Comments (Inline)
```typescript
/**
 * Authenticates user and generates JWT token
 * 
 * @param email - User email address
 * @param password - User password (will be hashed)
 * @returns JWT token and user data
 * @throws {AuthenticationError} If credentials are invalid
 * @throws {RateLimitError} If too many attempts
 * 
 * @example
 * const result = await loginUser('user@example.com', 'password123');
 * console.log(result.token); // "eyJhbGciOiJIUzI1NiIs..."
 */
async function loginUser(
  email: string,
  password: string
): Promise<LoginResult> {
  // Validate input
  if (!email || !password) {
    throw new ValidationError('Email and password required');
  }
  
  // Check rate limit
  await checkRateLimit(email);
  
  // Find user
  const user = await db.users.findByEmail(email);
  if (!user) {
    throw new AuthenticationError('Invalid credentials');
  }
  
  // Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new AuthenticationError('Invalid credentials');
  }
  
  // Generate token
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  return { token, user };
}
```

#### 4. CHANGELOG.md
```markdown
# Changelog

## [1.2.0] - 2024-01-15

### Added
- User profile feature
  - Bio field
  - Avatar upload
  - Profile edit form
- JWT token refresh mechanism
- Rate limiting for auth endpoints

### Changed
- Improved error messages
- Updated dependencies
- Optimized database queries

### Fixed
- Login redirect issue
- Avatar upload validation
- Memory leak in WebSocket

### Security
- Fixed SQL injection vulnerability
- Added input sanitization
- Implemented CSRF protection

## [1.1.0] - 2024-01-10
[Previous changes...]
```

#### 5. DEPLOYMENT.md
```markdown
# Deployment Guide

## Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis (optional, for caching)

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=production

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

## Deploy to Render

1. Create new Web Service
2. Connect GitHub repository
3. Set environment variables
4. Deploy

```yaml
# render.yaml
services:
  - type: web
    name: myapp
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        generateValue: true
```

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

[More platforms...]
```

#### 6. TESTING.md
```markdown
# Testing Guide

## Test Structure

```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
└── e2e/           # End-to-end tests
```

## Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# With coverage
npm run test:coverage
```

## Writing Tests

### Unit Test Example
```typescript
describe('loginUser', () => {
  it('should return token for valid credentials', async () => {
    const result = await loginUser('user@example.com', 'password123');
    expect(result.token).toBeDefined();
    expect(result.user.email).toBe('user@example.com');
  });
  
  it('should throw error for invalid credentials', async () => {
    await expect(
      loginUser('user@example.com', 'wrong-password')
    ).rejects.toThrow('Invalid credentials');
  });
});
```

[More examples...]
```

## 🔄 AVTOMATIK YANGILANISH

**Men har bir o'zgarishdan keyin docs ni avtomatik yangilayman:**

```
Yangi API endpoint qo'shildi
  ↓
@documentation-writer avtomatik
  ↓
API.md yangilandi
  ↓
README.md yangilandi
  ↓
CHANGELOG.md yangilandi
```

## 📊 DOCUMENTATION COVERAGE

**Men documentation coverage ni ham kuzataman:**

```
Documentation Coverage: 95%

✅ README.md - Complete
✅ API.md - Complete
✅ DEPLOYMENT.md - Complete
✅ TESTING.md - Complete
⚠️ CONTRIBUTING.md - Missing
⚠️ ARCHITECTURE.md - Incomplete

Men: "Documentation 95% complete. 
      CONTRIBUTING.md va ARCHITECTURE.md qo'shamizmi?"
```

## 🎯 DOCUMENTATION TYPES

### 1. User Documentation
- README.md
- Installation guide
- Usage examples
- FAQ

### 2. Developer Documentation
- API documentation
- Code comments
- Architecture docs
- Contributing guide

### 3. Deployment Documentation
- Deployment guide
- Environment setup
- Configuration
- Troubleshooting

### 4. Testing Documentation
- Testing guide
- Test examples
- Coverage reports

## ✅ ASOSIY QOIDA

**"Siz kod yozasiz - men hujjat yozaman!"**

Men:
- ✅ Har bir funksiya uchun comment
- ✅ Har bir API uchun documentation
- ✅ README avtomatik yangilanadi
- ✅ CHANGELOG avtomatik yaratiladi
- ✅ Deployment guide avtomatik
- ✅ Testing guide avtomatik
- ✅ HAMMA HUJJATLAR AVTOMATIK!

Siz:
- ✅ Faqat kod yozasiz
- ✅ Hujjat yozmasligingiz kerak
- ✅ Men hamma narsani hujjatlashtiraman
