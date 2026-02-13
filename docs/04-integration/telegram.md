# Telegram Integration

---

## 🤖 ربات تلگرام NexaVPN

از تلگرام برای:
- پشتیبانی کاربران
- اطلاع‌رسانی (New subscription, Expiry warning)
- اتصال حساب کاربری

---

## ⚙️ Configuration

```env
# .env
TELEGRAM_BOT_TOKEN=123456:ABC-DEF
TELEGRAM_WEBHOOK_SECRET=your-secret-token
TELEGRAM_SUPPORT_CHAT_ID=-1001234567890
TELEGRAM_CHANNEL_USERNAME=@nexavpn
```

---

## 🔧 Setup Steps

### 1. ایجاد Bot
```
1. @BotFather را در تلگرام باز کنید
2. /newbot را ارسال کنید
3. نام bot را وارد کنید (مثلاً NexaVPN Support)
4. Username را وارد کنید (مثلاً @nexavpn_bot)
5. Token را کپی کنید
```

### 2. دریافت Chat ID
```bash
# Add bot to group, then:
curl "https://api.telegram.org/bot<TOKEN>/getUpdates"
```

### 3. تنظیم Webhook
```bash
curl -X POST "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-domain.com/api/v1/telegram/webhook",
    "secret_token": "your-secret-token"
  }'
```

---

## 🔄 Webhook Handler

```typescript
// /api/v1/telegram/webhook/route.ts

export async function POST(req: Request) {
  // 1. Validate secret
  const secret = req.headers.get('x-telegram-bot-api-secret-token');
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  // 2. Parse update
  const update = await req.json();
  const message = update.message;

  if (!message?.text) {
    return Response.json({ ok: true });
  }

  // 3. Handle commands
  const text = message.text.trim();

  // Support reply (contains TicketID)
  const ticketMatch = text.match(/TicketID:\s*([a-zA-Z0-9_-]+)/i);
  if (ticketMatch) {
    await handleTicketReply(ticketMatch[1], text);
  }

  // /start command
  if (text.startsWith('/start')) {
    await handleStartCommand(message);
  }

  return Response.json({ ok: true });
}
```

---

## 📤 ارسال پیام

```typescript
// lib/telegram.ts

export async function sendTelegramMessage(
  chatId: string,
  text: string
): Promise<void> {
  const url = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
}

// Notify support about new ticket
export async function notifyNewTicket(ticket: Ticket) {
  const text = `
🆕 <b>تیکت جدید</b>

<b>موضوع:</b> ${ticket.subject}
<b>کاربر:</b> ${ticket.user?.email || 'ناشناس'}

<b>TicketID:</b> <code>${ticket.id}</code>
  `;

  await sendTelegramMessage(SUPPORT_CHAT_ID, text);
}
```

---

## 🔄 Commands

| Command | توضیح |
|---------|-------|
| `/start` | شروع و اتصال حساب |
| `/status` | وضعیت اشتراک |
| `/help` | راهنما |

---

## 📱 Flow: تیکت جدید

```
1. User creates ticket on website
        ↓
2. Server saves to database
        ↓
3. Worker sends to Telegram
        ↓
4. Support sees message in group
        ↓
5. Support replies (includes TicketID)
        ↓
6. Webhook receives reply
        ↓
7. Server saves to TicketMessage
        ↓
8. User sees reply in panel
```

---

## 🔒 Security

| Measure | توضیح |
|---------|-------|
| Secret Token | هر درخواست باید token داشته باشد |
| IP Validation | (اختیاری) فقط IP تلگرام مجاز |
| Rate Limiting | 100 درخواست/دقیقه |
