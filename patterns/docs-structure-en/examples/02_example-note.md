# Express REST API Implementation Pattern — Dev Note

> **⚠️ Secrets protection rules**
>
> For information in this note:
> - Always use placeholders (`YOUR_API_KEY`, etc.) for API keys, passwords, and tokens
> - Never include actual secrets
> - Never paste .env or config file contents as-is

**Created**: 2025-01-04
**Related task**: User management API implementation

---

## Problem

When implementing a backend API with Express, there are many pitfalls around error handling, CORS config, and middleware order.

### Background

- CORS errors occur when calling the API via fetch from the frontend (React)
- Error response format is inconsistent
- Unexpected behavior occurs depending on middleware order

### Requirements

- Accept requests from the frontend (localhost:3000)
- Unified error response format
- JSON request/response handling
- Development logging

---

## Trial & error

### Approach A: Add CORS after route definitions

**Tried**:
```javascript
// server/index.js
const express = require('express');
const app = express();

// Route definitions
app.get('/api/users', (req, res) => {
  res.json([{ id: 1, name: 'Alice' }]);
});

// CORS added last
const cors = require('cors');
app.use(cors());

app.listen(3001);
```

**Result**: Failed

**Reason**:
- Middleware executes top-to-bottom
- Adding `cors()` after route definitions has no effect since routes are already processed
- Frontend gets `Access-Control-Allow-Origin` header missing error

**Learning**:
- **Middleware order matters** in Express
- CORS middleware must be placed **before** route definitions

---

### Approach B: Write error handling in each route

**Tried**:
```javascript
// server/routes/users.js
router.get('/:id', async (req, res) => {
  try {
    const user = await findUser(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const user = await createUser(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Other routes with the same try-catch...
```

**Result**: Partially successful

**Issues**:
- Every route needs the same try-catch (violates DRY)
- Hard to unify error response format (subtle differences per route)
- Code is verbose and hard to read

**Learning**:
- Error handling should be shared
- Use Express **error-handling middleware**

---

### Approach C: Place middleware in the correct order (success)

**Tried**:

**1. Organize middleware placement order:**
```javascript
// server/index.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// 1. CORS (place first)
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// 2. Logging (for development debugging)
app.use(morgan('dev'));

// 3. JSON parser (required before using req.body)
app.use(express.json());

// 4. Route definitions
app.use('/api/users', require('./routes/users'));

// 5. 404 handler (after route definitions)
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// 6. Error-handling middleware (last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
```

**2. Simplify routes:**
```javascript
// server/routes/users.js
const express = require('express');
const router = express.Router();

// Mock data (replace with database later)
const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' }
];

// GET /api/users — get all users
router.get('/', (req, res) => {
  res.json(users);
});

// GET /api/users/:id — get specific user
router.get('/:id', (req, res, next) => {
  const user = users.find(u => u.id === parseInt(req.params.id));

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    return next(error);  // pass to error-handling middleware
  }

  res.json(user);
});

// POST /api/users — create user
router.post('/', (req, res, next) => {
  const { name, email } = req.body;

  if (!name || !email) {
    const error = new Error('Name and email are required');
    error.status = 400;
    return next(error);
  }

  const newUser = { id: users.length + 1, name, email };
  users.push(newUser);
  res.status(201).json(newUser);
});

module.exports = router;
```

**Result**: Success

**Benefits**:
- CORS errors resolved
- Error handling unified; code is simpler
- JSON parsing happens automatically
- Development logs are readable

---

## Solution

### Final implementation pattern

#### 1. Correct middleware order

```javascript
// server/index.js
const express = require('express');
const app = express();

// ① CORS (first)
app.use(cors({ origin: 'http://localhost:3000' }));

// ② Logging
app.use(morgan('dev'));

// ③ JSON parser
app.use(express.json());

// ④ Route definitions
app.use('/api/users', require('./routes/users'));

// ⑤ 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// ⑥ Error handling (last)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});
```

#### 2. Error handling in routes

```javascript
// Pass errors to next()
router.get('/:id', (req, res, next) => {
  const user = findUser(req.params.id);

  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    return next(error);  // ← delegate to error-handling middleware
  }

  res.json(user);
});
```

#### 3. Unified error response format

```json
{
  "error": "error message"
}
```

---

## Learnings

### 1. Middleware order matters in Express

**Correct order:**
1. **CORS** — place first (applies to all requests)
2. **Logging** — record request details
3. **JSON parser** — required before using `req.body`
4. **Route definitions** — actual API endpoints
5. **404 handler** — when no route matches
6. **Error handling** — last (catches all errors)

### 2. How to use error-handling middleware

```javascript
// Error-handling middleware requires exactly 4 arguments
app.use((err, req, res, next) => {
  // ^^^^^^^^^ 4 arguments required
  res.status(err.status || 500).json({
    error: err.message
  });
});
```

**Key points:**
- 4 arguments `(err, req, res, next)` are required
- With 3 arguments it's treated as normal middleware
- Passing `next(error)` invokes this middleware

### 3. CORS configuration

```javascript
// Development: allow all origins (simple, not recommended for production)
app.use(cors());

// Production: allow only specific origins (recommended)
app.use(cors({
  origin: 'https://example.com',
  credentials: true  // if using cookies
}));
```

### 4. Start with mock data

```javascript
// Start with an array as mock data
const users = [{ id: 1, name: 'Alice' }];

// Replace with database later
const users = await db.query('SELECT * FROM users');
```

**Benefits:**
- Can front-load frontend development
- Lock down API shape early
- Easy to swap out for a real database later

### 5. Status code guide

| Status | Use | Example |
|--------|-----|---------|
| 200 | Success (GET, PUT) | User fetch success |
| 201 | Created (POST) | User creation success |
| 400 | Request error | Validation error |
| 404 | Not found | User does not exist |
| 500 | Server error | Unexpected error |

---

## Future improvements

### Short-term
- [ ] Introduce a validation library (Joi or Zod)
- [ ] Database connection (SQLite or PostgreSQL)
- [ ] Add authentication (JWT)

### Long-term
- [ ] Rate limiting (express-rate-limit)
- [ ] Auto-generate API docs (Swagger)
- [ ] Add tests (Jest + Supertest)

---

## Related documents

- [Express official docs — Error Handling](https://expressjs.com/en/guide/error-handling.html)
- [Express official docs — Middleware](https://expressjs.com/en/guide/using-middleware.html)
- Related handoff: `docs/letters/2025-01-05-18-30-00.md` — user management feature status

---

**Last updated**: 2025-01-04
**Author**: Claude Code + User
