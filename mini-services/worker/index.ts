/**
 * B2C Worker Service
 * Handles background jobs: notify, payment_watch, provision, retention_cleanup
 */

import { Worker, Queue } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

// ============================================
// Configuration
// ============================================

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const WORKER_PORT = 3003;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultDbPath = path.resolve(__dirname, '../../db/custom.db');
const DATABASE_URL = process.env.DATABASE_URL || pathToFileURL(defaultDbPath).toString();

// Parse Redis URL
function parseRedisUrl(url: string): { host: string; port: number } {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname || 'localhost',
      port: parseInt(parsed.port) || 6379,
    };
  } catch {
    return { host: 'localhost', port: 6379 };
  }
}

const connection = parseRedisUrl(REDIS_URL);

// Prisma client
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

// ============================================
// Queue Definitions
// ============================================

export const queues = {
  notify: new Queue('notify', { connection }),
  paymentWatch: new Queue('payment_watch', { connection }),
  provision: new Queue('provision', { connection }),
  retentionCleanup: new Queue('retention_cleanup', { connection }),
};

// ============================================
// Job Handlers
// ============================================

/**
 * Notify Support Handler
 * Sends ticket notification to Telegram support chat
 */
async function handleNotifySupport(data: { ticketId: string; kind: 'NEW_TICKET' | 'NEW_MESSAGE' }) {
  console.log(`[notify] Processing ${data.kind} for ticket ${data.ticketId}`);

  const ticket = await prisma.ticket.findUnique({
    where: { id: data.ticketId },
    include: {
      user: true,
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  if (!ticket) {
    console.log(`[notify] Ticket ${data.ticketId} not found`);
    return;
  }

  const lastMessage = ticket.messages[0];
  const userLabel = ticket.user?.email ?? ticket.user?.phone ?? ticket.userId ?? 'anonymous';
  const emoji = data.kind === 'NEW_TICKET' ? '🆕' : '💬';

  const text = `${emoji} ${data.kind === 'NEW_TICKET' ? 'New Ticket' : 'New Message'}
Subject: ${ticket.subject}
User: ${userLabel}

${lastMessage?.body ?? ''}

TicketID: ${ticket.id}`;

  // Send to Telegram
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_SUPPORT_CHAT_ID;

  if (!token || !chatId) {
    console.log('[notify] Telegram not configured, skipping');
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Telegram send failed: ${res.status} ${body}`);
  }

  console.log(`[notify] Sent to Telegram for ticket ${data.ticketId}`);
}

/**
 * Notify User Handler
 * Sends notification to user (email/telegram)
 */
async function handleNotifyUser(data: { userId: string; kind: string; message: string }) {
  console.log(`[notify] Processing ${data.kind} for user ${data.userId}`);
  
  // TODO: Implement email/telegram notification to user
  // For MVP, we just log it
  console.log(`[notify] User notification: ${data.message}`);
}

/**
 * Payment Watch Handler
 * Checks pending invoices for payment detection
 */
async function handlePaymentWatch(data: { invoiceId?: string }) {
  console.log('[payment_watch] Checking pending payments...');

  // Find pending invoices
  const pendingInvoices = await prisma.invoice.findMany({
    where: {
      status: 'PENDING',
      rateLockedUntil: { gte: new Date() },
    },
    include: { payments: true },
  });

  console.log(`[payment_watch] Found ${pendingInvoices.length} pending invoices`);

  for (const invoice of pendingInvoices) {
    // TODO: Implement actual payment detection logic
    // This would check blockchain APIs for incoming transactions
    // For now, we just log
    console.log(`[payment_watch] Checking invoice ${invoice.id}`);
  }
}

/**
 * Provision Handler
 * Creates or extends subscription after payment settlement
 */
async function handleProvision(data: { invoiceId: string }) {
  console.log(`[provision] Processing provision for invoice ${data.invoiceId}`);

  const invoice = await prisma.invoice.findUnique({
    where: { id: data.invoiceId },
    include: { plan: true, user: true, payments: true },
  });

  if (!invoice) {
    console.log(`[provision] Invoice ${data.invoiceId} not found`);
    return;
  }

  // Check if there's a settled payment
  const settledPayment = invoice.payments.find(p => p.status === 'SETTLED');
  if (!settledPayment) {
    console.log(`[provision] No settled payment for invoice ${data.invoiceId}`);
    return;
  }

  // Check if already provisioned
  if (invoice.status === 'PAID') {
    console.log(`[provision] Invoice ${data.invoiceId} already marked as paid`);
    return;
  }

  // Find or create subscription
  let subscription = await prisma.subscription.findFirst({
    where: {
      userId: invoice.userId,
      planId: invoice.planId,
      status: 'ACTIVE',
    },
  });

  const now = new Date();
  const newExpiresAt = new Date(now);
  newExpiresAt.setDate(newExpiresAt.getDate() + invoice.plan.durationDays);

  if (subscription) {
    // Extend existing subscription
    const currentExpires = new Date(subscription.expiresAt);
    if (currentExpires > now) {
      // Extend from current expiry
      currentExpires.setDate(currentExpires.getDate() + invoice.plan.durationDays);
      subscription = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          expiresAt: currentExpires,
          updatedAt: now,
        },
      });
      console.log(`[provision] Extended subscription ${subscription.id}`);
    } else {
      // Reactivate expired subscription
      subscription = await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          status: 'ACTIVE',
          expiresAt: newExpiresAt,
          startedAt: now,
          updatedAt: now,
        },
      });
      console.log(`[provision] Reactivated subscription ${subscription.id}`);
    }
  } else {
    // Create new subscription
    subscription = await prisma.subscription.create({
      data: {
        userId: invoice.userId,
        planId: invoice.planId,
        status: 'ACTIVE',
        expiresAt: newExpiresAt,
      },
    });
    console.log(`[provision] Created subscription ${subscription.id}`);
  }

  // Update invoice status
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { status: 'PAID', updatedAt: now },
  });

  // Notify user
  await queues.notify.add('notify_user', {
    userId: invoice.userId,
    kind: 'SUBSCRIPTION_ACTIVATED',
    message: `Your ${invoice.plan.name} subscription has been activated!`,
  });

  console.log(`[provision] Provision complete for invoice ${data.invoiceId}`);
}

/**
 * Retention Cleanup Handler
 * Purges expired sessions and old idempotency keys
 */
async function handleRetentionCleanup() {
  console.log('[retention_cleanup] Starting cleanup...');

  const now = new Date();

  // Clean expired sessions
  const expiredSessions = await prisma.session.deleteMany({
    where: { expiresAt: { lt: now } },
  });
  console.log(`[retention_cleanup] Deleted ${expiredSessions.count} expired sessions`);

  // Clean old idempotency keys (90 days)
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const oldKeys = await prisma.idempotencyKey.deleteMany({
    where: { createdAt: { lt: ninetyDaysAgo } },
  });
  console.log(`[retention_cleanup] Deleted ${oldKeys.count} old idempotency keys`);

  // Update expired subscriptions
  const expiredSubs = await prisma.subscription.updateMany({
    where: {
      status: 'ACTIVE',
      expiresAt: { lt: now },
    },
    data: { status: 'EXPIRED' },
  });
  console.log(`[retention_cleanup] Marked ${expiredSubs.count} subscriptions as expired`);

  // Update expired invoices
  const expiredInvoices = await prisma.invoice.updateMany({
    where: {
      status: 'PENDING',
      rateLockedUntil: { lt: now },
    },
    data: { status: 'EXPIRED' },
  });
  console.log(`[retention_cleanup] Marked ${expiredInvoices.count} invoices as expired`);
}

// ============================================
// Worker Initialization
// ============================================

console.log('Starting B2C Worker Service...');

// Notify worker
new Worker('notify', async (job) => {
  if (job.name === 'notify_support') {
    return handleNotifySupport(job.data as Parameters<typeof handleNotifySupport>[0]);
  }
  if (job.name === 'notify_user') {
    return handleNotifyUser(job.data as Parameters<typeof handleNotifyUser>[0]);
  }
}, { connection });

// Payment watch worker
new Worker('payment_watch', async (job) => {
  if (job.name === 'payment_watch_tick') {
    return handlePaymentWatch(job.data as Parameters<typeof handlePaymentWatch>[0]);
  }
}, { connection });

// Provision worker
new Worker('provision', async (job) => {
  if (job.name === 'provision_subscription') {
    return handleProvision(job.data as Parameters<typeof handleProvision>[0]);
  }
}, { connection });

// Retention cleanup worker
new Worker('retention_cleanup', async (job) => {
  if (job.name === 'retention_cleanup_tick') {
    return handleRetentionCleanup();
  }
}, { connection });

console.log('All workers started');
console.log(`Worker service running on port ${WORKER_PORT}`);

// Schedule periodic jobs
async function schedulePeriodicJobs() {
  // Payment watch every 30 seconds
  await queues.paymentWatch.add('payment_watch_tick', {}, {
    repeat: { every: 30000 },
  });

  // Retention cleanup every hour
  await queues.retentionCleanup.add('retention_cleanup_tick', {}, {
    repeat: { every: 3600000 },
  });

  console.log('Scheduled periodic jobs');
}

schedulePeriodicJobs().catch(console.error);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down worker...');
  await prisma.$disconnect();
  process.exit(0);
});
