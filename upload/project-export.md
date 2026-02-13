# Project Export

## Project Structure

```
📁 vpn-b2c-blueprint
  📁 app
    📁 api
      📁 v1
        📁 telegram
          📁 webhook
            📄 route.ts
        📁 tickets
          📄 route.ts
  📁 docs
    📁 00-overview
      📄 glossary.md
      📄 product-brief.md
      📄 scope-non-goals.md
    📁 01-architecture
      📄 availability-slo.md
      📄 data-flow.md
      📄 privacy-by-design.md
      📄 system-context.md
      📄 threat-model.md
    📁 02-api
      📄 admin.md
      📄 api-conventions.md
      📄 auth.md
      📄 billing-payments.md
      📄 openapi.yaml
      📄 tickets-support.md
      📄 webhooks-telegram.md
    📁 03-data
      📄 data-retention.md
      📄 erd.md
      📄 prisma-schema-notes.md
    📁 04-jobs
      📄 idempotency.md
      📄 queues-bullmq.md
    📁 05-ops
      📄 backups-restore.md
      📄 incident-playbook.md
      📄 observability.md
      📄 runbooks.md
    📁 06-adr
      📄 0001-monorepo-nextjs-integrated.md
      📄 0002-auth-db-sessions.md
      📄 0003-queue-first-automation.md
    📄 README.md
  📁 prisma
    📄 schema.prisma
  📁 src
    📁 server
      📁 db
        📄 prisma.ts
      📁 http
        📄 errors.ts
      📁 jobs
        📁 handlers
          📄 notifySupport.ts
        📄 enqueue.ts
        📄 queues.ts
      📁 telegram
        📄 send.ts
  📁 worker
    📄 index.ts
  📄 .env.example
  📄 docker-compose.yml
  📄 package.json
  📄 README.md
```

## Files

### vpn-b2c-blueprint/.env.example
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.32 KB

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app
REDIS_URL=redis://localhost:6379

APP_BASE_URL=http://localhost:3000

SESSION_COOKIE_NAME=sid
SESSION_TTL_DAYS=30

TELEGRAM_BOT_TOKEN=123:abc
TELEGRAM_WEBHOOK_SECRET=super-secret-token
TELEGRAM_SUPPORT_CHAT_ID=-1001234567890

ADMIN_BOOTSTRAP_EMAIL=admin@example.com

```

### vpn-b2c-blueprint/README.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.88 KB

```markdown
# Integrated Next.js B2C Service Blueprint (Docs-first)

This repository is a **docs-first blueprint** for an integrated Next.js (App Router) architecture:
- Public website + User Panel + Admin Panel
- REST API via Route Handlers
- Postgres (Prisma) + Redis (BullMQ) + Telegram Webhook support

> This blueprint focuses on **security, privacy-by-design, reliability, and automation**.
> It does **not** include guidance for bypassing restrictions or any “guaranteed unfilterable” technique.

## Processes
- Web: Next.js app (UI + API)
- Worker: BullMQ processors (separate process)
- Telegram: Webhook receiver runs inside Next.js API

## Quick Start (local)
1) Copy `.env.example` to `.env`
2) Install deps: `pnpm i` (or npm/yarn)
3) Start db/redis: `docker compose up -d`
4) Run migrations: `pnpm prisma:migrate`
5) Dev server: `pnpm dev`
6) Worker: `pnpm worker`

## Documentation
See `/docs`.

```

### vpn-b2c-blueprint/app/api/v1/telegram/webhook/route.ts
Last modified: 2026-02-12T04:38:54.000Z
Size: 1.88 KB

```typescript
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/server/db/prisma";
import { HttpError, toErrorResponse } from "@/src/server/http/errors";
import { enqueueNotifySupport } from "@/src/server/jobs/enqueue";

