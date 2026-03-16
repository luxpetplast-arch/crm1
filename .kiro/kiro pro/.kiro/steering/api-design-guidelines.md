---
inclusion: fileMatch
fileMatchPattern: '**/routes/**,**/controllers/**,**/api/**'
---

# API Design Guidelines

## RESTful API Best Practices

### 1. URL Structure
```
✅ Good:
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id

❌ Bad:
GET /api/v1/getAllUsers
POST /api/v1/createUser
GET /api/v1/user-delete/:id
```

### 2. HTTP Methods
- **GET**: Retrieve data (idempotent, safe)
- **POST**: Create new resource
- **PUT**: Update entire resource (idempotent)
- **PATCH**: Partial update
- **DELETE**: Remove resource (idempotent)

### 3. Status Codes
```javascript
// Success
200 OK              // GET, PUT, PATCH success
201 Created         // POST success
204 No Content      // DELETE success

// Client Errors
400 Bad Request     // Invalid input
401 Unauthorized    // Authentication required
403 Forbidden       // Authenticated but no permission
404 Not Found       // Resource doesn't exist
409 Conflict        // Duplicate resource
422 Unprocessable   // Validation error

// Server Errors
500 Internal Error  // Server error
503 Service Unavailable
```

### 4. Request/Response Format

**Request:**
```json
POST /api/v1/users
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user"
}
```

**Success Response:**
```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "data": {
    "id": "usr_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response:**
```json
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Email format is invalid",
    "field": "email"
  }
}
```

### 5. Pagination
```javascript
GET /api/v1/users?page=2&limit=20

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": true
  }
}
```

### 6. Filtering & Sorting
```javascript
// Filtering
GET /api/v1/users?role=admin&status=active

// Sorting
GET /api/v1/users?sort=-createdAt,name
// - prefix for descending

// Combined
GET /api/v1/users?role=admin&sort=-createdAt&page=1&limit=20
```

### 7. Versioning
```javascript
// URL versioning (recommended)
/api/v1/users
/api/v2/users

// Header versioning
Accept: application/vnd.api+json; version=1
```

### 8. Authentication
```javascript
// JWT Bearer Token
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// API Key
X-API-Key: your_api_key_here
```

### 9. Rate Limiting
```javascript
// Response headers
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000

// 429 Too Many Requests
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Try again in 60 seconds."
  }
}
```

### 10. CORS
```javascript
// Express.js
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Security Best Practices

### 1. Input Validation
```javascript
// ✅ Always validate
const { error, value } = userSchema.validate(req.body);
if (error) {
  return res.status(400).json({
    error: { message: error.details[0].message }
  });
}
```

### 2. SQL Injection Prevention
```javascript
// ✅ Parameterized queries
const user = await db.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);

// ❌ String concatenation
const user = await db.query(
  `SELECT * FROM users WHERE id = ${userId}`
);
```

### 3. Authentication Middleware
```javascript
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        error: { message: 'Authentication required' }
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      error: { message: 'Invalid token' }
    });
  }
};
```

### 4. Authorization
```javascript
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: { message: 'Insufficient permissions' }
      });
    }
    next();
  };
};

// Usage
router.delete('/users/:id', 
  authenticate, 
  authorize('admin'), 
  deleteUser
);
```

## Performance Best Practices

### 1. Caching
```javascript
// Redis caching
const getUser = async (userId) => {
  const cacheKey = `user:${userId}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  // Fetch from DB
  const user = await db.users.findById(userId);
  
  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(user));
  
  return user;
};
```

### 2. Database Optimization
```javascript
// ✅ Select only needed fields
const users = await db.users.find({}, {
  select: 'id name email'
});

// ✅ Use indexes
// In migration:
await db.schema.table('users', (table) => {
  table.index('email');
  table.index(['status', 'createdAt']);
});
```

### 3. Async Operations
```javascript
// ✅ Parallel operations
const [user, posts, comments] = await Promise.all([
  fetchUser(userId),
  fetchPosts(userId),
  fetchComments(userId)
]);

// ❌ Sequential (slow)
const user = await fetchUser(userId);
const posts = await fetchPosts(userId);
const comments = await fetchComments(userId);
```

## Error Handling

### Global Error Handler
```javascript
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message
      }
    });
  }
  
  // Programming errors
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong'
    }
  });
});
```

## Documentation

### OpenAPI/Swagger
```javascript
/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - name
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 */
```

## Testing

### API Tests
```javascript
describe('POST /api/v1/users', () => {
  it('should create user with valid data', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({
        email: 'test@example.com',
        name: 'Test User'
      })
      .expect(201);
    
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('test@example.com');
  });
  
  it('should return 400 for invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/users')
      .send({
        email: 'invalid-email',
        name: 'Test User'
      })
      .expect(400);
    
    expect(res.body.success).toBe(false);
  });
});
```

## Eslatma

Bu qoidalar har doim API kod yozganingizda qo'llaniladi. Kiro avtomatik tekshiradi va takliflar beradi.
