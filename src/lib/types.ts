export type PricingTier = 'BASE' | 'PRIORITY';

export interface StreamRecord {
  streamId: string;
  slug: string;
  deployerWallet: string;
  streamerCoinMint: string;
  streamerCoinName: string;
  streamerCoinSymbol: string;
  defaultDexscreenerUrl: string;
  createdAt: Date;
  updatedAt: Date;
  overlay: {
    overlayKeyHash: string;
    stateNonce: number;
    lastHeartbeatAt: Date | null;
    lastOverlaySessionId: string | null;
    verifiedAt: Date | null;
    lastVerifiedOverlaySessionId: string | null;
    verifyNonce: string | null;
    verifyNonceRequestedAt: Date | null;
    verifyNonceExpiresAt: Date | null;
  };
  liveStatus: {
    isLive: boolean;
    viewers: number;
    lastSeenAt: Date | null;
    lastIndexedAt: Date | null;
  };
  kernel: {
    defaultMint: string;
    currentMint: string;
    currentDexscreenerUrl: string;
    currentLeaseId: string | null;
    currentLeaseTier: PricingTier | null;
    currentLeaseStartedAt: Date | null;
    currentLeaseEndsAt: Date | null;
    preemptCooldownUntil: Date | null;
  };
}

export interface PumpCoinMetadata {
  mint: string;
  name: string;
  symbol: string;
  creator: string;
  isCurrentlyLive?: boolean;
}