const UpdateSchema = z.object({
  update_id: z.number(),
  message: z.object({
    message_id: z.number(),
    chat: z.object({ id: z.number() }),
    text: z.string().optional(),
    reply_to_message: z.object({ message_id: z.number(), text: z.string().optional() }).optional()
  }).optional()
});

export async function POST(req: Request) {
  try {
    const secret = req.headers.get("x-telegram-bot-api-secret-token");
    if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
      throw new HttpError(401, "UNAUTHORIZED", "Invalid telegram secret");
    }

    const update = UpdateSchema.parse(await req.json());
    const msg = update.message;
    if (!msg?.text) return NextResponse.json({ ok: true });

    const text = msg.text.trim();
    const ticketIdMatch = text.match(/TicketID:\s*([a-zA-Z0-9_-]+)/i);
    const ticketId = ticketIdMatch?.[1];

    if (ticketId) {
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (ticket) {
        await prisma.ticketMessage.create({
          data: {
            ticketId: ticket.id,
            authorRole: "SUPPORT",
            body: text.replace(/TicketID:\s*.+$/i, "").trim(),
            telegramMessageId: String(msg.message_id)
          }
        });
        await prisma.ticket.update({
          where: { id: ticket.id },
          data: { status: "PENDING_USER", lastMessageAt: new Date() }
        });
        await enqueueNotifySupport({ ticketId: ticket.id, kind: "NEW_MESSAGE" });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const e = toErrorResponse(err);
    return NextResponse.json(e.body, { status: e.status });
  }
}

```

### vpn-b2c-blueprint/app/api/v1/tickets/route.ts
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.92 KB

```typescript
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/src/server/db/prisma";
import { toErrorResponse } from "@/src/server/http/errors";
import { enqueueNotifySupport } from "@/src/server/jobs/enqueue";

const CreateTicketSchema = z.object({
  subject: z.string().min(3).max(120),
  body: z.string().min(1).max(4000),
});

export async function POST(req: Request) {
  try {
    const input = CreateTicketSchema.parse(await req.json());
    const ticket = await prisma.ticket.create({
      data: {
        subject: input.subject,
        source: "WEB",
        messages: { create: [{ authorRole: "USER", body: input.body }] }
      }
    });
    await enqueueNotifySupport({ ticketId: ticket.id, kind: "NEW_TICKET" });
    return NextResponse.json({ ticket }, { status: 201 });
  } catch (err) {
    const e = toErrorResponse(err);
    return NextResponse.json(e.body, { status: e.status });
  }
}

```

### vpn-b2c-blueprint/docker-compose.yml
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.31 KB

```yaml
version: "3.9"
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_USER: postgres
      POSTGRES_DB: app
    ports:
      - "5432:5432"
    volumes:
      - dbdata:/var/lib/postgresql/data

  redis:
    image: redis:7
    ports:
      - "6379:6379"

volumes:
  dbdata:

```

### vpn-b2c-blueprint/docs/00-overview/glossary.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.16 KB

```markdown
# Glossary
**Last updated:** 2026-02-12

Idempotency: safe retries without duplication.
SLO/SLA: reliability targets.
Invoice/Payment/Subscription: billing entities.

```

### vpn-b2c-blueprint/docs/00-overview/product-brief.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.34 KB

```markdown
# Product Brief
**Last updated:** 2026-02-12

Goal: Build a support-first B2C subscription product with automated delivery and Telegram support.

KPIs (MVP):
- Payment→Provision ≥ 99%
- Median first-response ≤ 2h (business hours)
- Monitor refund and renewal rates

Channels:
- Web (site + panel)
- Telegram (support + optional account linking)

```

### vpn-b2c-blueprint/docs/00-overview/scope-non-goals.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.30 KB

```markdown
# Scope & Non-goals
**Last updated:** 2026-02-12

In-scope:
- Site + user panel + minimal admin
- Invoices, payments, subscriptions
- Tickets mirrored to Telegram support chat
- BullMQ jobs: notify, payment_watch, provision, retention_cleanup

Non-goals (MVP):
- Native apps, complex ML, enterprise multi-tenant

```

### vpn-b2c-blueprint/docs/01-architecture/availability-slo.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.18 KB

```markdown
# Availability SLO
**Last updated:** 2026-02-12

Baseline: 99.5% API availability, ≥99% payment→provision.
Alerts: 5xx spikes, queue backlog, provision failures, webhook auth failures.

```

### vpn-b2c-blueprint/docs/01-architecture/data-flow.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.22 KB

```markdown
# Data Flow
**Last updated:** 2026-02-12

1) Create invoice (Idempotency-Key)
2) Worker watches payments → settles
3) Provision job grants/extends subscription
4) Tickets mirrored to Telegram; replies synced back via webhook

