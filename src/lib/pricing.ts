import { PricingTier } from '@/lib/types';

export interface PricingQuote {
  tier: PricingTier;
  amountSol: number;
  amountLamports: number;
  displaySeconds: number;
  priorityRank: number;
}

export interface PricingSnapshot {
  resolvedAt: string;
  base: PricingQuote;
  priority: PricingQuote;
}

function toLamports(amountSol: number): number {
  return Math.round(amountSol * 1_000_000_000);
}

export function getPricing(now = new Date()): PricingSnapshot {
  const resolvedAt = new Date(Math.floor(now.getTime() / 600_000) * 600_000).toISOString();

  return {
    resolvedAt,
    base: {
      tier: 'BASE',
      amountSol: 0.04,
      amountLamports: toLamports(0.04),
      displaySeconds: 120,
      priorityRank: 0,
    },
    priority: {
      tier: 'PRIORITY',
      amountSol: 0.1,
      amountLamports: toLamports(0.1),
      displaySeconds: 600,
      priorityRank: 1,
    },
  };
}

export function getPricingTier(tier: PricingTier, now = new Date()): PricingQuote {
  const pricing = getPricing(now);
  return tier === 'PRIORITY' ? pricing.priority : pricing.base;
}
