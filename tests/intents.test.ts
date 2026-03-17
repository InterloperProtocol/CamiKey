import { describe, expect, it } from 'vitest';
import { isPayoutProcessingStale, PAYOUT_PROCESSING_TIMEOUT_MS } from '../src/lib/intents';

describe('payout processing recovery', () => {
  it('keeps fresh processing claims owned by the current worker', () => {
    const processingAt = new Date('2026-03-13T12:00:00.000Z');
    const now = processingAt.getTime() + PAYOUT_PROCESSING_TIMEOUT_MS - 1;

    expect(isPayoutProcessingStale(processingAt, now)).toBe(false);
  });

  it('releases stale processing claims for retry', () => {
    const processingAt = new Date('2026-03-13T12:00:00.000Z');
    const now = processingAt.getTime() + PAYOUT_PROCESSING_TIMEOUT_MS;

    expect(isPayoutProcessingStale(processingAt, now)).toBe(true);
  });
});
