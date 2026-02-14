# NexaVPN Documentation

> **نسل بعدی امنیت دیجیتال**  
> مستندات فنی پلتفرم فروش اشتراک VPN

---

## 📚 فهرست مستندات

### 00 - Overview (مروری کلی)
- [Product Brief](./00-overview/product-brief.md) - معرفی محصول و اهداف
- [Glossary](./00-overview/glossary.md) - واژه‌نامه فنی

### 01 - Architecture (معماری)
- [System Context](./01-architecture/system-context.md) - بافت سیستم
- [Data Flow](./01-architecture/data-flow.md) - جریان داده‌ها
- [Security](./01-architecture/security.md) - امنیت و حریم خصوصی

### 02 - API (رابط‌های برنامه‌نویسی)
- [Endpoints](./02-api/endpoints.md) - تمام API endpoints
- [Authentication](./02-api/authentication.md) - احراز هویت

### 03 - Database (پایگاه داده)
- [Schema](./03-database/schema.md) - ساختار جداول
- [Models](./03-database/models.md) - مدل‌های داده

### 04 - Integration (یکپارچه‌سازی)
- [Hiddify](./04-integration/hiddify.md) - اتصال به پنل Hiddify
- [Telegram](./04-integration/telegram.md) - ربات تلگرام

### 05 - Deployment (استقرار)
- [Deployment Guide](./05-deployment/deployment.md) - راهنمای نصب

### 06 - Roadmap (نقشه راه)
- [Roadmap](./06-roadmap/roadmap.md) - نقشه راه توسعه

### Reports (گزارش‌های اجرایی)
- [Phase 2 SEO Report](./reports/PHASE_2_SEO_REPORT.md)
- [Phase 4 Standardization Report](./reports/PHASE_4_STANDARDIZATION_REPORT.md)

---

## 🚀 شروع سریع

```bash
# نصب dependencies
bun install

# تنظیم متغیرهای محیطی
cp .env.example .env

# ایجاد دیتابیس
bun run db:push

# پر کردن داده‌های اولیه
bun run seed.ts

# اجرای سرور
bun run dev
```

---

## 📋 PR Checklist

قبل از هر Pull Request، مطمئن شوید:

- [ ] کد با `bun run lint` بدون خطا اجرا می‌شود
- [ ] کد با `bun run build` بدون خطا اجرا می‌شود
- [ ] مستندات API به‌روز شده است
- [ ] تغییرات دیتابیس در schema.md ثبت شده
- [ ] تست‌های دستی انجام شده

---

**آخرین بروزرسانی:** 2026-02-14
