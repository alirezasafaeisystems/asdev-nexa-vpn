# Changelog

All notable changes to NexaVPN will be documented in this file.

---

## [0.2.1] - 2026-02-14

### Branding
- Added ASDEV branding source config: `src/lib/brand.ts`.
- Added footer attribution and link to `/brand` on landing page.
- Added public brand page route: `/brand`.

### SEO
- Added `src/app/sitemap.ts` and `src/app/robots.ts`.
- Updated app metadata with canonical/OpenGraph baseline in `src/app/layout.tsx`.

## [0.2.0] - 2026-02-13

### Security
- Enforced authenticated access for ticket creation and ticket message posting.
- Fixed ticket ownership checks to prevent anonymous message injection.
- Normalized ticket message author role assignment for authenticated users.

### API
- Added `GET /api/v1/configs/[id]`.
- Added `POST /api/v1/admin/plans`.
- Added `POST /api/v1/admin/servers`.
- Added `GET /api/v1/admin/servers/[id]`.
- Added `PATCH /api/v1/admin/servers/[id]`.
- Expanded validation schemas for plans and servers.

### Fixes
- Fixed double request-body read in `PATCH /api/v1/admin/users/[id]`.
- Fixed worker database configuration to use `DATABASE_URL` (with local fallback).
- Removed invalid `provisionRef` usage from worker subscription provisioning flow.
- Hardened Prisma logging behavior by environment.
- Replaced dynamic Tailwind color class composition with static classes.
- Enabled strict TypeScript build enforcement (removed ignored build errors).

### Maintenance
- Split root page entry into a thin wrapper (`src/app/page.tsx`) and main app module (`src/components/nexa/nexa-app.tsx`).
- Consolidated Prisma seed entrypoint to a single source (`seed.ts`).
- Added `.env.example` with complete local setup variables.
- Updated API documentation to match implemented endpoints and auth behavior.

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