```

### vpn-b2c-blueprint/docs/01-architecture/privacy-by-design.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.14 KB

```markdown
# Privacy by Design
**Last updated:** 2026-02-12

Minimize data; avoid storing sensitive configs; define retention; audit admin mutations.

```

### vpn-b2c-blueprint/docs/01-architecture/system-context.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.19 KB

```markdown
# System Context
**Last updated:** 2026-02-12

Components: Next.js (UI+API), Postgres, Redis+BullMQ, Telegram webhook.
Principles: minimal external deps, queue-first automation, privacy-by-design.

```

### vpn-b2c-blueprint/docs/01-architecture/threat-model.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.22 KB

```markdown
# Threat Model
**Last updated:** 2026-02-12

Threats: brute force, session theft, payment fraud, spam tickets, privilege escalation.
Mitigations: rate limits, Zod validation, RBAC, audit logs, idempotency, security headers.

```

### vpn-b2c-blueprint/docs/02-api/admin.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.08 KB

```markdown
# Admin
**Last updated:** 2026-02-12

RBAC + audit logs for admin mutations.

```

### vpn-b2c-blueprint/docs/02-api/api-conventions.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.17 KB

```markdown
# API Conventions
**Last updated:** 2026-02-12

Base: /api/v1
Auth: cookie sessions
Errors: {code,message,details?}
Idempotency: Idempotency-Key
RBAC: USER/SUPPORT/ADMIN

```

### vpn-b2c-blueprint/docs/02-api/auth.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.14 KB

```markdown
# Auth
**Last updated:** 2026-02-12

DB sessions; cookie auth.
Endpoints: login/logout/me.
Hardening: signed cookies, admin MFA (post-MVP).

```

### vpn-b2c-blueprint/docs/02-api/billing-payments.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.26 KB

```markdown
# Billing & Payments
**Last updated:** 2026-02-12

State machines:
- Invoice: CREATED→PENDING→PAID/EXPIRED/REFUNDED
- Payment: CREATED→PENDING→DETECTED→CONFIRMED→SETTLED

Jobs: payment_watch, provision, notify.
Idempotency: INVOICE_CREATE + PROVISION.

```

### vpn-b2c-blueprint/docs/02-api/openapi.yaml
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.48 KB

```yaml
openapi: 3.0.3
info:
  title: Integrated Service API (MVP)
  version: 0.1.0
servers:
  - url: /api/v1
paths:
  /tickets:
    post:
      summary: Create ticket
      responses:
        "201": { description: Created }
  /telegram/webhook:
    post:
      summary: Telegram webhook receiver
      parameters:
        - in: header
          name: x-telegram-bot-api-secret-token
          schema: { type: string }
          required: true
      responses:
        "200": { description: OK }

```

### vpn-b2c-blueprint/docs/02-api/tickets-support.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.18 KB

```markdown
# Tickets & Support
**Last updated:** 2026-02-12

Ticket states: OPEN/PENDING_SUPPORT/PENDING_USER/CLOSED
Flow: web ticket → telegram mirror → operator reply → webhook sync.

```

### vpn-b2c-blueprint/docs/02-api/webhooks-telegram.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.18 KB

```markdown
# Telegram Webhooks
**Last updated:** 2026-02-12

