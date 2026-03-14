import { notFound } from 'next/navigation';
import { StreamPageClient } from '@/components/stream-page-client';
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
      <StreamPageClient
        defaultDexscreenerUrl={stream.defaultDexscreenerUrl}
        deployerWallet={stream.deployerWallet}
        lastHeartbeatAt={stream.overlay.lastHeartbeatAt?.toISOString() ?? null}
        slug={stream.slug}
        streamId={stream.streamId}
        streamerCoinMint={stream.streamerCoinMint}
        verifiedAt={stream.overlay.verifiedAt?.toISOString() ?? null}
      />
    </main>
  );
}
