# Monitoring & Alerts

---

## 📊 Metrics to Track

### Application Metrics

| Metric | Description | Alert Threshold |
|--------|-------------|-----------------|
| API Response Time | Request latency | > 2s |
| API Error Rate | 5xx responses | > 1% |
| Queue Backlog | Pending jobs | > 100 |
| Queue Failures | Failed jobs | > 10 |

### Business Metrics

| Metric | Description |
|--------|-------------|
| Daily Signups | New registrations |
| Daily Revenue | Payment volume |
| Active Subscriptions | Current users |
| Support Tickets | Open tickets |

### VPN Metrics

| Metric | Description |
|--------|-------------|
| Server Status | Online/Offline |
| Server Load | CPU/Memory |
| Active Connections | Current users |

---

## 🔔 Alert Rules

### SEV1 (Critical)

| Condition | Action |
|-----------|--------|
| API 5xx > 10% | Page on-call |
| All servers offline | Page admin |
| Payment processing down | Page admin |

### SEV2 (Warning)

| Condition | Action |
|-----------|--------|
| API latency > 2s | Slack notification |
| Queue backlog > 100 | Slack notification |
| Server load > 80% | Slack notification |

---

## 📝 Logging

### Log Levels

| Level | Use Case |
|-------|----------|
| `error` | Exceptions, failures |
| `warn` | Deprecations, rate limits |
| `info` | Business events |
| `debug` | Development only |

### Structured Logs

```json
{
  "level": "info",
  "timestamp": "2024-02-12T10:00:00Z",
  "event": "invoice_created",
  "userId": "clx...",
  "planId": "plan_basic",
  "amountUsd": 4.99
}
```

---

## 📈 Dashboard (Post-MVP)

Recommended tools:
- **Grafana** - Metric visualization
- **Prometheus** - Metric collection
- **Uptime Kuma** - Uptime monitoring

---

## 📋 Runbooks

### Payment Not Detected

1. Check blockchain explorer for transaction
2. Verify wallet address matches invoice
3. Check worker logs for errors
4. Manual verification if needed
5. Update payment status via admin

### Server Offline

1. SSH to server
2. Check Hiddify service: `systemctl status hiddify`
3. Check logs: `journalctl -u hiddify -f`
4. Restart if needed: `systemctl restart hiddify`
5. Update server status in NexaVPN admin

### Telegram Webhook Down

1. Verify SSL certificate valid
2. Check webhook status: `getWebhook` API
3. Re-set webhook if needed
4. Check server logs for errors
