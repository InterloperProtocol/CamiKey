interface DexScreenerResponse {
  pairs?: Array<{
    chainId?: string;
  }>;
}

export async function resolveDexscreenerUrl(mint: string): Promise<string | null> {
  const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`DEXSCREENER_${response.status}`);
  }

  const json = (await response.json()) as DexScreenerResponse;
  const pair = json.pairs?.find((entry) => entry.chainId === 'solana') || json.pairs?.[0];
  if (!pair) {
    return null;
  }

  return `https://dexscreener.com/solana/${mint}?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartTimeframesToolbar=0&chartTheme=dark&theme=dark&chartStyle=1&interval=5`;
}
