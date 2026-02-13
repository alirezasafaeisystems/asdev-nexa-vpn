# Authentication

---

## 🔐 مکانیزم احراز هویت

NexaVPN از **Cookie-based Session Authentication** استفاده می‌کند.

---

## 🔄 Session Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                     Session Lifecycle                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐     ┌─────────┐     ┌─────────┐              │
│  │  Login  │────▶│ Session │────▶│ Expired │              │
│  │         │     │  (30d)  │     │         │              │
│  └─────────┘     └─────────┘     └─────────┘              │
│       │               │               │                    │
│       │               │               │                    │
│       ▼               ▼               ▼                    │
│  Set Cookie      Valid Request    Delete Session          │
│                  Authenticated    Clear Cookie            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🍪 Cookie Configuration

| Property | Value | توضیح |
|----------|-------|-------|
| Name | `nexa_sid` | نام کوکی |
| HttpOnly | `true` | دسترسی از JavaScript ممنوع |
| Secure | `true` (production) | فقط HTTPS |
| SameSite | `lax` | محافظت CSRF |
| Max-Age | `2592000` | 30 روز (ثانیه) |
| Path | `/` | کل سایت |

---

## 📝 Login Flow

```typescript
// 1. Client sends credentials
POST /api/v1/auth/login
{
  "email": "user@example.com",
  "password": "user123"
}

// 2. Server validates
const user = await db.user.findUnique({ where: { email } });
const valid = await verifyPassword(password, user.passwordHash);

// 3. Create session
const session = await db.session.create({
  data: {
    userId: user.id,
    expiresAt: addDays(new Date(), 30),
    ip: req.ip,
    userAgent: req.headers['user-agent']
  }
});

// 4. Set cookie
cookies().set('nexa_sid', session.id, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  maxAge: 2592000
});

// 5. Response
{
  "user": { id, email, role },
  "session": { id }
}
```

---

## 🔒 Password Hashing

```typescript
// Hashing (bcrypt)
import bcrypt from 'bcryptjs';

const hash = await bcrypt.hash(password, 12);

// Verification
const valid = await bcrypt.compare(password, hash);
```

---

## 🛡️ Protected Routes

```typescript
// In API route
import { requireAuth, requireRole } from '@/lib/auth';

// Require any authenticated user
const { user } = await requireAuth();

// Require specific role
const { user } = await requireRole('ADMIN');
```

---

## 🚪 Logout Flow

```typescript
// 1. Delete session from database
await db.session.delete({ where: { id: sessionId } });

// 2. Clear cookie
cookies().delete('nexa_sid');
```

---

## ⚠️ Security Considerations

| تهدید | راهکار |
|-------|--------|
| Session Theft | HttpOnly + Secure cookies |
| CSRF | SameSite=lax |
| Brute Force | Rate limiting (5/min) |
| Session Fixation | Regenerate on login |

---

## 🔧 Environment Variables

```env
SESSION_COOKIE_NAME=nexa_sid
SESSION_TTL_DAYS=30
SESSION_SECRET=your-secret-key
```
