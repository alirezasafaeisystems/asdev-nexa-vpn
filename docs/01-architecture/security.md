# Security (امنیت و حریم خصوصی)

---

## 🛡️ اصول امنیتی

| اصل | توضیح |
|-----|-------|
| **Privacy by Design** | حداقل داده ذخیره می‌شود |
| **Defense in Depth** | چندین لایه امنیتی |
| **Least Privilege** | دسترسی حداقلی |
| **No-Log Policy** | لاگ IP کاربران ذخیره نمی‌شود |

---

## 🔐 احراز هویت

### Session Management
```
┌─────────────────────────────────────────┐
│            Session Flow                  │
├─────────────────────────────────────────┤
│                                          │
│  1. Login                                │
│     └──▶ Verify password (bcrypt)        │
│          └──▶ Create Session in DB       │
│               └──▶ Set cookie (HttpOnly) │
│                                          │
│  2. Request                              │
│     └──▶ Read session ID from cookie     │
│          └──▶ Validate session in DB     │
│               └──▶ Check expiry          │
│                                          │
│  3. Logout                               │
│     └──▶ Delete session from DB          │
│          └──▶ Clear cookie               │
│                                          │
└─────────────────────────────────────────┘
```

### Password Security
- **Algorithm:** bcrypt
- **Cost Factor:** 12
- **Min Length:** 6 characters

---

## 🚦 Rate Limiting

| Endpoint | محدودیت | پنجره زمانی |
|----------|---------|-------------|
| `/auth/login` | 5 درخواست | 1 دقیقه |
| `/auth/register` | 3 درخواست | 1 دقیقه |
| `/invoices` | 5 درخواست | 1 دقیقه |
| `/tickets` | 3 درخواست | 1 دقیقه |
| `/telegram/webhook` | 100 درخواست | 1 دقیقه |

---

## 🎭 RBAC (Role-Based Access Control)

| Role | دسترسی‌ها |
|------|----------|
| **USER** | پروفایل، اشتراک، تیکت خود |
| **SUPPORT** | تمام تیکت‌ها، کاربران (فقط خواندن) |
| **ADMIN** | دسترسی کامل |

### Permission Matrix
| Resource | USER | SUPPORT | ADMIN |
|----------|------|---------|-------|
| Own Profile | ✅ | ✅ | ✅ |
| Own Subscriptions | ✅ | ✅ | ✅ |
| All Users | ❌ | 👁️ | ✅ |
| All Tickets | ❌ | ✅ | ✅ |
| Plans CRUD | ❌ | ❌ | ✅ |
| Servers CRUD | ❌ | ❌ | ✅ |

---

## 🔒 امنیت داده‌ها

### داده‌های ذخیره شده
| داده | ذخیره می‌شود؟ | دلیل |
|------|--------------|------|
| ایمیل | ✅ | احراز هویت |
| شماره تماس | ⚠️ اختیاری | احراز هویت جایگزین |
| رمز عبور | ✅ (hashed) | احراز هویت |
| IP کاربر | ❌ | حریم خصوصی |
| تاریخچه اتصال VPN | ❌ | No-Log Policy |
| تراکنش مالی | ✅ | صورتحساب |

### Retention Policy
| داده | مدت نگهداری |
|------|-------------|
| Sessions منقضی | حذف روزانه |
| Idempotency Keys | 90 روز |
| Tickets | 180 روز |
| Admin Audit Logs | 365 روز |

---

## 🔐 امنیت API

### Input Validation
- **Library:** Zod
- **اسکیماهای اعتبارسنجی:** همه ورودی‌ها

### Output Sanitization
- **XSS Protection:** React auto-escaping
- **CSP Headers:** Configured in Next.js

### Security Headers
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

---

## ⚠️ Threat Mitigation

| تهدید | راهکار |
|-------|--------|
| Brute Force | Rate limiting, strong passwords |
| Session Theft | HttpOnly cookies, SameSite |
| XSS | CSP headers, input validation |
| CSRF | SameSite cookies |
| SQL Injection | Prisma parameterized queries |
| Payment Fraud | Manual verification, idempotency |

---

## 📝 Audit Logging

### Events Logged
- Login attempts (success/failure)
- Admin actions
- Payment status changes
- User role changes

### Log Structure
```typescript
{
  id: string;
  createdAt: DateTime;
  actorUserId: string?;
  action: string;
  targetType: string?;
  targetId: string?;
  metaJson: string?;
}
```
