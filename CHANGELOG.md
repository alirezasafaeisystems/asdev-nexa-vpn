# Changelog

All notable changes to NexaVPN will be documented in this file.

---

## [0.1.0] - 2024-02-12

### Added
- **Landing Page**
  - طراحی فارسی RTL
  - تم تیره (Dark Mode)
  - گرادینت برند NexaVPN
  - بخش ویژگی‌ها
  - بخش پلن‌ها و قیمت‌گذاری
  - فرم ثبت‌نام/ورود

- **User Panel**
  - داشبورد با آمار کلی
  - مدیریت کانفیگ‌های VPN
  - خرید اشتراک جدید
  - تاریخچه پرداخت‌ها
  - سیستم تیکت پشتیبانی

- **Admin Panel**
  - مدیریت کاربران
  - مدیریت سرورها
  - مدیریت پلن‌ها
  - مشاهده لاگ‌ها

- **API Endpoints**
  - `/api/v1/auth/*` - احراز هویت
  - `/api/v1/plans` - پلن‌ها
  - `/api/v1/servers` - سرورها
  - `/api/v1/subscriptions` - اشتراک‌ها
  - `/api/v1/invoices` - فاکتورها
  - `/api/v1/configs` - کانفیگ‌ها
  - `/api/v1/tickets` - تیکت‌ها
  - `/api/v1/admin/*` - ادمین

- **Database**
  - مدل User با role-based access
  - مدل Plan با پشتیبانی فارسی
  - مدل VPNServer
  - مدل UserConfig
  - مدل Subscription
  - مدل Invoice/Payment
  - مدل Ticket/TicketMessage
  - مدل AdminActionLog

- **Plans Created**
  - Trial (رایگان ۳ روزه)
  - Basic ($4.99/ماه)
  - Pro ($9.99/ماه)
  - Premium ($19.99/ماه)

- **Servers Created**
  - Germany-1
  - Netherlands-1
  - Finland-1

### Technical
- Prisma ORM with SQLite
- Zod validation
- Rate limiting
- Cookie-based sessions
- bcrypt password hashing
- BullMQ worker service

### Documentation
- Complete docs structure
- API documentation
- Database schema
- Security guide
- Deployment guide
- Roadmap

---

## [Unreleased]

### Planned
- Hiddify API integration
- Telegram bot setup
- Trial system activation
- QR code generation
- Usage tracking
- Email notifications
