# Database Schema

---

## 📊 Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐
│    User     │────▶│   Session   │
└──────┬──────┘     └─────────────┘
       │
       │            ┌─────────────┐
       ├───────────▶│TelegramLink │
       │            └─────────────┘
       │
       │            ┌─────────────┐     ┌─────────────┐
       ├───────────▶│Subscription │────▶│    Plan     │
       │            └─────────────┘     └─────────────┘
       │
       │            ┌─────────────┐     ┌─────────────┐
       ├───────────▶│   Invoice   │────▶│   Payment   │
       │            └─────────────┘     └─────────────┘
       │
       │            ┌─────────────┐     ┌─────────────┐
       ├───────────▶│   Ticket    │────▶│TicketMessage│
       │            └─────────────┘     └─────────────┘
       │
       │            ┌─────────────┐
       ├───────────▶│  UserConfig │────▶┌─────────────┐
       │            └─────────────┘     │  VPNServer  │
       │                                └─────────────┘
       │            ┌─────────────┐
       └───────────▶│  UserUsage  │
                    └─────────────┘
```

---

## 📋 Table Definitions

### User
| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| email | String? | Unique email |
| phone | String? | Unique phone |
| passwordHash | String? | bcrypt hash |
| displayName | String? | Display name |
| role | Enum | USER/SUPPORT/ADMIN |
| isBlocked | Boolean | Account blocked |
| hasUsedTrial | Boolean | Trial used |

### Plan
| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| name | String | English name |
| nameFa | String | Persian name |
| priceUsd | Float | Price in USD |
| priceToman | Float? | Price in Toman |
| durationDays | Int | Subscription duration |
| trafficGB | Int? | Traffic limit (null = unlimited) |
| maxDevices | Int | Max devices |
| features | String? | JSON array |
| featuresFa | String? | Persian features |
| isTrial | Boolean | Is trial plan |

### VPNServer
| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| name | String | Server name |
| location | String | Location name |
| countryCode | String | ISO country code |
| domain | String | Server domain |
| status | Enum | ONLINE/OFFLINE/MAINTENANCE |
| maxUsers | Int | Max capacity |
| currentUsers | Int | Current users |
| loadPercent | Int | Load percentage |

### Subscription
| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| userId | String | FK to User |
| planId | String | FK to Plan |
| serverId | String? | FK to VPNServer |
| status | Enum | ACTIVE/EXPIRED/etc |
| expiresAt | DateTime | Expiration date |
| trafficGB | Int? | Total allowed |
| usedGB | Float | Used traffic |

### UserConfig
| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| userId | String | FK to User |
| serverId | String | FK to VPNServer |
| uuid | String | Unique config UUID |
| protocol | Enum | VLESS/VMESS/etc |
| configUrl | String? | vless://... link |
| configJson | String? | Full config |
| hiddifyUserId | String? | Hiddify reference |
| isActive | Boolean | Config active |
| expiresAt | DateTime | Expiration date |

### Invoice
| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| userId | String | FK to User |
| planId | String | FK to Plan |
| status | Enum | PENDING/PAID/etc |
| amountUsd | Float | Amount in USD |
| asset | String | USDT/BTC |
| network | String | TRC20/BTC |
| address | String | Payment address |
| rateLockedUntil | DateTime | Rate lock expiry |

### Payment
| Column | Type | Description |
|--------|------|-------------|
| id | String (CUID) | Primary key |
| invoiceId | String | FK to Invoice |
| status | Enum | SETTLED/etc |
| txid | String? | Transaction ID |
| amountAsset | Float | Amount in asset |

---

## 📊 Enums

### Role
```
USER | SUPPORT | ADMIN
```

### SubscriptionStatus
```
ACTIVE | EXPIRED | CANCELED | SUSPENDED
```

### InvoiceStatus
```
CREATED | PENDING | PAID | EXPIRED | REFUNDED | CANCELED
```

### PaymentStatus
```
CREATED | PENDING | DETECTED | CONFIRMED | SETTLED | FAILED | EXPIRED | REFUNDED
```

### ServerStatus
```
ONLINE | OFFLINE | MAINTENANCE
```

### ConfigProtocol
```
VLESS | VMESS | TROJAN | SHADOWSOCKS | WIREGUARD
```
