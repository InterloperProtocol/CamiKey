import Link from 'next/link';
import { TopNav } from '@/components/top-nav';

export default function HomePage() {
  return (
    <main className="shell">
      <TopNav />

      <section className="hero">
        <div className="card panel">
          <div className="eyebrow">Scope Locked</div>
          <h1 className="title">Chart sponsorships for Pump.fun livestreams.</h1>
          <p className="subtitle">
            CAMIKey only swaps Dexscreener charts inside an OBS Browser Source overlay. No plugins,
            no banners, no videos, and no non-Pump streams.
          </p>
          <div className="pill-row">
            <span className="pill">BASE: 0.04 SOL / 120s</span>
            <span className="pill">PRIORITY: 0.10 SOL / 600s</span>
            <span className="pill">Overlay verify every 12h</span>
            <span className="pill">Live-only purchase gating</span>
          </div>
          <div className="button-row" style={{ marginTop: 28 }}>
            <Link className="button" href="/start">
              Register a stream
            </Link>
            <Link className="button secondary" href="/ads">
              Browse live streams
            </Link>
          </div>
        </div>

        <div className="card panel stack">
          <div>
            <div className="eyebrow">What We Enforce</div>
            <h2 style={{ fontSize: '1.7rem', margin: '10px 0 12px' }}>Only live, verified overlays can sell placements.</h2>
          </div>
          <dl className="detail-list">
            <div className="detail">
              <dt>Default chart</dt>
              <dd>Streamer coin mint on Dexscreener.</dd>
            </div>
            <div className="detail">
              <dt>Sponsored swap</dt>
              <dd>Buyer supplies only the token mint. CAMIKey resolves the Dexscreener chart URL.</dd>
            </div>
            <div className="detail">
              <dt>Payments</dt>
              <dd>Unique deposit address per intent, then automatic 90/10 forwarding after confirmation.</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
