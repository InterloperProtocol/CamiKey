import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { getPaymentEncryptionKey } from '@/lib/env';

function getNormalizedKey(): Buffer {
  const rawKey = getPaymentEncryptionKey();
  const asBuffer = /^[A-Za-z0-9+/=]+$/.test(rawKey)
    ? Buffer.from(rawKey, 'base64')
    : Buffer.from(rawKey, 'utf8');

  if (asBuffer.length === 32) {
    return asBuffer;
  }

  return createHash('sha256').update(asBuffer).digest();
}

export function sha256Hex(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function generateSecretToken(byteLength = 24): string {
  return randomBytes(byteLength).toString('base64url');
}

export function encryptSecret(secret: string): string {
  const key = getNormalizedKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString('base64url'), authTag.toString('base64url'), encrypted.toString('base64url')].join('.');
}

export function decryptSecret(payload: string): string {
  const [ivPart, authTagPart, encryptedPart] = payload.split('.');
  if (!ivPart || !authTagPart || !encryptedPart) {
    throw new Error('Invalid encrypted payload');
  }

  const key = getNormalizedKey();
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivPart, 'base64url'));
  decipher.setAuthTag(Buffer.from(authTagPart, 'base64url'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedPart, 'base64url')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