Validate secret header: x-telegram-bot-api-secret-token
Endpoint: POST /api/v1/telegram/webhook
Setup: setWebhook using APP_BASE_URL

```

### vpn-b2c-blueprint/docs/03-data/data-retention.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.15 KB

```markdown
# Data Retention
**Last updated:** 2026-02-12

Purge expired sessions daily; old idempotency keys periodically; define ticket/audit retention policy.

```

### vpn-b2c-blueprint/docs/03-data/erd.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.17 KB

```markdown
# ERD (Text)
**Last updated:** 2026-02-12

User->Session
User->Invoice->Payment
User->Subscription->Plan
Ticket->TicketMessage
TelegramLink links user to telegram identity.

```

### vpn-b2c-blueprint/docs/03-data/prisma-schema-notes.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.13 KB

```markdown
# Prisma Notes
**Last updated:** 2026-02-12

DB is source of truth. Avoid sensitive configs in DB; store only opaque provisionRef.

```

### vpn-b2c-blueprint/docs/04-jobs/idempotency.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.13 KB

```markdown
# Idempotency
**Last updated:** 2026-02-12

Guard critical operations via IdempotencyKey(scope,key). Store resultJson for safe replays.

```

### vpn-b2c-blueprint/docs/04-jobs/queues-bullmq.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.13 KB

```markdown
# Queues
**Last updated:** 2026-02-12

notify, payment_watch, provision, retention_cleanup. Retries + backoff. Idempotent handlers.

```

### vpn-b2c-blueprint/docs/05-ops/backups-restore.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.12 KB

```markdown
# Backups & Restore
**Last updated:** 2026-02-12

Daily Postgres backup; monthly restore drill; smoke test key flows.

```

### vpn-b2c-blueprint/docs/05-ops/incident-playbook.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.12 KB

```markdown
# Incident Playbook
**Last updated:** 2026-02-12

SEV1 purchases/provision broken; announce, mitigate, RCA, postmortem.

```

### vpn-b2c-blueprint/docs/05-ops/observability.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.12 KB

```markdown
# Observability
**Last updated:** 2026-02-12

Track API 5xx rate, latency, queue backlog/failures, webhook auth failures.

```

### vpn-b2c-blueprint/docs/05-ops/runbooks.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.23 KB

```markdown
# Runbooks
**Last updated:** 2026-02-12

Payment not detected: check worker/queues/logs.
Provision failure: inspect job failures; re-run idempotently.
Telegram webhook down: verify setWebhook, APP_BASE_URL, secret header, API errors.

```

### vpn-b2c-blueprint/docs/06-adr/0001-monorepo-nextjs-integrated.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.07 KB

```markdown
# ADR 0001
Integrated Next.js (UI + REST API) with separate worker process.

```

### vpn-b2c-blueprint/docs/06-adr/0002-auth-db-sessions.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.04 KB

```markdown
# ADR 0002
DB sessions + RBAC + audit logs.

```

### vpn-b2c-blueprint/docs/06-adr/0003-queue-first-automation.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.06 KB

```markdown
# ADR 0003
Queue-first automation via BullMQ; idempotent jobs.

```

### vpn-b2c-blueprint/docs/README.md
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.27 KB

```markdown
# Documentation Index

**Last updated:** 2026-02-12

