import { getCronSecret, getSchedulerSweepLimit } from '@/lib/env';
import { getDb } from '@/lib/firestore';
import { hydrateIntentRecord, ensureIntentPayoutForwarded, pollIntentStatus } from '@/lib/intents';
import { processStreamKernel } from '@/lib/kernel';
import { maybeRefreshLiveIndex } from '@/lib/live-index';

export interface SchedulerRunResult {
  indexedAt: string;
  pendingIntentIds: string[];
  payoutIntentIds: string[];
  streamIds: string[];
  limit: number;
}

async function listPendingIntentIds(limit: number) {
  const snapshot = await getDb()
    .collection('intents')
    .where('status', '==', 'PENDING_PAYMENT')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => doc.id);
}

async function listConfirmedIntentIds(limit: number) {
  const snapshot = await getDb()
    .collection('intents')
    .where('status', '==', 'CONFIRMED')
    .limit(limit)
    .get();

  return snapshot.docs
    .map((doc) => hydrateIntentRecord(doc.id, doc.data() as Record<string, unknown>))
    .filter((intent) => intent.payoutStatus !== 'FORWARDED')
    .map((intent) => intent.intentId);
}

async function listDueStreamIds(now: Date, limit: number) {
  const snapshot = await getDb()
    .collection('streams')
    .where('kernel.nextEvaluationAt', '<=', now)
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => doc.id);
}

export async function runScheduledLifecycle(input?: {
  forceLiveIndex?: boolean;
  limit?: number;
  now?: Date;
}) {
  const now = input?.now || new Date();
  const limit = input?.limit || getSchedulerSweepLimit();
  const liveIndex = await maybeRefreshLiveIndex(Boolean(input?.forceLiveIndex));

  const pendingIntentIds = await listPendingIntentIds(limit);
  for (const intentId of pendingIntentIds) {
    await pollIntentStatus(intentId);
  }

  const payoutIntentIds = await listConfirmedIntentIds(limit);
  for (const intentId of payoutIntentIds) {
    await ensureIntentPayoutForwarded(intentId);
  }

  const streamIds = await listDueStreamIds(now, limit);
  for (const streamId of streamIds) {
    await processStreamKernel(streamId, now);
  }

  return {
    indexedAt: liveIndex.indexedAt.toISOString(),
    pendingIntentIds,
    payoutIntentIds,
    streamIds,
    limit,
  } satisfies SchedulerRunResult;
}

export async function runScheduledLifecycleFromCron(secret: string | null, input?: { forceLiveIndex?: boolean; limit?: number }) {
  const expected = getCronSecret();
  if (expected && secret !== expected) {
    throw new Error('CRON_AUTH_FAILED');
  }

  return runScheduledLifecycle({
    forceLiveIndex: input?.forceLiveIndex,
    limit: input?.limit,
  });
}
