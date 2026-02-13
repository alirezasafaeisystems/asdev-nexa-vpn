# Deployment Guide

---

## 🚀 Prerequisites

- Node.js 18+ or Bun
- SQLite database
- Redis server (for worker)
- Hiddify Panel (for VPN)
- Telegram Bot Token
- Crypto wallet address

---

## 📦 Installation

### 1. Clone & Install

```bash
git clone https://github.com/your-repo/nexavpn.git
cd nexavpn
bun install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Database Setup

```bash
bun run db:push
bun run seed.ts
```

### 4. Start Services

```bash
# Web application
bun run dev

# Worker (separate terminal)
cd mini-services/worker && bun run dev
```

---

## 🌐 Production Deployment

### Option A: VPS (Recommended)

```yaml
# docker-compose.yml
version: '3.9'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=file:/data/nexavpn.db
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./data:/data
    depends_on:
      - redis

  worker:
    build: .
    command: bun run worker
    environment:
      - DATABASE_URL=file:/data/nexavpn.db
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./data:/data
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  redis_data:
```

### Option B: Cloud Platforms

| Platform | Compatibility |
|----------|--------------|
| Vercel | ✅ Web only |
| Railway | ✅ Full stack |
| Fly.io | ✅ Full stack |
| Self-hosted VPS | ✅ Recommended |

---

## 🔧 Configuration Checklist

- [ ] Database URL configured
- [ ] Session secret generated
- [ ] Hiddify API connected
- [ ] Telegram webhook set
- [ ] Crypto wallet address set
- [ ] SSL certificate installed

---

## 📊 Health Check

```bash
# API health
curl https://your-domain.com/api/v1/health

# Telegram webhook
curl https://your-domain.com/api/v1/telegram/webhook
```

---

## 🔒 Security Checklist

- [ ] HTTPS enabled
- [ ] Rate limiting enabled
- [ ] Secure cookies in production
- [ ] Environment variables secured
- [ ] Database backups configured