## PR Sync Checklist
- [ ] Any new endpoint updates OpenAPI and docs/02-api/*
- [ ] Any DB change updates prisma schema notes and ERD
- [ ] Any new job updates docs/04-jobs/*
- [ ] Any new operational risk updates docs/05-ops/*

```

### vpn-b2c-blueprint/package.json
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.55 KB

```json
{
  "name": "integrated-b2c-blueprint",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "start": "next start",
    "worker": "node --loader ts-node/esm worker/index.ts",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev --name init"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "bullmq": "^5.0.0",
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.0.0"
  },
  "devDependencies": {
    "prisma": "^5.0.0",
    "ts-node": "^10.0.0",
    "typescript": "^5.0.0"
  }
}

```

### vpn-b2c-blueprint/prisma/schema.prisma
Last modified: 2026-02-12T04:38:54.000Z
Size: 5.29 KB

```
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  SUPPORT
  ADMIN
}

enum SubscriptionStatus {
  ACTIVE
  EXPIRED
  CANCELED
  SUSPENDED
}

enum InvoiceStatus {
  CREATED
  PENDING
  PAID
  EXPIRED
  REFUNDED
  CANCELED
}

enum PaymentStatus {
  CREATED
  PENDING
  DETECTED
  CONFIRMED
  SETTLED
  FAILED
  EXPIRED
  REFUNDED
}

enum TicketStatus {
  OPEN
  PENDING_USER
  PENDING_SUPPORT
  CLOSED
}

enum TicketSource {
  WEB
  TELEGRAM
}

enum IdempotencyScope {
  INVOICE_CREATE
  PAYMENT_DETECT
  PAYMENT_CONFIRM
  PROVISION
  SUBSCRIPTION_EXTEND
}

model User {
  id            String   @id @default(cuid())
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  email         String?  @unique
  phone         String?  @unique
  passwordHash  String?
  role          Role     @default(USER)

  isBlocked     Boolean  @default(false)

  sessions      Session[]
  subscriptions Subscription[]
  tickets       Ticket[]
  invoices      Invoice[]
  telegramLinks TelegramLink[]

  @@index([role])
}

model Session {
  id         String   @id @default(cuid())
  createdAt  DateTime @default(now())
  expiresAt  DateTime
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  ip         String?
  userAgent  String?

  @@index([userId])
  @@index([expiresAt])
}

model Plan {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  name        String
  description String?
  priceUsd    Decimal  @db.Decimal(12, 2)
  durationDays Int

  isActive    Boolean  @default(true)

  maxDevices  Int      @default(1)

  subscriptions Subscription[]
  invoices      Invoice[]

  @@index([isActive])
}

model Subscription {
  id         String   @id @default(cuid())
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  planId     String
  plan       Plan     @relation(fields: [planId], references: [id])

  status     SubscriptionStatus @default(ACTIVE)
  startedAt  DateTime @default(now())
  expiresAt  DateTime

  provisionRef String? @unique

  @@index([userId, status])
  @@index([expiresAt])
}

model Invoice {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  planId      String
  plan        Plan     @relation(fields: [planId], references: [id])

  status      InvoiceStatus @default(CREATED)
  amountUsd   Decimal  @db.Decimal(12, 2)

  asset       String
  network     String
  amountAsset Decimal  @db.Decimal(24, 8)
  address     String
  rateLockedUntil DateTime

  payments    Payment[]

  idempotencyKey String? @unique

  @@index([userId, status])
  @@index([rateLockedUntil])
}

model Payment {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  invoiceId   String
  invoice     Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  status      PaymentStatus @default(CREATED)

  txid        String?  @unique
  detectedAt  DateTime?
  confirmedAt DateTime?
  settledAt   DateTime?

  amountAsset Decimal  @db.Decimal(24, 8)
  asset       String
  network     String
  toAddress   String
  fromAddress String?

  @@index([invoiceId, status])
}

model Ticket {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  userId      String?
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  status      TicketStatus @default(OPEN)
  source      TicketSource @default(WEB)
  subject     String
  lastMessageAt DateTime @default(now())

  telegramChatId String?
  telegramThreadKey String?

  messages    TicketMessage[]

  @@index([status, lastMessageAt])
}

model TicketMessage {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  ticketId  String
  ticket    Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  authorRole Role
  body      String

  telegramMessageId String?

  @@index([ticketId, createdAt])
}

model TelegramLink {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  telegramUserId String
  telegramUsername String?

  isVerified Boolean @default(false)
  verifiedAt DateTime?

  lastLoginTokenHash String?
  lastLoginTokenExpiresAt DateTime?

  @@unique([telegramUserId])
  @@index([userId])
}

model AdminActionLog {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())

  actorUserId String?
  actorUser   User?    @relation(fields: [actorUserId], references: [id], onDelete: SetNull)

  action    String
  targetType String?
  targetId  String?
  metaJson  Json?

  @@index([createdAt])
  @@index([actorUserId])
}

model IdempotencyKey {
  id         String   @id @default(cuid())
  createdAt  DateTime @default(now())
  scope      IdempotencyScope
  key        String
  resultJson Json?

  @@unique([scope, key])
}

```

### vpn-b2c-blueprint/src/server/db/prisma.ts
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.30 KB

```typescript
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

```

### vpn-b2c-blueprint/src/server/http/errors.ts
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.64 KB

```typescript
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

export function toErrorResponse(err: unknown) {
  if (err instanceof HttpError) {
    return { status: err.status, body: { code: err.code, message: err.message, details: err.details } };
  }
  if (err instanceof ZodError) {
    return { status: 400, body: { code: "VALIDATION_ERROR", message: "Invalid input", details: err.flatten() } };
  }
  return { status: 500, body: { code: "INTERNAL_ERROR", message: "Something went wrong" } };
}

```

### vpn-b2c-blueprint/src/server/jobs/enqueue.ts
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.33 KB

```typescript
import { notifyQueue } from "./queues";

export async function enqueueNotifySupport(payload: { ticketId: string; kind: "NEW_TICKET" | "NEW_MESSAGE" }) {
  await notifyQueue.add("notify_support", payload, {
    attempts: 5,
    backoff: { type: "exponential", delay: 2000 },
    removeOnComplete: 2000,
    removeOnFail: 5000
  });
}

```

### vpn-b2c-blueprint/src/server/jobs/handlers/notifySupport.ts
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.66 KB

```typescript
import { prisma } from "@/src/server/db/prisma";
import { telegramSendToSupport } from "@/src/server/telegram/send";

export async function notifySupportHandler(data: { ticketId: string; kind: string }) {
  const ticket = await prisma.ticket.findUnique({
    where: { id: data.ticketId },
    include: { user: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } }
  });
  if (!ticket) return;

  const last = ticket.messages[0];
  const userLabel = ticket.user?.email ?? ticket.user?.phone ?? ticket.userId ?? "anonymous";

  await telegramSendToSupport(
    `🆕 Ticket: ${ticket.subject}\nUser: ${userLabel}\n\n${last?.body ?? ""}\n\nTicketID: ${ticket.id}`
  );
}

```

### vpn-b2c-blueprint/src/server/jobs/queues.ts
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.37 KB

```typescript
import { Queue } from "bullmq";
const connection = { url: process.env.REDIS_URL! };

export const notifyQueue = new Queue("notify", { connection });
export const paymentWatchQueue = new Queue("payment_watch", { connection });
export const provisionQueue = new Queue("provision", { connection });
export const retentionQueue = new Queue("retention_cleanup", { connection });

```

### vpn-b2c-blueprint/src/server/telegram/send.ts
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.56 KB

```typescript
export async function telegramSendToSupport(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN!;
  const chatId = process.env.TELEGRAM_SUPPORT_CHAT_ID!;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Telegram send failed: ${res.status} ${body}`);
  }
}

```

### vpn-b2c-blueprint/worker/index.ts
Last modified: 2026-02-12T04:38:54.000Z
Size: 0.33 KB

```typescript
import { Worker } from "bullmq";
import { notifySupportHandler } from "@/src/server/jobs/handlers/notifySupport";

const connection = { url: process.env.REDIS_URL! };

new Worker("notify", async (job) => {
  if (job.name === "notify_support") return notifySupportHandler(job.data as any);
}, { connection });

console.log("Worker started");

```

