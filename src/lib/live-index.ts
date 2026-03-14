import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getCronSecret } from '@/lib/env';
import { getDb } from '@/lib/firestore';
import { fetchPumpLiveEntries } from '@/lib/pumpfun';
import { getAllStreams, hydrateStreamRecord } from '@/lib/streams';
import { LiveIndexRecord, PumpLiveEntry, StreamRecord } from '@/lib/types';

export const LIVE_INDEX_INTERVAL_MS = 45_000;

function toDateOrEpoch(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    const candidate = value as { toDate: () => Date };
    return candidate.toDate();
  }

  return new Date(0);
}

function hydrateLiveIndex(raw: Record<string, unknown> | undefined): LiveIndexRecord | null {
  if (!raw) {
    return null;
  }

  const streams = Array.isArray(raw.streams)
    ? raw.streams.map((entry) => {
        const item = entry as Record<string, unknown>;
        return {
          mint: String(item.mint || ''),
          creatorAddress: String(item.creatorAddress || ''),
          viewerCount: Number(item.viewerCount || 0),
          linkUrl: String(item.linkUrl || ''),
          symbol: String(item.symbol || ''),
          title: String(item.title || ''),
          isLive: Boolean(item.isLive),
        } satisfies PumpLiveEntry;
      })
    : [];

  return {
    indexedAt: toDateOrEpoch(raw.indexedAt),
    refreshIntervalMs: Number(raw.refreshIntervalMs || LIVE_INDEX_INTERVAL_MS),
    streams,
  };
}

export async function getCurrentLiveIndex() {
  const snapshot = await getDb().collection('live_index').doc('current').get();
  if (!snapshot.exists) {
    return null;
  }

  return hydrateLiveIndex(snapshot.data() as Record<string, unknown>);
}

async function updateStreamLiveStatuses(streams: StreamRecord[], liveEntries: PumpLiveEntry[], indexedAt: Date) {
  const liveByMint = new Map(liveEntries.map((entry) => [entry.mint, entry]));
  const db = getDb();
  let batch = db.batch();
  let operations = 0;

  for (const stream of streams) {
    const liveEntry = liveByMint.get(stream.streamerCoinMint);
    const ref = db.collection('streams').doc(stream.streamId);

    batch.set(
      ref,
      liveEntry
        ? {
            liveStatus: {
              isLive: true,
              viewers: liveEntry.viewerCount,
              lastSeenAt: indexedAt,
              lastIndexedAt: indexedAt,
            },
          }
        : {
            liveStatus: {
              isLive: false,
              viewers: 0,
              lastSeenAt: stream.liveStatus.lastSeenAt,
              lastIndexedAt: indexedAt,
            },
          },
      { merge: true },
    );

    operations += 1;
    if (operations === 400) {
      await batch.commit();
      batch = db.batch();
      operations = 0;
    }
  }

  if (operations > 0) {
    await batch.commit();
  }
}

export async function maybeRefreshLiveIndex(force = false): Promise<LiveIndexRecord> {
  const db = getDb();
  const docRef = db.collection('live_index').doc('current');
  const current = await getCurrentLiveIndex();
  const now = Date.now();

  if (!force && current && now - current.indexedAt.getTime() < LIVE_INDEX_INTERVAL_MS) {
    return current;
  }

  const streams = await fetchPumpLiveEntries();
  const indexedAt = new Date();
  const allStreams = await getAllStreams();

  await docRef.set(
    {
      indexedAt,
      refreshIntervalMs: LIVE_INDEX_INTERVAL_MS,
      streams,
      refreshedAt: Timestamp.now(),
      registeredMatches: allStreams.filter((stream) => streams.some((entry) => entry.mint === stream.streamerCoinMint))
        .length,
    },
    { merge: true },
  );

  await updateStreamLiveStatuses(allStreams, streams, indexedAt);

  return {
    indexedAt,
    refreshIntervalMs: LIVE_INDEX_INTERVAL_MS,
    streams,
  };
}

export async function refreshLiveIndexFromCron(secret: string | null) {
  const expected = getCronSecret();
  if (expected && secret !== expected) {
    throw new Error('CRON_AUTH_FAILED');
  }

  return maybeRefreshLiveIndex(true);
}
