'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

export interface LiveBoardRow {
  slug: string;
  streamId: string;
  streamerCoinMint: string;
  streamerCoinName: string;
  streamerCoinSymbol: string;
  viewers: number;
  heartbeatFresh: boolean;
  verificationFresh: boolean;
  canPurchase: boolean;
  reasons: string[];
}

interface LiveBoardClientProps {
  indexedAtLabel: string;
  liveCount: number;
  rows: LiveBoardRow[];
}

function statusLabel(value: boolean, truthy: string, falsy: string) {
  return value ? truthy : falsy;
}

export function LiveBoardClient({ indexedAtLabel, liveCount, rows }: LiveBoardClientProps) {
  const [selectedSlug, setSelectedSlug] = useState(rows[0]?.slug ?? '');

  const selectedRow = useMemo(
    () => rows.find((row) => row.slug === selectedSlug) ?? rows[0] ?? null,
    [rows, selectedSlug],
  );

  return (
    <section className="stack">
      <div className="card panel stack">
        <div className="eyebrow">Pump.funAds</div>
        <h1 style={{ fontSize: '2.4rem', margin: '10px 0 12px' }}>Live token board for buyers.</h1>
        <p className="subtitle">
          Scan who is live, how strong the audience is, and whether the slot is safe to buy before you
          ever open the stream panel.
        </p>
        <div className="pill-row">
          <span className="pill">Indexed: {indexedAtLabel}</span>
          <span className="pill">Live tokens: {liveCount}</span>
          <span className="pill">Buyer-ready: {rows.filter((row) => row.canPurchase).length}</span>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card panel stack">
          <div className="eyebrow">No Live Streams</div>
          <p className="subtitle">
            Nothing is live and verified right now. When a streamer is live again, the board will light
            up here automatically.
          </p>
        </div>
      ) : (
        <div className="live-board-layout">
          <div className="card panel stack live-board-list">
            <div className="live-board-list-header">
              <div>
                <div className="eyebrow">Live streams</div>
                <h2 className="live-board-heading">Choose a stream</h2>
              </div>
            </div>

            <div className="live-board-items">
              {rows.map((row) => {
                const isSelected = selectedRow?.slug === row.slug;
                return (
                  <button
                    className={`live-board-item${isSelected ? ' active' : ''}`}
                    key={row.streamId}
                    onClick={() => setSelectedSlug(row.slug)}
                    type="button"
                  >
                    <div className="live-board-item-main">
                      <div className="live-board-symbol">{row.streamerCoinSymbol}</div>
                      <div>
                        <div className="live-board-name">{row.streamerCoinName}</div>
                        <div className="live-board-slug">/{row.slug}</div>
                      </div>
                    </div>
                    <div className="live-board-meta">
                      <span className="viewer-count">{row.viewers.toLocaleString()} viewers</span>
                      <span className={`mini-status${row.canPurchase ? ' ready' : ''}`}>
                        {row.canPurchase ? 'Buy ready' : 'Watch only'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedRow ? (
            <div className="card panel stack live-board-detail">
              <div className="eyebrow">Selected stream</div>
              <div className="stream-card-header">
                <div>
                  <h2 className="live-board-detail-title">
                    {selectedRow.streamerCoinSymbol} / {selectedRow.streamerCoinName}
                  </h2>
                  <p className="subtitle">/{selectedRow.slug}</p>
                </div>
                <div className="viewer-count">{selectedRow.viewers.toLocaleString()} viewers</div>
              </div>

              <dl className="detail-list">
                <div className="detail">
                  <dt>Token mint</dt>
                  <dd className="mono">{selectedRow.streamerCoinMint}</dd>
                </div>
                <div className="detail">
                  <dt>Heartbeat</dt>
                  <dd>{statusLabel(selectedRow.heartbeatFresh, 'Overlay answering', 'Overlay stale')}</dd>
                </div>
                <div className="detail">
                  <dt>Verification</dt>
                  <dd>{statusLabel(selectedRow.verificationFresh, 'Verified', 'Expired')}</dd>
                </div>
                <div className="detail">
                  <dt>Buy status</dt>
                  <dd>{statusLabel(selectedRow.canPurchase, 'Buy panel unlocked', 'Monitoring only')}</dd>
                </div>
              </dl>

              {selectedRow.canPurchase ? (
                <div className="status success">
                  This slot is buyer-ready. Open the stream page to choose a tier and create the purchase
                  intent.
                </div>
              ) : (
                <div className="status info">
                  {selectedRow.reasons[0] || 'This stream is live, but the buy flow is temporarily blocked.'}
                </div>
              )}

              <div className="button-row">
                <Link className="button" href={`/${selectedRow.slug}`}>
                  Open Buy Panel
                </Link>
                <Link className="button secondary" href="/marketplace">
                  Full marketplace
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
