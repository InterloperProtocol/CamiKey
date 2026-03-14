import { OverlayClient } from '@/components/overlay-client';
import { isOverlayKeyValid } from '@/lib/overlay';
import { getStreamById } from '@/lib/streams';

export default async function OverlayPage({
  params,
  searchParams,
}: {
  params: Promise<{ streamId: string }>;
  searchParams: Promise<{ k?: string }>;
}) {
  const { streamId } = await params;
  const { k } = await searchParams;
  const stream = await getStreamById(streamId);

  if (!stream || !k || !isOverlayKeyValid(stream, k)) {
    return (
      <main className="shell">
        <div className="card panel stack">
          <div className="eyebrow">Overlay Access</div>
          <h1 style={{ fontSize: '2rem', margin: '10px 0 12px' }}>Invalid overlay key.</h1>
          <p className="subtitle">
            This OBS Browser Source needs the exact overlay URL returned during registration.
          </p>
        </div>
      </main>
    );
  }

  return (
    <OverlayClient
      initialChartUrl={stream.kernel.currentDexscreenerUrl}
      initialStateNonce={stream.overlay.stateNonce}
      overlayKey={k}
      streamId={streamId}
    />
  );
}
