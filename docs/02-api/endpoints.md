# API Endpoints

---

## 📍 Base URL

```
/api/v1
```

---

## 🔐 Authentication

| Endpoint | Method | توضیح |
|----------|--------|-------|
| `/auth/register` | POST | ثبت‌نام کاربر جدید |
| `/auth/login` | POST | ورود به سیستم |
| `/auth/logout` | POST | خروج از سیستم |
| `/auth/me` | GET | اطلاعات کاربر جاری |

---

## 📦 Plans

| Endpoint | Method | توضیح | Auth |
|----------|--------|-------|------|
| `/plans` | GET | لیست پلن‌های فعال | ❌ |

---

## 🌐 Servers

| Endpoint | Method | توضیح | Auth |
|----------|--------|-------|------|
| `/servers` | GET | لیست سرورهای فعال | ❌ |

---

## 📋 Subscriptions

| Endpoint | Method | توضیح | Auth |
|----------|--------|-------|------|
| `/subscriptions` | GET | لیست اشتراک‌های کاربر | ✅ |
| `/subscriptions/[id]` | GET | جزئیات اشتراک | ✅ |

---

## 💳 Invoices

| Endpoint | Method | توضیح | Auth |
|----------|--------|-------|------|
| `/invoices` | GET | لیست فاکتورها | ✅ |
| `/invoices` | POST | ایجاد فاکتور جدید | ✅ |
| `/invoices/[id]` | GET | جزئیات فاکتور | ✅ |

---

## ⚙️ Configs

| Endpoint | Method | توضیح | Auth |
|----------|--------|-------|------|
| `/configs` | GET | لیست کانفیگ‌های کاربر | ✅ |
| `/configs/[id]` | GET | جزئیات کانفیگ | ✅ |

---

## 🎫 Tickets

| Endpoint | Method | توضیح | Auth |
|----------|--------|-------|------|
| `/tickets` | GET | لیست تیکت‌ها | ✅ |
| `/tickets` | POST | ایجاد تیکت جدید | ✅ |
| `/tickets/[id]` | GET | جزئیات تیکت | ✅ |
| `/tickets/[id]` | PATCH | بروزرسانی وضعیت | ✅ (Admin) |
| `/tickets/[id]/messages` | GET | پیام‌های تیکت | ✅ |
| `/tickets/[id]/messages` | POST | ارسال پیام جدید | ✅ |

---

## 📱 Telegram

| Endpoint | Method | توضیح | Auth |
|----------|--------|-------|------|
| `/telegram/webhook` | POST | دریافت پیام‌های تلگرام | Secret Token |

---

## 👑 Admin Endpoints

### Users
| Endpoint | Method | توضیح | Auth |
|----------|--------|-------|------|
| `/admin/users` | GET | لیست کاربران | Admin, Support |
| `/admin/users/[id]` | GET | جزئیات کاربر | Admin, Support |
| `/admin/users/[id]` | PATCH | ویرایش کاربر | Admin |

### Plans
| Endpoint | Method | توضیح | Auth |
|----------|--------|-------|------|
| `/admin/plans` | GET | لیست پلن‌ها (شامل غیرفعال) | Admin |
| `/admin/plans` | POST | ایجاد پلن جدید | Admin |
| `/admin/plans/[id]` | GET | جزئیات پلن | Admin |
| `/admin/plans/[id]` | PATCH | ویرایش پلن | Admin |
| `/admin/plans/[id]` | DELETE | حذف پلن (soft) | Admin |

### Servers
| Endpoint | Method | توضیح | Auth |
|----------|--------|-------|------|
| `/admin/servers` | GET | لیست سرورها | Admin |
| `/admin/servers` | POST | افزودن سرور | Admin |
| `/admin/servers/[id]` | GET | جزئیات سرور | Admin |
| `/admin/servers/[id]` | PATCH | ویرایش سرور | Admin |

### Audit Logs
| Endpoint | Method | توضیح | Auth |
|----------|--------|-------|------|
| `/admin/audit-logs` | GET | لیست لاگ‌ها | Admin |

---

## 📤 Response Format

### Success
```json
{
  "...resource": { ... },
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### Error
```json
{
  "code": "ERROR_CODE",
  "message": "Error description",
  "details": { ... }
}
```

---

## 🔢 HTTP Status Codes

| Code | توضیح |
|------|-------|
| 200 | موفق |
| 201 | ایجاد شده |
| 400 | درخواست نامعتبر |
| 401 | احراز هویت نشده |
| 403 | دسترسی ممنوع |
| 404 | یافت نشد |
| 409 | تعارض |
| 429 | درخواست زیاد |
| 500 | خطای سرور |
