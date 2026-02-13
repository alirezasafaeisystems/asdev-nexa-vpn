# Database Models

This page provides a concise index of the core Prisma models used in NexaVPN.

## Identity & Access
- `User`
- `Session`
- `TelegramLink`

## Product & Delivery
- `Plan`
- `Subscription`
- `VPNServer`
- `UserConfig`
- `UserUsage`

## Billing
- `Invoice`
- `Payment`
- `IdempotencyKey`

## Support & Audit
- `Ticket`
- `TicketMessage`
- `AdminActionLog`

## System
- `Setting`

For field-level details and indexes, refer to `prisma/schema.prisma` and `docs/03-database/schema.md`.
