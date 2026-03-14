import { PumpCoinMetadata, PumpLiveEntry } from '@/lib/types';

const PUMP_BASE_URL = 'https://pump.fun';
const LIVE_ENTRY_PATTERN =
  /\{\"id\":\"[^\"]+\",\"mint\":\"(?<mint>[^\"]+)\".*?\"title\":\"(?<title>(?:\\.|[^\"])*)\".*?\"creator\":\{\"address\":\"(?<creator>[^\"]+)\"\}.*?\"isLive\":(?<isLive>true|false).*?\"viewerCount\":(?<viewers>\d+).*?\"linkUrl\":\"(?<linkUrl>\/coin\/[^\"]+)\".*?\"symbol\":\"(?<symbol>(?:\\.|[^\"])*)\"/gms;

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
    .replace(/\\u0026/g, '&')
    .replace(/\\u003c/g, '<')
    .replace(/\\u003e/g, '>');
}

function decodePumpText(payload: string): string {
  return unescapePumpJson(`"${payload}"`).slice(1, -1);
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

export async function fetchPumpLiveEntries(): Promise<PumpLiveEntry[]> {
  const response = await fetch(`${PUMP_BASE_URL}/live`, {
    cache: 'no-store',
    headers: {
      Accept: 'text/html',
    },
  });

  if (!response.ok) {
    throw new Error(`PUMP_LIVE_${response.status}`);
  }

  const html = await response.text();
  const streams = new Map<string, PumpLiveEntry>();

  for (const match of html.matchAll(LIVE_ENTRY_PATTERN)) {
    const mint = match.groups?.mint;
    const creatorAddress = match.groups?.creator;
    const linkUrl = match.groups?.linkUrl;

    if (!mint || !creatorAddress || !linkUrl) {
      continue;
    }

    const viewerCount = Number(match.groups?.viewers || 0);
    const isLive = match.groups?.isLive === 'true';
    if (!isLive) {
      continue;
    }

    streams.set(mint, {
      mint,
      creatorAddress,
      viewerCount,
      linkUrl,
      symbol: decodePumpText(match.groups?.symbol || mint),
      title: decodePumpText(match.groups?.title || mint),
      isLive,
    });
  }

  return Array.from(streams.values()).sort((left, right) => right.viewerCount - left.viewerCount);
}
