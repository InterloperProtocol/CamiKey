import { FieldValue } from 'firebase-admin/firestore';
import { generateSecretToken, sha256Hex } from '@/lib/crypto';
import { getDb } from '@/lib/firestore';
import { StreamRecord } from '@/lib/types';

export const VERIFY_WINDOW_MS = 30_000;
export const VERIFIED_TTL_MS = 12 * 60 * 60 * 1000;
export const HEARTBEAT_INTERVAL_MS = 15_000;
export const HEARTBEAT_STALE_MS = 30_000;
export const LIVE_STALE_MS = 90_000;

export function isOverlayKeyValid(stream: StreamRecord, overlayKey: string): boolean {
  return sha256Hex(overlayKey) === stream.overlay.overlayKeyHash;
}

export function isVerificationFresh(verifiedAt: Date | null, now = Date.now()): boolean {
  return Boolean(verifiedAt && now - verifiedAt.getTime() < VERIFIED_TTL_MS);
}

export function isHeartbeatFresh(lastHeartbeatAt: Date | null, now = Date.now()): boolean {
  return Boolean(lastHeartbeatAt && now - lastHeartbeatAt.getTime() < HEARTBEAT_STALE_MS);
}

export function getVerificationStatus(stream: StreamRecord, now = Date.now()) {
  const verifiedAt = stream.overlay.verifiedAt?.getTime() ?? 0;
  const requestedAt = stream.overlay.verifyNonceRequestedAt?.getTime() ?? 0;
  const expiresAt = stream.overlay.verifyNonceExpiresAt?.getTime() ?? 0;

  if (requestedAt && verifiedAt >= requestedAt) {
    return 'success';
  }

  if (stream.overlay.verifyNonce && expiresAt > now) {
    return 'pending';
  }

  if (requestedAt && expiresAt > 0 && expiresAt <= now) {
    return 'failed';
  }

  if (isVerificationFresh(stream.overlay.verifiedAt, now)) {
    return 'verified';
  }

  return 'idle';
}

export async function clearExpiredVerifyNonceIfNeeded(stream: StreamRecord, now = new Date()) {
  if (!stream.overlay.verifyNonce || !stream.overlay.verifyNonceExpiresAt) {
    return stream;
  }

  if (stream.overlay.verifyNonceExpiresAt.getTime() > now.getTime()) {
    return stream;
  }

  await getDb()
    .collection('streams')
    .doc(stream.streamId)
    .update({
      'overlay.verifyNonce': null,
      'overlay.verifyNonceExpiresAt': null,
      'overlay.stateNonce': FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });

  return {
    ...stream,
    updatedAt: now,
    overlay: {
      ...stream.overlay,
      verifyNonce: null,
      verifyNonceExpiresAt: null,
      stateNonce: stream.overlay.stateNonce + 1,
    },
  };
}

export async function createVerifyChallenge(
  stream: Pick<StreamRecord, 'streamId' | 'overlay'>,
  now = new Date(),
) {
  if (
    stream.overlay.verifyNonce &&
    stream.overlay.verifyNonceExpiresAt &&
    stream.overlay.verifyNonceExpiresAt.getTime() > now.getTime()
  ) {
    return {
      verifyNonce: stream.overlay.verifyNonce,
      expiresAt: stream.overlay.verifyNonceExpiresAt,
      reused: true,
    };
  }

  const expiresAt = new Date(now.getTime() + VERIFY_WINDOW_MS);
  const verifyNonce = generateSecretToken(18);
  await getDb()
    .collection('streams')
    .doc(stream.streamId)
    .update({
      'overlay.verifyNonce': verifyNonce,
      'overlay.verifyNonceRequestedAt': now,
      'overlay.verifyNonceExpiresAt': expiresAt,
      'overlay.stateNonce': FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });

  return {
    verifyNonce,
    expiresAt,
    reused: false,
  };
}

export async function completeVerifyChallenge(streamId: string, overlaySessionId: string, now = new Date()) {
  await getDb()
    .collection('streams')
    .doc(streamId)
    .update({
      'overlay.lastHeartbeatAt': now,
      'overlay.lastOverlaySessionId': overlaySessionId,
      'overlay.verifiedAt': now,
      'overlay.lastVerifiedOverlaySessionId': overlaySessionId,
      'overlay.verifyNonce': null,
      'overlay.verifyNonceExpiresAt': null,
      'overlay.stateNonce': FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function recordOverlayHeartbeat(
  streamId: string,
  overlaySessionId: string,
  shouldRefreshVerifiedAt: boolean,
  now = new Date(),
) {
  await getDb()
    .collection('streams')
    .doc(streamId)
    .update({
      'overlay.lastHeartbeatAt': now,
      'overlay.lastOverlaySessionId': overlaySessionId,
      ...(shouldRefreshVerifiedAt ? { 'overlay.verifiedAt': now } : {}),
      updatedAt: FieldValue.serverTimestamp(),
    });
}
