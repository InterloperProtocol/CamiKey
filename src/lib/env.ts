const FALLBACK_APP_URL = 'http://localhost:3000';

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
  const treasury = process.env.PLATFORM_TREASURY;
  if (!treasury) {
    throw new Error('PLATFORM_TREASURY is required');
  }
  return treasury;
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
