/**
 * Queue utilities for enqueuing jobs from the main Next.js app
 * These functions send jobs to the worker service via Redis/BullMQ
 */

import { Queue } from 'bullmq';

// Redis connection config
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

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

// Queue instances
export const queues = {
  notify: new Queue('notify', { connection }),
  paymentWatch: new Queue('payment_watch', { connection }),
  provision: new Queue('provision', { connection }),
  retentionCleanup: new Queue('retention_cleanup', { connection }),
};

// ============================================
// Enqueue Functions
// ============================================

/**
 * Enqueue a support notification
 */
export async function enqueueNotifySupport(data: {
  ticketId: string;
  kind: 'NEW_TICKET' | 'NEW_MESSAGE';
}) {
  await queues.notify.add('notify_support', data, {
    attempts: 5,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 2000,
    removeOnFail: 5000,
  });
}

/**
 * Enqueue a user notification
 */
export async function enqueueNotifyUser(data: {
  userId: string;
  kind: string;
  message: string;
}) {
  await queues.notify.add('notify_user', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: 2000,
    removeOnFail: 5000,
  });
}

/**
 * Enqueue payment watch job
 */
export async function enqueuePaymentWatch(data?: { invoiceId: string }) {
  await queues.paymentWatch.add('payment_watch_tick', data || {}, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 1000,
    removeOnFail: 3000,
  });
}

/**
 * Enqueue provision job (idempotent)
 */
export async function enqueueProvision(data: { invoiceId: string }) {
  await queues.provision.add('provision_subscription', data, {
    jobId: `provision_${data.invoiceId}`,
    attempts: 5,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: 5000,
    removeOnFail: 10000,
  });
}

/**
 * Enqueue retention cleanup job
 */
export async function enqueueRetentionCleanup() {
  await queues.retentionCleanup.add('retention_cleanup_tick', {}, {
    attempts: 1,
    removeOnComplete: 100,
    removeOnFail: 500,
  });
}
