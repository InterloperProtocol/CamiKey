import { TopNav } from '@/components/top-nav';

export default function AdsPlaceholderPage() {
  return (
    <main className="shell">
      <TopNav />
      <div className="card panel stack">
        <div className="eyebrow">Phase 3</div>
        <h1 style={{ fontSize: '2rem', margin: '10px 0 12px' }}>Live advertiser dashboard lands next.</h1>
        <p className="subtitle">
          This route will soon show only live Pump.fun streams, sorted by viewer count, with purchase
          actions gated by live status, overlay heartbeat freshness, and verification freshness.
        </p>
      </div>
    </main>
  );
}
