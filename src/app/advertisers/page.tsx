import Link from 'next/link';
import { TopNav } from '@/components/top-nav';

export default function AdvertisersPage() {
  return (
    <main className="shell">
      <TopNav />

      <section className="hero hero-home">
        <div className="card panel stack hero-copy">
          <div className="eyebrow">Advertisers</div>
          <h1 className="title">Buy attention where verified creators are already live.</h1>
          <p className="subtitle">
            CAMIUP filters the market to live streams with a fresh heartbeat and an active overlay
            verification window before purchases open.
          </p>

          <div className="hero-actions">
            <Link className="button" href="/marketplace">
              Open Marketplace
            </Link>
            <Link className="button secondary" href="/ads">
              Legacy Ads Route
            </Link>
          </div>
        </div>

        <div className="card panel stack">
          <div className="eyebrow">How It Works</div>
          <dl className="detail-list">
            <div className="detail">
              <dt>Discovery</dt>
              <dd>Browse only live eligible streams.</dd>
            </div>
            <div className="detail">
              <dt>Intent</dt>
              <dd>Create a purchase intent with only the buyer token mint.</dd>
            </div>
            <div className="detail">
              <dt>Settlement</dt>
              <dd>Send the exact SOL amount to the generated deposit wallet.</dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
