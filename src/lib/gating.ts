import { LIVE_STALE_MS, isHeartbeatFresh, isVerificationFresh } from '@/lib/overlay';
import { StreamRecord } from '@/lib/types';

export interface PurchaseGateStatus {
  canPurchase: boolean;
  liveFresh: boolean;
  heartbeatFresh: boolean;
  verificationFresh: boolean;
  reasons: string[];
}

export function isLiveFresh(stream: Pick<StreamRecord, 'liveStatus'>, now = Date.now()): boolean {
  return Boolean(
    stream.liveStatus.isLive &&
      stream.liveStatus.lastSeenAt &&
      now - stream.liveStatus.lastSeenAt.getTime() < LIVE_STALE_MS,
  );
}

export function getPurchaseGateStatus(
  stream: Pick<StreamRecord, 'liveStatus' | 'overlay'>,
  now = Date.now(),
): PurchaseGateStatus {
  const liveFresh = isLiveFresh(stream, now);
  const heartbeatFresh = isHeartbeatFresh(stream.overlay.lastHeartbeatAt, now);
  const verificationFresh = isVerificationFresh(stream.overlay.verifiedAt, now);
  const reasons: string[] = [];

  if (!liveFresh) {
    reasons.push('This stream is not live on Pump.fun right now.');
  }

  if (!heartbeatFresh) {
    reasons.push('The OBS overlay heartbeat is stale.');
  }

  if (!verificationFresh) {
    reasons.push('The overlay verification has expired.');
  }

  return {
    canPurchase: liveFresh && heartbeatFresh && verificationFresh,
    liveFresh,
    heartbeatFresh,
    verificationFresh,
    reasons,
  };
}

export function assertPurchaseAllowed(stream: Pick<StreamRecord, 'liveStatus' | 'overlay'>, now = Date.now()) {
  const gate = getPurchaseGateStatus(stream, now);

  if (!gate.canPurchase) {
    throw new Error(gate.reasons[0] || 'This stream is not available for purchase.');
  }

  return gate;
}
