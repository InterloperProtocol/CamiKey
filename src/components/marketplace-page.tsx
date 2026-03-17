import Link from 'next/link';
import { TopNav } from '@/components/top-nav';
import { getPurchaseGateStatus } from '@/lib/gating';
import { maybeRefreshLiveIndex } from '@/lib/live-index';
import { getAllStreams } from '@/lib/streams';

function gateLabel(value: boolean, truthy: string, falsy: string) {
  return value ? truthy : falsy;
}

export default async function MarketplacePage() {
  const liveIndex = await maybeRefreshLiveIndex();
  const streams = await getAllStreams();
  const rows = streams.map((stream) => ({
    stream,
    gate: getPurchaseGateStatus(stream),
  }));
  const visibleRows = rows.filter(({ gate }) => gate.liveFresh);
  const eligibleCount = rows.filter(({ gate }) => gate.canPurchase).length;

  return (
    <main className="shell">
      <TopNav />

      <section className="stack">
        <div className="card panel stack">
          <div className="eyebrow">Marketplace</div>
          <h1 style={{ fontSize: '2.3rem', margin: '10px 0 12px' }}>Creator Attention Marketplace</h1>
          <p className="subtitle">
            Live streams surface here only after Pump.fun indexing, overlay heartbeat checks, and
            active verification. Buyers can step directly into any eligible stream page from this
            board.
          </p>
          <div className="pill-row">
            <span className="pill">Indexed: {liveIndex.indexedAt.toLocaleString()}</span>
            <span className="pill">Live streams seen: {liveIndex.streams.length}</span>
            <span className="pill">Eligible streams: {eligibleCount}</span>
          </div>
        </div>

        {visibleRows.length === 0 ? (
          <div className="card panel stack">
            <div className="eyebrow">No Matches</div>
            <p className="subtitle">
              No registered streams are live right now. Once a stream is live with a fresh overlay and
              verification window, it will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="ads-grid">
            {visibleRows.map(({ stream, gate }) => (
              <article className="card panel stack" key={stream.streamId}>
                <div className="stream-card-header">
                  <div>
                    <div className="eyebrow">/{stream.slug}</div>
                    <h2 style={{ fontSize: '1.55rem', margin: '10px 0 8px' }}>
                      {stream.streamerCoinSymbol} / {stream.streamerCoinName}
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
                    {gate.canPurchase ? 'Open Stream Market' : 'View Stream Page'}
                  </Link>
                </div>

                {!gate.canPurchase ? (
                  <div className="status info">{gate.reasons[0] || 'Purchase is temporarily unavailable.'}</div>
                ) : (
                  <div className="status success">Purchases are enabled for this stream.</div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
