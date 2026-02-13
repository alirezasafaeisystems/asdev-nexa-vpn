# Crypto Payment Integration

---

## 💰 Overview

NexaVPN uses cryptocurrency (USDT TRC20) for payments to maintain user privacy.

---

## ⚙️ Configuration

```env
# USDT TRC20 Wallet
CRYPTO_USDT_ADDRESS=TJxYourWalletAddress
CRYPTO_USDT_NETWORK=TRC20

# BTC Wallet (optional)
CRYPTO_BTC_ADDRESS=bc1qYourWalletAddress
CRYPTO_BTC_NETWORK=BTC

# Payment Settings
INVOICE_EXPIRY_MINUTES=60
RATE_LOCK_MINUTES=30
```

---

## 🔄 Payment Flow

```
┌─────────────┐
│   Create    │
│   Invoice   │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│   Show      │────▶│   User      │
│   Address   │     │   Pays      │
└─────────────┘     └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Blockchain │
                    │ Transaction │
                    └──────┬──────┘
                           │
       ┌───────────────────┘
       ▼
┌─────────────┐     ┌─────────────┐
│  Payment    │────▶│   Manual    │
│   Watch     │     │ Verification│
└─────────────┘     └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Provision  │
                    │   Account   │
                    └─────────────┘
```

---

## 💳 Invoice Structure

| Field | Description |
|-------|-------------|
| `amountUsd` | Price in USD |
| `asset` | USDT or BTC |
| `network` | TRC20 or BTC |
| `amountAsset` | Amount in crypto |
| `address` | Payment address |
| `rateLockedUntil` | Exchange rate lock expiry |

---

## 🔍 Payment Verification (MVP)

### Manual Verification
1. Admin checks wallet transactions
2. Matches transaction to invoice (amount + timestamp)
3. Manually marks payment as confirmed
4. System triggers provisioning

### Automated Verification (Future)
```typescript
// TronGrid API for TRC20
const response = await fetch(
  `https://apilist.tronscanapi.com/api/transaction?address=${walletAddress}`
);

// Find matching transaction
const tx = transactions.find(tx => 
  tx.to_address === walletAddress &&
  tx.token_info.symbol === 'USDT' &&
  parseFloat(tx.amount) >= expectedAmount * 0.99 // 1% tolerance
);
```

---

## ⚠️ Security Considerations

- Never store private keys in code
- Use environment variables for addresses
- Implement rate limiting on invoice creation
- Log all payment attempts

---

## 📝 Implementation Checklist

- [x] Invoice creation with crypto address
- [x] Invoice expiry management
- [x] Payment status tracking
- [ ] Blockchain verification (post-MVP)
- [ ] Auto-settlement (post-MVP)
