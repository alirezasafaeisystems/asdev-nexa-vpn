# NexaVPN Roadmap

> **نقشه راه توسعه پلتفرم**

---

## 📅 Timeline Overview

```
2024 Q1          2024 Q2          2024 Q3          2024 Q4
    │                │                │                │
    ▼                ▼                ▼                ▼
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  MVP    │    │ Growth  │    │  Scale  │    │ Mature  │
│ Phase 1 │───▶│ Phase 2 │───▶│ Phase 3 │───▶│ Phase 4 │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
```

---

## 🎯 Phase 1: MVP (هفته ۱-۴)

### هدف
راه‌اندازی سریع با حداقل ویژگی‌های لازم

### ✅ Completed
- [x] Landing Page فارسی
- [x] سیستم احراز هویت
- [x] پنل کاربری
- [x] پنل ادمین
- [x] سیستم پرداخت کریپتو
- [x] API endpoints

### 🔄 In Progress
- [ ] اتصال به Hiddify API
- [ ] تنظیم Telegram Bot
- [ ] Worker service

### 📋 Todo
- [ ] تست کاربران اولیه
- [ ] رفع باگ‌ها

---

## 🚀 Phase 2: Growth (ماه ۲-۳)

### هدف
رشد کاربران و بهبود تجربه

### Features
| Feature | Priority | Status |
|---------|----------|--------|
| Trial رایگان ۳ روزه | 🔴 High | ⏳ Pending |
| QR Code برای کانفیگ | 🟡 Medium | ⏳ Pending |
| Multi-server support | 🔴 High | ⏳ Pending |
| Usage dashboard | 🟡 Medium | ⏳ Pending |
| Email notifications | 🟡 Medium | ⏳ Pending |
| Affiliate system | 🟢 Low | ⏳ Pending |

### Technical
- [ ] Redis برای cache
- [ ] PostgreSQL migration
- [ ] Monitoring setup
- [ ] Automated backups

---

## 📈 Phase 3: Scale (ماه ۴-۶)

### هدف
مقیاس‌پذیری و بهینه‌سازی

### Features
| Feature | Priority | Status |
|---------|----------|--------|
| Mobile App (PWA) | 🔴 High | ⏳ Pending |
| Auto server selection | 🟡 Medium | ⏳ Pending |
| Traffic analytics | 🟡 Medium | ⏳ Pending |
| Reseller panel | 🟢 Low | ⏳ Pending |
| API for developers | 🟢 Low | ⏳ Pending |

### Infrastructure
- [ ] Load balancing
- [ ] CDN setup
- [ ] Multi-region servers
- [ ] Database replication

---

## 🏆 Phase 4: Mature (ماه ۷+)

### هدف
بلوغ و ثبات

### Features
| Feature | Priority | Status |
|---------|----------|--------|
| Native Mobile App | 🟡 Medium | ⏳ Pending |
| Advanced analytics | 🟡 Medium | ⏳ Pending |
| White-label option | 🟢 Low | ⏳ Pending |
| Enterprise features | 🟢 Low | ⏳ Pending |
| Multiple payment methods | 🟡 Medium | ⏳ Pending |

---

## 🐛 Known Issues

| Issue | Severity | Status |
|-------|----------|--------|
| Worker needs Redis | 🟡 Medium | Documented |
| Placeholder crypto address | 🟡 Medium | Documented |
| Hiddify API not connected | 🔴 High | Pending setup |

---

## 📊 Success Metrics

| Metric | Current | Target (Q1) | Target (Q2) |
|--------|---------|-------------|-------------|
| Users | 0 | 100 | 1,000 |
| Active Subscriptions | 0 | 50 | 500 |
| Monthly Revenue | $0 | $500 | $5,000 |
| Support Response Time | N/A | < 2h | < 1h |

---

## 🔮 Future Ideas

### Under Consideration
- [ ] درگاه پرداخت ریالی
- [ ] اپلیکیشن iOS/Android
- [ ] پنل نمایندگی
- [ ] IP اختصاصی
- [ ] Port forwarding
- [ ] Multi-hop VPN

### Rejected (MVP)
- ❌ Enterprise SSO
- ❌ White-glove onboarding
- ❌ 24/7 phone support

---

## 📝 Changelog

### v0.1.0 (Current)
- Initial MVP release
- Landing page
- User/Admin panels
- Basic payment flow

### v0.2.0 (Planned)
- Hiddify integration
- Telegram bot
- Trial system

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Submit pull request
4. Code review
5. Merge

---

**Last Updated:** 1404/02/12
