import Link from 'next/link';
import { TopNav } from '@/components/top-nav';

const REVENUE_WALLET = 'D1CRgh1Ty3yjDwN9CkwtsRWKmsmKQ2BbRbtKvCTfAN8Z';

export default function HomePage() {
  return (
    <main className="shell">
      <TopNav />

      <section className="hero hero-home">
        <div className="card panel stack hero-copy">
          <div className="eyebrow">Social Futures</div>
          <h1 className="title">Creator Attention Marketplace Interface</h1>
          <p className="subtitle">Underwriting Social Capital</p>
          <p className="subtitle">Capital Allocation Management Interface</p>

          <div className="hero-actions">
            <Link className="button" href="/marketplace">
              Open Marketplace
            </Link>
            <Link className="button secondary" href="/start">
              Streamer Registration
            </Link>
            <Link className="button secondary" href="/advertisers">
              Advertisers
            </Link>
          </div>

          <dl className="detail-list">
            <div className="detail wallet-card">
              <dt>Revenue wallet</dt>
              <dd className="mono">{REVENUE_WALLET}</dd>
            </div>
          </dl>
        </div>

        <div className="hero-visual">
          <img alt="Social Futures animation" className="hero-gif" src="/social-futures.gif" />
        </div>
      </section>
    </main>
  );
}
