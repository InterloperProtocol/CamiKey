import { notFound } from 'next/navigation';
import { TopNav } from '@/components/top-nav';
import { getStreamBySlug } from '@/lib/streams';

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const stream = await getStreamBySlug(slug);

  if (!stream) {
    notFound();
  }

  return (
    <main className="shell">
      <TopNav />
      <section className="hero">
        <div className="card panel stack">
          <div className="eyebrow">Registered Stream</div>
          <h1 style={{ fontSize: '2.4rem', margin: '10px 0 12px' }}>{stream.slug}</h1>
          <p className="subtitle">
            The purchase flow, overlay verification, recent event ticker, and live gating land in the
            next implementation phases. This page is already backed by the registered Firestore stream
            document created from <code className="mono">/start</code>.
          </p>
          <dl className="detail-list">
            <div className="detail">
              <dt>Deployer wallet</dt>
              <dd className="mono">{stream.deployerWallet}</dd>
            </div>
            <div className="detail">
              <dt>Streamer coin mint</dt>
              <dd className="mono">{stream.streamerCoinMint}</dd>
            </div>
            <div className="detail">
              <dt>Default chart</dt>
              <dd className="mono">{stream.defaultDexscreenerUrl}</dd>
            </div>
          </dl>
        </div>

        <div className="card panel stack">
          <div>
            <div className="eyebrow">Phase Progress</div>
            <h2 style={{ fontSize: '1.6rem', margin: '10px 0 12px' }}>Registry complete. Overlay and purchases are next.</h2>
          </div>
          <div className="status info">
            Phase 1 stores the stream registry and overlay key hash. Later phases will fill in the
            live indexer, verification handshake, payment intents, and lease queue.
          </div>
        </div>
      </section>
    </main>
  );
}
