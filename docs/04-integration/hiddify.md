# Hiddify Integration

---

## 🔗 اتصال به پنل Hiddify

Hiddify یک پنل مدیریت VPN متن‌باز است که NexaVPN از آن برای مدیریت کاربران استفاده می‌کند.

---

## 📋 Prerequisites

1. نصب Hiddify Manager روی سرور
2. دریافت Admin API Key
3. تنظیم Inbound ID

---

## ⚙️ Configuration

```env
# .env
HIDDIFY_API_URL=https://your-panel.com/api/v1
HIDDIFY_ADMIN_KEY=your-admin-key
HIDDIFY_INBOUND_ID=1
```

---

## 🔄 API Integration

### ایجاد کاربر جدید

```typescript
// When subscription is created
async function createHiddifyUser(config: UserConfig, subscription: Subscription) {
  const response = await fetch(`${HIDDIFY_API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${HIDDIFY_ADMIN_KEY}`,
    },
    body: JSON.stringify({
      username: config.uuid,
      email: config.hiddifyEmail,
      enable: true,
      expired_at: subscription.expiresAt.toISOString(),
      data_limit: subscription.trafficGB 
        ? subscription.trafficGB * 1024 * 1024 * 1024 // GB to bytes
        : 0, // unlimited
      inbounds: [HIDDIFY_INBOUND_ID],
    }),
  });

  return response.json();
}
```

### دریافت لینک کانفیگ

```typescript
async function getConfigUrl(uuid: string): Promise<string> {
  const response = await fetch(
    `${HIDDIFY_API_URL}/users/${uuid}/config`,
    {
      headers: {
        'Authorization': `Bearer ${HIDDIFY_ADMIN_KEY}`,
      },
    }
  );

  const { config_url } = await response.json();
  return config_url;
}
```

### بروزرسانی ترافیک

```typescript
async function updateTraffic(uuid: string, usedGB: number) {
  await fetch(`${HIDDIFY_API_URL}/users/${uuid}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${HIDDIFY_ADMIN_KEY}`,
    },
    body: JSON.stringify({
      used_traffic: usedGB * 1024 * 1024 * 1024,
    }),
  });
}
```

### غیرفعال کردن کاربر

```typescript
async function disableUser(uuid: string) {
  await fetch(`${HIDDIFY_API_URL}/users/${uuid}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${HIDDIFY_ADMIN_KEY}`,
    },
    body: JSON.stringify({
      enable: false,
    }),
  });
}
```

---

## 🔄 Webhook Events (Hiddify → NexaVPN)

Hiddify می‌تواند رویدادها را به NexaVPN ارسال کند:

| Event | توضیح |
|-------|-------|
| `user.expired` | اشتراک منقضی شده |
| `user.traffic_exhausted` | ترافیک تمام شده |
| `user.connected` | کاربر متصل شده |

---

## 🛠️ Implementation Checklist

- [ ] نصب Hiddify Manager
- [ ] دریافت API Key
- [ ] تنظیم Environment Variables
- [ ] تست اتصال API
- [ ] پیاده‌سازی Provision Service
- [ ] پیاده‌سازی Deprovision Service
- [ ] تنظیم Webhook (اختیاری)

---

## 📝 Notes

1. **UUID**: هر کاربر یک UUID یکتا دارد که در Hiddify نیز استفاده می‌شود
2. **Traffic Sync**: ترافیک هر ساعت با Hiddify همگام‌سازی می‌شود
3. **Auto Disable**: کاربران منقضی به صورت خودکار غیرفعال می‌شوند
