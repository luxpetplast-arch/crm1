---
name: qoida
description: Loyiha uchun barcha qoidalar, standartlar va best practices. Barcha agentlar bu qoidalarga rioya qilishi kerak.
tools: ["read"]
---

# 📋 LOYIHA QOIDALARI VA STANDARTLARI

Bu fayl loyihadagi barcha AI agentlar va dasturchilar uchun majburiy qoidalarni belgilaydi.

---

## 🎯 ASOSIY PRINSIPLAR

### 1. Kod Sifati
- ✅ Clean Code prinsiplarini qo'llash
- ✅ SOLID prinsiplarini rioya qilish
- ✅ DRY (Don't Repeat Yourself)
- ✅ KISS (Keep It Simple, Stupid)
- ✅ YAGNI (You Aren't Gonna Need It)

### 2. Xavfsizlik
- ✅ Hech qachon secretlarni hardcode qilmaslik
- ✅ Input validation har doim
- ✅ SQL injection prevention
- ✅ XSS prevention
- ✅ CSRF protection

### 3. Performance
- ✅ N+1 query muammosini oldini olish
- ✅ Caching strategiyalarini qo'llash
- ✅ Database indexlarni to'g'ri ishlatish
- ✅ Lazy loading qo'llash
- ✅ Bundle size optimize qilish

### 4. Testing
- ✅ Minimum 80% test coverage
- ✅ Unit tests har bir funksiya uchun
- ✅ Integration tests critical pathlar uchun
- ✅ E2E tests asosiy user flowlar uchun
- ✅ Regression tests har bir bug fix uchun

### 5. Documentation
- ✅ Har bir funksiya uchun JSDoc/docstring
- ✅ README.md har bir modul uchun
- ✅ API documentation (OpenAPI/Swagger)
- ✅ Changelog.md yangilanishi
- ✅ Migration guide breaking changes uchun

---

## 🤖 AGENT QOIDALARI

### Project Supervisor
**Vazifa**: Barcha agentlarni nazorat qilish

**Qoidalar:**
1. Har bir o'zgarishni user requirements bilan solishtirish
2. Scope creep ni oldini olish
3. Unauthorized changes ni rad etish
4. Breaking changes uchun user approval olish
5. Quality gates ni enforce qilish

**Intervention Triggers:**
- Agent scope dan chiqsa
- Unauthorized file modification
- Breaking change without approval
- Test coverage pasaysa
- Performance degradation

### Feature Manager
**Vazifa**: Funksiyalarni boshqarish

**Qoidalar:**
1. Har bir yangi funksiya registry ga qo'shilishi kerak
2. Conflict detection har doim
3. Dependency tracking majburiy
4. Backward compatibility ta'minlash
5. Feature flags ishlatish gradual rollout uchun

**Checks:**
- ✅ Endpoint conflicts yo'qligi
- ✅ Database schema conflicts yo'qligi
- ✅ Dependency mavjudligi
- ✅ Breaking changes documentation
- ✅ Migration guide mavjudligi

### Progress Tracker
**Vazifa**: Progress kuzatish

**Qoidalar:**
1. Har bir task uchun detailed checklist
2. Item complete deb belgilashdan oldin validation
3. Blocker larni darhol report qilish
4. Quality metrics track qilish
5. Regular progress reports

**Validation Requirements:**
- ✅ Deliverable mavjud
- ✅ Tests o'tgan
- ✅ Documentation yangilangan
- ✅ Code review o'tgan
- ✅ User requirements met

### Code Reviewer
**Vazifa**: Kod sifatini ta'minlash

**Qoidalar:**
1. Best practices ni enforce qilish
2. Code smells ni aniqlash
3. Security vulnerabilities topish
4. Performance issues flaglash
5. Constructive feedback berish

**Review Checklist:**
- ✅ Code style consistent
- ✅ No hardcoded values
- ✅ Error handling proper
- ✅ No console.log in production
- ✅ Comments meaningful
- ✅ Function names descriptive
- ✅ No magic numbers
- ✅ DRY principle followed

### Security Auditor
**Vazifa**: Xavfsizlikni ta'minlash

**Qoidalar:**
1. Har bir input validation qilinishi kerak
2. Secrets hech qachon code da emas
3. SQL injection prevention
4. XSS prevention
5. Authentication va authorization check

**Security Checks:**
- ✅ No SQL injection vulnerabilities
- ✅ No XSS vulnerabilities
- ✅ No CSRF vulnerabilities
- ✅ No hardcoded secrets
- ✅ Proper authentication
- ✅ Proper authorization
- ✅ Input sanitization
- ✅ Output encoding

### Database Optimizer
**Vazifa**: Database performance

**Qoidalar:**
1. N+1 query muammosini oldini olish
2. Proper indexlar qo'shish
3. Query optimization
4. Connection pooling
5. Migration safety

**Database Rules:**
- ✅ Foreign keys har doim indexed
- ✅ Frequently queried columns indexed
- ✅ No SELECT * in production
- ✅ Use prepared statements
- ✅ Proper transaction handling
- ✅ Migration reversible
- ✅ No data loss in migrations

### Test Coverage Analyzer
**Vazifa**: Test sifati

**Qoidalar:**
1. Minimum 80% coverage
2. Critical paths 100% covered
3. Edge cases tested
4. Error scenarios tested
5. Integration tests for APIs

**Test Requirements:**
- ✅ Unit tests for all functions
- ✅ Integration tests for APIs
- ✅ E2E tests for critical flows
- ✅ Edge cases covered
- ✅ Error scenarios tested
- ✅ Mocking proper
- ✅ Test isolation

---

## 📝 CODING STANDARDS

### JavaScript/TypeScript

```typescript
// ✅ GOOD: Descriptive names, proper types
interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

async function getUserById(userId: string): Promise<User | null> {
  try {
    const user = await db.users.findUnique({
      where: { id: userId }
    });
    return user;
  } catch (error) {
    logger.error('Failed to get user', { userId, error });
    throw new DatabaseError('User not found');
  }
}

// ❌ BAD: Poor names, no types, no error handling
async function get(id) {
  const u = await db.users.findUnique({ where: { id } });
  return u;
}
```

### Python

```python
# ✅ GOOD: Type hints, docstrings, error handling
from typing import Optional
from datetime import datetime

class User:
    """User model representing a system user."""
    
    def __init__(self, id: str, email: str, name: str):
        self.id = id
        self.email = email
        self.name = name
        self.created_at = datetime.now()

async def get_user_by_id(user_id: str) -> Optional[User]:
    """
    Retrieve a user by their ID.
    
    Args:
        user_id: The unique identifier of the user
        
    Returns:
        User object if found, None otherwise
        
    Raises:
        DatabaseError: If database connection fails
    """
    try:
        user = await db.users.find_one({"id": user_id})
        return User(**user) if user else None
    except Exception as e:
        logger.error(f"Failed to get user: {user_id}", exc_info=e)
        raise DatabaseError("User not found")

# ❌ BAD: No types, no docstring, no error handling
def get(id):
    u = db.users.find_one({"id": id})
    return u
```

### SQL

```sql
-- ✅ GOOD: Proper indexing, prepared statements
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Use prepared statements
SELECT * FROM users WHERE email = $1;

-- ❌ BAD: No indexes, string concatenation
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255),
  name VARCHAR(255)
);

-- SQL injection vulnerable
SELECT * FROM users WHERE email = '" + email + "';
```

---

## 🔒 SECURITY STANDARDS

### Input Validation

```typescript
// ✅ GOOD: Proper validation
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  age: z.number().min(18).max(120)
});

function createUser(data: unknown) {
  const validated = userSchema.parse(data);
  // Safe to use validated data
}

// ❌ BAD: No validation
function createUser(data: any) {
  // Directly using unvalidated data
  db.users.create(data);
}
```

### Secret Management

```typescript
// ✅ GOOD: Environment variables
const config = {
  database: {
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY
  }
};

// ❌ BAD: Hardcoded secrets
const config = {
  database: {
    host: 'localhost',
    password: 'mypassword123'
  },
  stripe: {
    secretKey: 'sk_live_abc123xyz'
  }
};
```

---

## 🧪 TESTING STANDARDS

### Unit Tests

```typescript
// ✅ GOOD: Comprehensive tests
describe('getUserById', () => {
  it('should return user when found', async () => {
    const user = await getUserById('123');
    expect(user).toBeDefined();
    expect(user.id).toBe('123');
  });
  
  it('should return null when not found', async () => {
    const user = await getUserById('nonexistent');
    expect(user).toBeNull();
  });
  
  it('should throw error on database failure', async () => {
    mockDb.findUnique.mockRejectedValue(new Error('DB Error'));
    await expect(getUserById('123')).rejects.toThrow(DatabaseError);
  });
});

// ❌ BAD: Incomplete tests
describe('getUserById', () => {
  it('works', async () => {
    const user = await getUserById('123');
    expect(user).toBeTruthy();
  });
});
```

---

## 📊 PERFORMANCE STANDARDS

### Database Queries

```typescript
// ✅ GOOD: Optimized query with select
const users = await db.users.findMany({
  select: {
    id: true,
    email: true,
    name: true
  },
  where: { active: true },
  take: 10
});

// ❌ BAD: N+1 query problem
const users = await db.users.findMany();
for (const user of users) {
  user.posts = await db.posts.findMany({ where: { userId: user.id } });
}

// ✅ GOOD: Single query with include
const users = await db.users.findMany({
  include: { posts: true }
});
```

### Caching

```typescript
// ✅ GOOD: Proper caching
async function getUser(userId: string): Promise<User> {
  const cached = await redis.get(`user:${userId}`);
  if (cached) return JSON.parse(cached);
  
  const user = await db.users.findUnique({ where: { id: userId } });
  await redis.setex(`user:${userId}`, 3600, JSON.stringify(user));
  
  return user;
}

// ❌ BAD: No caching
async function getUser(userId: string): Promise<User> {
  return await db.users.findUnique({ where: { id: userId } });
}
```

---

## 🚀 DEPLOYMENT STANDARDS

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Code review approved
- [ ] Security audit passed
- [ ] Performance acceptable
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Migration tested
- [ ] Rollback plan ready
- [ ] Monitoring configured
- [ ] Alerts configured

### Deployment Process

1. **Pre-deployment**
   - Run all tests
   - Security scan
   - Performance check
   - Backup database

2. **Deployment**
   - Deploy to staging first
   - Smoke tests on staging
   - Deploy to production
   - Monitor for errors

3. **Post-deployment**
   - Verify deployment
   - Check logs
   - Monitor metrics
   - User acceptance testing

4. **Rollback (if needed)**
   - Revert deployment
   - Restore database
   - Notify stakeholders
   - Post-mortem

---

## 📚 DOCUMENTATION STANDARDS

### Function Documentation

```typescript
/**
 * Retrieves a user by their unique identifier.
 * 
 * @param userId - The unique identifier of the user
 * @returns Promise resolving to User object or null if not found
 * @throws {DatabaseError} If database connection fails
 * @throws {ValidationError} If userId is invalid
 * 
 * @example
 * ```typescript
 * const user = await getUserById('123');
 * if (user) {
 *   console.log(user.email);
 * }
 * ```
 */
async function getUserById(userId: string): Promise<User | null> {
  // Implementation
}
```

### API Documentation

```yaml
# OpenAPI/Swagger
paths:
  /api/users/{id}:
    get:
      summary: Get user by ID
      description: Retrieves a user by their unique identifier
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        200:
          description: User found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        404:
          description: User not found
        500:
          description: Server error
```

---

## ⚠️ COMMON MISTAKES TO AVOID

### 1. Hardcoded Values
```typescript
// ❌ BAD
const MAX_USERS = 100;
if (users.length > 100) { ... }

// ✅ GOOD
const MAX_USERS = config.limits.maxUsers;
if (users.length > MAX_USERS) { ... }
```

### 2. No Error Handling
```typescript
// ❌ BAD
async function getUser(id: string) {
  return await db.users.findUnique({ where: { id } });
}

// ✅ GOOD
async function getUser(id: string): Promise<User | null> {
  try {
    return await db.users.findUnique({ where: { id } });
  } catch (error) {
    logger.error('Failed to get user', { id, error });
    throw new DatabaseError('User retrieval failed');
  }
}
```

### 3. Poor Naming
```typescript
// ❌ BAD
function f(x: any) { return x * 2; }
const d = new Date();
const arr = [1, 2, 3];

// ✅ GOOD
function double(value: number): number { return value * 2; }
const currentDate = new Date();
const userIds = [1, 2, 3];
```

---

## 🎯 AGENT COORDINATION

### Workflow

```
1. User Request
   ↓
2. Project Supervisor validates requirements
   ↓
3. Feature Manager checks conflicts
   ↓
4. Appropriate agents assigned
   ↓
5. Implementation with continuous validation
   ↓
6. Code Review + Security Audit
   ↓
7. Testing (Unit + Integration + Regression)
   ↓
8. Progress Tracker validates completion
   ↓
9. Pre-deployment checks
   ↓
10. Deployment
```

### Agent Priorities

1. **Critical (Stop Everything)**
   - Security vulnerabilities
   - Data loss risk
   - Production outage

2. **High (Address Immediately)**
   - Breaking changes
   - Test failures
   - Performance degradation

3. **Medium (Address Soon)**
   - Code quality issues
   - Missing documentation
   - Technical debt

4. **Low (Address When Possible)**
   - Code style
   - Minor optimizations
   - Nice-to-have features

---

## 📋 CHECKLIST TEMPLATES

### New Feature Checklist
- [ ] Requirements documented
- [ ] Design approved
- [ ] Technical approach defined
- [ ] Database schema updated
- [ ] API endpoints created
- [ ] Frontend components created
- [ ] Error handling implemented
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Regression tests passed
- [ ] Code review completed
- [ ] Security audit passed
- [ ] Performance validated
- [ ] API documentation updated
- [ ] User guide created
- [ ] Changelog updated
- [ ] Feature registry updated
- [ ] Pre-deployment check passed
- [ ] Deployed to staging
- [ ] User acceptance testing
- [ ] Deployed to production

### Bug Fix Checklist
- [ ] Bug reproduced
- [ ] Root cause identified
- [ ] Fix implemented
- [ ] Regression test added
- [ ] All tests passing
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Deployed

---

## 🔄 CONTINUOUS IMPROVEMENT

### Metrics to Track
- Code quality score
- Test coverage percentage
- Bug count
- Performance metrics
- Security vulnerabilities
- Technical debt
- Deployment frequency
- Mean time to recovery

### Regular Reviews
- Weekly: Code quality review
- Bi-weekly: Security audit
- Monthly: Performance review
- Quarterly: Architecture review

---

## 📞 ESCALATION

### When to Escalate to User

1. **Breaking Changes**
   - Any change that breaks backward compatibility
   - Requires user approval

2. **Scope Changes**
   - Request goes beyond original scope
   - Requires user clarification

3. **Critical Issues**
   - Security vulnerabilities found
   - Data loss risk
   - Production outage

4. **Blockers**
   - Cannot proceed without user input
   - External dependency issues

---

## ✅ COMPLIANCE

### Data Protection
- GDPR compliance
- Data encryption at rest and in transit
- Right to be forgotten
- Data retention policies

### Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast ratios

### Performance
- Page load < 3 seconds
- Time to interactive < 5 seconds
- First contentful paint < 1.5 seconds
- Core Web Vitals passing

---

**Bu qoidalar barcha agentlar va dasturchilar uchun majburiy!**

*Oxirgi yangilanish: 2024-01-15*
*Versiya: 2.0*
