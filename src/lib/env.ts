const FALLBACK_APP_URL = 'http://localhost:3000';
const DEFAULT_PLATFORM_TREASURY = 'D1CRgh1Ty3yjDwN9CkwtsRWKmsmKQ2BbRbtKvCTfAN8Z';

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || FALLBACK_APP_URL;
}

export function getFirebaseProjectId(): string | undefined {
  return process.env.FIREBASE_PROJECT_ID;
}

export function getSolanaRpcUrl(): string {
  return process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
}

export function getPlatformTreasury(): string {
  return process.env.PLATFORM_TREASURY || DEFAULT_PLATFORM_TREASURY;
}

export function getPaymentEncryptionKey(): string {
  const key = process.env.PAYMENT_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('PAYMENT_ENCRYPTION_KEY is required');
  }
  return key;
}

export function getCronSecret(): string | undefined {
  return process.env.CRON_SECRET;
}

export function getSchedulerSweepLimit(): number {
  const raw = process.env.SCHEDULER_SWEEP_LIMIT;
  const parsed = raw ? Number(raw) : 50;
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 50;
}
