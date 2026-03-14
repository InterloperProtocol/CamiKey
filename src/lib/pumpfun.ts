import { PumpCoinMetadata } from '@/lib/types';

const PUMP_BASE_URL = 'https://pump.fun';

function extractEscapedJsonObject(html: string, marker: string, suffix: string): string | null {
  const start = html.indexOf(marker);
  if (start === -1) {
    return null;
  }

  const end = html.indexOf(suffix, start);
  if (end === -1) {
    return null;
  }

  return html.slice(start + marker.length, end);
}

function unescapePumpJson(payload: string): string {
  return payload
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\u0026/g, '&');
}

export async function fetchPumpCoinMetadata(mint: string): Promise<PumpCoinMetadata | null> {
  const response = await fetch(`${PUMP_BASE_URL}/coin/${mint}`, {
    cache: 'no-store',
    headers: {
      Accept: 'text/html',
    },
  });

  if (!response.ok) {
    return null;
  }

  const html = await response.text();
  const rawObject = extractEscapedJsonObject(html, '\\"coin\\":', ',\\"articleSlot\\"');
  if (!rawObject) {
    return null;
  }

  const jsonText = unescapePumpJson(rawObject);
  const parsed = JSON.parse(jsonText) as {
    mint?: string;
    name?: string;
    symbol?: string;
    creator?: string;
    is_currently_live?: boolean;
  };

  if (!parsed.mint || !parsed.creator) {
    return null;
  }

  return {
    mint: parsed.mint,
    name: parsed.name || parsed.symbol || parsed.mint,
    symbol: parsed.symbol || parsed.name || 'PUMP',
    creator: parsed.creator,
    isCurrentlyLive: parsed.is_currently_live,
  };
}
