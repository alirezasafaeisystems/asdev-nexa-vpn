# Database Schema

---

## 📊 ERD (Entity Relationship Diagram)

```
┌─────────────────────────────────────────────────────────────────┐
│                        NexaVPN Database                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐       ┌───────────┐       ┌─────────┐             │
│  │  User   │──1:n──│  Session  │       │  Plan   │             │
│  └────┬────┘       └───────────┘       └────┬────┘             │
│       │                                      │                   │
│       │         ┌───────────┐                │                   │
│       ├────1:n──│Subscription│◀────────1:n───┤                   │
│       │         └─────┬─────┘                │                   │
│       │               │                      │                   │
│       │         ┌─────┴─────┐                │                   │
│       │         │ VPNServer │◀───────────────┘                   │
│       │         └─────┬─────┘                                    │
│       │               │                                          │
│       │         ┌─────┴─────┐                                    │
│       ├────1:n──│ UserConfig │                                   │
│       │         └───────────┘                                    │
│       │                                                          │
│       │         ┌───────────┐                                    │
│       ├────1:n──│  Invoice  │◀────────1:n───┐                    │
│       │         └─────┬─────┘               │                    │
│       │               │                     │                    │
│       │         ┌─────┴─────┐         ┌─────┴─────┐             │
│       │         │  Payment  │─────────│   Plan    │             │
│       │         └───────────┘         └───────────┘             │
│       │                                                          │
│       │         ┌───────────┐                                    │
│       ├────1:n──│  Ticket   │                                    │
│       │         └─────┬─────┘                                    │
│       │               │                                          │
│       │         ┌─────┴─────┐                                    │
│       └─────────│TicketMsg  │                                    │
│                 └───────────┘                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Models

### User
```prisma
model User {
  id            String   @id @default(cuid())
  email         String?  @unique
  phone         String?  @unique
  passwordHash  String?
  displayName   String?
  role          Role     @default(USER)
  isBlocked     Boolean  @default(false)
  hasUsedTrial  Boolean  @default(false)
}
```

### Plan
```prisma
model Plan {
  id            String   @id @default(cuid())
  name          String       // English name
  nameFa        String       // Persian name
  priceUsd      Float
  priceToman    Float?
  durationDays  Int
  trafficGB     Int?         // null = unlimited
  maxDevices    Int
  features      String?      // JSON
  featuresFa    String?      // JSON
  isTrial       Boolean  @default(false)
  isActive      Boolean  @default(true)
}
```

### VPNServer
```prisma
model VPNServer {
  id            String   @id @default(cuid())
  name          String
  location      String
  countryCode   String
  domain        String
  port          Int
  status        ServerStatus @default(ONLINE)
  maxUsers      Int
  currentUsers  Int
  loadPercent   Int
}
```

### UserConfig
```prisma
model UserConfig {
  id            String   @id @default(cuid())
  userId        String
  serverId      String
  uuid          String   @unique
  protocol      ConfigProtocol
  configUrl     String?
  configJson    String?
  hiddifyUserId String?
  isActive      Boolean
  expiresAt     DateTime
}
```

### Subscription
```prisma
model Subscription {
  id            String   @id @default(cuid())
  userId        String
  planId        String
  serverId      String?
  status        SubscriptionStatus
  startedAt     DateTime
  expiresAt     DateTime
  trafficGB     Int?
  usedGB        Float
}
```

### Invoice
```prisma
model Invoice {
  id              String   @id @default(cuid())
  userId          String
  planId          String
  status          InvoiceStatus
  amountUsd       Float
  asset           String
  network         String
  amountAsset     Float
  address         String
  rateLockedUntil DateTime
}
```

---

## 🔢 Enums

### Role
```typescript
enum Role {
  USER
  SUPPORT
  ADMIN
}
```

### SubscriptionStatus
```typescript
enum SubscriptionStatus {
  ACTIVE
  EXPIRED
  CANCELED
  SUSPENDED
}
```

### InvoiceStatus
```typescript
enum InvoiceStatus {
  CREATED
  PENDING
  PAID
  EXPIRED
  REFUNDED
  CANCELED
}
```

### ServerStatus
```typescript
enum ServerStatus {
  ONLINE
  OFFLINE
  MAINTENANCE
}
```

### ConfigProtocol
```typescript
enum ConfigProtocol {
  VLESS
  VMESS
  TROJAN
  SHADOWSOCKS
  WIREGUARD
}
```

---

## 📊 Indexes

| Model | Field | Type | Purpose |
|-------|-------|------|---------|
| User | email | Unique | Login lookup |
| User | role | Index | Admin queries |
| Session | userId | Index | User sessions |
| Session | expiresAt | Index | Cleanup |
| Subscription | userId, status | Index | User active subs |
| Invoice | userId, status | Index | User invoices |
| Invoice | rateLockedUntil | Index | Expiry check |
| UserConfig | userId | Index | User configs |
| UserConfig | expiresAt | Index | Cleanup |
