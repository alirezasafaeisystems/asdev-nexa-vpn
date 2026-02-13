# Deployment Guide

---

## 🚀 راهنمای استقرار

---

## 📋 Prerequisites

| نیازمندی | نسخه |
|---------|------|
| Node.js | ≥ 18 |
| Bun | ≥ 1.0 |
| Database | SQLite / PostgreSQL |
| Redis | ≥ 7 (اختیاری) |

---

## 🔧 Environment Variables

```env
# Application
APP_URL=https://nexavpn.com
APP_NAME=NexaVPN

# Database
DATABASE_URL=file:./db/nexavpn.db
# OR PostgreSQL:
# DATABASE_URL=postgresql://user:pass@localhost:5432/nexavpn

# Session
SESSION_COOKIE_NAME=nexa_sid
SESSION_TTL_DAYS=30
SESSION_SECRET=your-super-secret-key

# Hiddify
HIDDIFY_API_URL=https://panel.nexavpn.com/api/v1
HIDDIFY_ADMIN_KEY=your-admin-key

# Crypto Payment
CRYPTO_USDT_ADDRESS=your-wallet-address

# Telegram
TELEGRAM_BOT_TOKEN=123456:ABC
TELEGRAM_WEBHOOK_SECRET=your-secret
TELEGRAM_SUPPORT_CHAT_ID=-1001234567890

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

---

## 🏗️ Build & Deploy

### Development
```bash
bun install
bun run db:push
bun run seed.ts
bun run dev
```

### Production

```bash
# Build
bun run build

# Start
bun run start

# Or with PM2
pm2 start bun --name nexavpn -- run start
```

---

## 🌐 Nginx Configuration

```nginx
server {
    listen 80;
    server_name nexavpn.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name nexavpn.com;

    ssl_certificate /etc/letsencrypt/live/nexavpn.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nexavpn.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 🔒 SSL Certificate

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d nexavpn.com

# Auto-renew
sudo certbot renew --dry-run
```

---

## 📊 Monitoring

### Logs
```bash
# View logs
pm2 logs nexavpn

# Or
tail -f /var/log/nexavpn.log
```

### Health Check
```bash
curl https://nexavpn.com/api/v1/health
```

---

## 🔄 Updates

```bash
git pull
bun install
bun run db:push
bun run build
pm2 restart nexavpn
```

---

## 🐛 Troubleshooting

### Database Error
```bash
# Reset database
bun run db:push --force-reset
bun run seed.ts
```

### Port in Use
```bash
# Find process
lsof -i :3000
# Kill
kill -9 <PID>
```

### Memory Issues
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" bun run start
```
