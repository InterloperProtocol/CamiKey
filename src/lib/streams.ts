import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { createId } from '@/lib/ids';
import { generateSecretToken, sha256Hex } from '@/lib/crypto';
import { resolveDexscreenerUrl } from '@/lib/dexscreener';
import { getDb } from '@/lib/firestore';
import { fetchPumpCoinMetadata } from '@/lib/pumpfun';
import { getAppUrl } from '@/lib/env';
import { StreamRecord } from '@/lib/types';

const slugSchema = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^[a-z0-9-]+$/);

const registrationSchema = z.object({
  deployerWallet: z.string().trim().min(32),
  streamerCoinMint: z.string().trim().min(32),
  desiredSlug: slugSchema,
});

export interface RegisterStreamInput {
  deployerWallet: string;
  streamerCoinMint: string;
  desiredSlug: string;
}

export interface RegisterStreamResult {
  streamId: string;
  slug: string;
  overlayKey: string;
  streamerPageUrl: string;
  overlayUrl: string;
}

export function normalizeSlug(input: string): string {
  return slugSchema.parse(input.toLowerCase());
}

export async function registerStream(input: RegisterStreamInput): Promise<RegisterStreamResult> {
  const parsed = registrationSchema.parse({
    deployerWallet: input.deployerWallet,
    streamerCoinMint: input.streamerCoinMint,
    desiredSlug: normalizeSlug(input.desiredSlug),
  });

  const [pumpCoin, defaultDexscreenerUrl] = await Promise.all([
    fetchPumpCoinMetadata(parsed.streamerCoinMint),
    resolveDexscreenerUrl(parsed.streamerCoinMint),
  ]);

  if (!pumpCoin) {
    throw new Error('We could not load Pump.fun metadata for that coin mint.');
  }

  if (pumpCoin.mint !== parsed.streamerCoinMint) {
    throw new Error('Pump.fun metadata did not match the submitted mint.');
  }

  if (pumpCoin.creator !== parsed.deployerWallet) {
    throw new Error('The deployer wallet does not match the Pump.fun creator for that coin.');
  }

  if (!defaultDexscreenerUrl) {
    throw new Error('Dexscreener could not resolve that coin mint.');
  }

  const db = getDb();
  const now = Timestamp.now();
  const streamId = createId('stream');
  const overlayKey = generateSecretToken();
  const overlayKeyHash = sha256Hex(overlayKey);
  const slug = parsed.desiredSlug;

  const streamRef = db.collection('streams').doc(streamId);
  const slugRef = db.collection('slugs').doc(slug);

  await db.runTransaction(async (transaction) => {
    const existingSlug = await transaction.get(slugRef);
    if (existingSlug.exists) {
      throw new Error('That slug is already taken.');
    }

    const streamDoc: StreamRecord = {
      streamId,
      slug,
      deployerWallet: parsed.deployerWallet,
      streamerCoinMint: parsed.streamerCoinMint,
      streamerCoinName: pumpCoin.name,
      streamerCoinSymbol: pumpCoin.symbol,
      defaultDexscreenerUrl,
      createdAt: now.toDate(),
      updatedAt: now.toDate(),
      overlay: {
        overlayKeyHash,
        stateNonce: 1,
        lastHeartbeatAt: null,
        lastOverlaySessionId: null,
        verifiedAt: null,
        lastVerifiedOverlaySessionId: null,
        verifyNonce: null,
        verifyNonceRequestedAt: null,
        verifyNonceExpiresAt: null,
      },
      liveStatus: {
        isLive: false,
        viewers: 0,
        lastSeenAt: null,
        lastIndexedAt: null,
      },
      kernel: {
        defaultMint: parsed.streamerCoinMint,
        currentMint: parsed.streamerCoinMint,
        currentDexscreenerUrl: defaultDexscreenerUrl,
        currentLeaseId: null,
        currentLeaseTier: null,
        currentLeaseStartedAt: null,
        currentLeaseEndsAt: null,
        preemptCooldownUntil: null,
      },
    };

    transaction.set(streamRef, {
      ...streamDoc,
      createdAt: now,
      updatedAt: now,
      'overlay.lastHeartbeatAt': null,
      'overlay.verifiedAt': null,
      'overlay.verifyNonceRequestedAt': null,
      'overlay.verifyNonceExpiresAt': null,
      'liveStatus.lastSeenAt': null,
      'liveStatus.lastIndexedAt': null,
      'kernel.currentLeaseStartedAt': null,
      'kernel.currentLeaseEndsAt': null,
      'kernel.preemptCooldownUntil': null,
    });
    transaction.set(slugRef, {
      slug,
      streamId,
      createdAt: now,
    });
    transaction.set(streamRef.collection('events').doc(createId('evt')), {
      type: 'stream_registered',
      createdAt: now,
      message: `Registered ${pumpCoin.symbol} for ${slug}`,
    });
  });

  const appUrl = getAppUrl();

  return {
    streamId,
    slug,
    overlayKey,
    streamerPageUrl: `${appUrl}/${slug}`,
    overlayUrl: `${appUrl}/o/${streamId}?k=${overlayKey}`,
  };
}

export async function getStreamBySlug(slug: string) {
  const db = getDb();
  const slugDoc = await db.collection('slugs').doc(normalizeSlug(slug)).get();
  if (!slugDoc.exists) {
    return null;
  }

  const streamId = slugDoc.data()?.streamId as string | undefined;
  if (!streamId) {
    return null;
  }

  const streamDoc = await db.collection('streams').doc(streamId).get();
  if (!streamDoc.exists) {
    return null;
  }

  return {
    streamId,
    ...(streamDoc.data() as Omit<StreamRecord, 'streamId'>),
  } as StreamRecord;
}

export async function touchStreamUpdatedAt(streamId: string) {
  await getDb().collection('streams').doc(streamId).set(
    {
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}
