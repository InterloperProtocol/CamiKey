const FALLBACK_APP_URL = 'http://localhost:3000';
const DEFAULT_SOLANA_RPC_URL = 'https://api.mainnet-beta.solana.com';
const DEFAULT_PLATFORM_TREASURY = 'D1CRgh1Ty3yjDwN9CkwtsRWKmsmKQ2BbRbtKvCTfAN8Z';

function parseFirebaseConfigProjectId(): string | undefined {
  const raw = process.env.FIREBASE_CONFIG;
  if (!raw) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(raw) as { projectId?: string; project_id?: string };
    return parsed.projectId || parsed.project_id;
  } catch {
    return undefined;
  }
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || FALLBACK_APP_URL;
}

export function getRequestOrigin(request: Request): string {
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const forwardedHost = request.headers.get('x-forwarded-host');

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const host = request.headers.get('host');
  if (host) {
    const protocol = host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https';
    return `${protocol}://${host}`;
  }

  try {
    return new URL(request.url).origin;
  } catch {
    return getAppUrl();
  }
}

export function getFirebaseProjectId(): string | undefined {
  return (
    process.env.FIREBASE_PROJECT_ID ||
    parseFirebaseConfigProjectId() ||
    process.env.GCLOUD_PROJECT ||
    process.env.GOOGLE_CLOUD_PROJECT
  );
}

export function getSolanaRpcUrl(): string {
  return process.env.SOLANA_RPC_URL?.trim() || DEFAULT_SOLANA_RPC_URL;
}

export function getPlatformTreasury(): string {
  return process.env.PLATFORM_TREASURY?.trim() || DEFAULT_PLATFORM_TREASURY;
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
