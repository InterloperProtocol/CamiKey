import { LiveBoardClient, type LiveBoardRow } from '@/components/live-board-client';
import { TopNav } from '@/components/top-nav';
import { getPurchaseGateStatus } from '@/lib/gating';
import { maybeRefreshLiveIndex } from '@/lib/live-index';
import { getLiveStreams } from '@/lib/streams';

export default async function LiveBoardPage() {
  const liveIndex = await maybeRefreshLiveIndex();
  const streams = await getLiveStreams();

  const rows: LiveBoardRow[] = streams
    .map((stream) => {
      const gate = getPurchaseGateStatus(stream);
      return {
        slug: stream.slug,
        streamId: stream.streamId,
        streamerCoinMint: stream.streamerCoinMint,
        streamerCoinName: stream.streamerCoinName,
        streamerCoinSymbol: stream.streamerCoinSymbol,
        viewers: stream.liveStatus.viewers,
        heartbeatFresh: gate.heartbeatFresh,
        verificationFresh: gate.verificationFresh,
        canPurchase: gate.canPurchase,
        reasons: gate.reasons,
      };
    })
    .sort((left, right) => right.viewers - left.viewers);

  return (
    <main className="shell">
      <TopNav />
      <LiveBoardClient indexedAtLabel={liveIndex.indexedAt.toLocaleString()} liveCount={rows.length} rows={rows} />
    </main>
  );
}
