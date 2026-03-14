import Link from 'next/link';
import { TopNav } from '@/components/top-nav';
import { getPurchaseGateStatus } from '@/lib/gating';
import { getCurrentLiveIndex, maybeRefreshLiveIndex } from '@/lib/live-index';
import { getLiveStreams } from '@/lib/streams';

function gateLabel(value: boolean, truthy: string, falsy: string) {
  return value ? truthy : falsy;
}

export default async function AdsPage() {
  const liveIndex = (await maybeRefreshLiveIndex().catch(async () => getCurrentLiveIndex())) || {
    indexedAt: new Date(0),
    refreshIntervalMs: 45_000,
    streams: [],
  };
  const streams = await getLiveStreams();
  const rows = streams.map((stream) => ({
    stream,
    gate: getPurchaseGateStatus(stream),
  }));

  return (
    <main className="shell">
      <TopNav />

      <section className="stack">
        <div className="card panel stack">
          <div className="eyebrow">Advertiser Dashboard</div>
          <h1 style={{ fontSize: '2.3rem', margin: '10px 0 12px' }}>Only live Pump.fun streams appear here.</h1>
          <p className="subtitle">
            Streams are indexed from Pump.fun live data about every 45 seconds, then filtered through
            CAMIKey&apos;s overlay verification and heartbeat gate before purchase is enabled.
          </p>
          <div className="pill-row">
            <span className="pill">Indexed: {liveIndex.indexedAt.toLocaleString()}</span>
            <span className="pill">Live streams seen: {liveIndex.streams.length}</span>
            <span className="pill">Registered live streams: {rows.length}</span>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="card panel stack">
            <div className="eyebrow">No Matches</div>
            <p className="subtitle">
              No registered CAMIKey streams are currently live on Pump.fun. Once a registered stream
              goes live and the OBS overlay is fresh + verified, it will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="ads-grid">
            {rows.map(({ stream, gate }) => (
              <article className="card panel stack" key={stream.streamId}>
                <div className="stream-card-header">
                  <div>
                    <div className="eyebrow">/{stream.slug}</div>
                    <h2 style={{ fontSize: '1.55rem', margin: '10px 0 8px' }}>
                      {stream.streamerCoinSymbol} · {stream.streamerCoinName}
                    </h2>
                  </div>
                  <div className="viewer-count">{stream.liveStatus.viewers.toLocaleString()} viewers</div>
                </div>

                <dl className="detail-list">
                  <div className="detail">
                    <dt>Mint</dt>
                    <dd className="mono">{stream.streamerCoinMint}</dd>
                  </div>
                  <div className="detail">
                    <dt>Live gate</dt>
                    <dd>{gateLabel(gate.liveFresh, 'Live on Pump.fun', 'Not live')}</dd>
                  </div>
                  <div className="detail">
                    <dt>Heartbeat gate</dt>
                    <dd>{gateLabel(gate.heartbeatFresh, 'Overlay heartbeat fresh', 'Overlay heartbeat stale')}</dd>
                  </div>
                  <div className="detail">
                    <dt>Verification gate</dt>
                    <dd>{gateLabel(gate.verificationFresh, 'Overlay verified', 'Verification expired')}</dd>
                  </div>
                </dl>

                <div className="button-row">
                  <Link className="button" href={`/${stream.slug}`}>
                    {gate.canPurchase ? 'Buy Chart Slot' : 'View Stream Page'}
                  </Link>
                </div>

                {!gate.canPurchase ? (
                  <div className="status info">{gate.reasons[0] || 'Purchase is temporarily unavailable.'}</div>
                ) : (
                  <div className="status success">Purchases are enabled for this live stream right now.</div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
