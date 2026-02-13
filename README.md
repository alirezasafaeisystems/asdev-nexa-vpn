# asdev-nexa-vpn

Nexa VPN project under ASDEV standards with explicit allowance for external dependencies.

## Status
- Platform implemented and merged to `main`
- Security and API hardening completed (2026-02-13)
- Docs and build pipeline aligned with current codebase

## Notes
External integrations are allowed by design and must follow asdev-standards-platform governance for dependency and access controls.

# NexaVPN

> **نسل بعدی امنیت دیجیتال**

پلتفرم فروش اشتراک VPN با قابلیت‌های:
- 🌐 وب‌سایت فروش فارسی
- 💳 پرداخت با ارز دیجیتال (USDT)
- 🔗 اتصال خودکار به Hiddify
- 📱 پشتیبانی تلگرام

---

## 🚀 شروع سریع

```bash
# Clone
git clone https://github.com/your-repo/nexavpn.git
cd nexavpn

# Install
bun install

# Setup environment
cp .env.example .env
# Edit .env with your values

# Database
bun run db:push
bun run seed.ts

# Run
bun run dev
```

---

## 📚 مستندات

تمام مستندات در پوشه [`docs/`](./docs/README.md) موجود است.

---

## 🆕 آخرین تغییرات

- سخت‌گیری امنیتی روی API تیکت‌ها (احراز هویت و مالکیت)
- افزودن endpointهای مدیریتی پلن/سرور و جزئیات کانفیگ
- همسان‌سازی کامل مستندات API با کد
- رفع خطاهای TypeScript build و پایدارسازی build نهایی

---

## 🔑 اطلاعات تست

| نقش | ایمیل | رمز عبور |
|-----|-------|----------|
| Admin | admin@nexavpn.com | admin123 |
| User | user@nexavpn.com | user123 |

---

## 🏗️ معماری

```
┌─────────────────────────────────────────────┐
│              NexaVPN Platform                │
├─────────────────────────────────────────────┤
│  Frontend (Next.js)                          │
│  ├── Landing Page                            │
│  ├── User Panel                              │
│  └── Admin Panel                             │
├─────────────────────────────────────────────┤
│  Backend                                     │
│  ├── API Routes                              │
│  ├── Database (Prisma)                       │
│  └── Worker (BullMQ)                         │
├─────────────────────────────────────────────┤
│  External                                    │
│  ├── Hiddify Panel                           │
│  └── Telegram Bot                            │
└─────────────────────────────────────────────┘
```

---

## 📋 ویژگی‌ها

### ✅ MVP
- [x] Landing Page فارسی RTL
- [x] سیستم احراز هویت
- [x] پنل کاربری
- [x] پنل ادمین
- [x] سیستم پرداخت کریپتو
- [x] مدیریت پلن‌ها
- [x] مدیریت سرورها

### 🔄 در حال توسعه
- [ ] اتصال به Hiddify
- [ ] ربات تلگرام
- [ ] Trial رایگان

---

## 🛠️ تکنولوژی‌ها

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI | shadcn/ui |
| Database | Prisma + SQLite |
| Queue | BullMQ + Redis |
| Auth | Cookie Sessions |

---

## 📄 License

MIT

---

## 📞 ارتباط

- تلگرام: [@nexavpn](https://t.me/nexavpn)
- ایمیل: support@nexavpn.com
