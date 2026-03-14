export default async function OverlayPlaceholderPage({
  params,
}: {
  params: Promise<{ streamId: string }>;
}) {
  const { streamId } = await params;

  return (
    <main className="shell">
      <div className="card panel stack">
        <div className="eyebrow">Phase 2</div>
        <h1 style={{ fontSize: '2rem', margin: '10px 0 12px' }}>Overlay runtime is being wired up.</h1>
        <p className="subtitle">
          The verified OBS Browser Source overlay for <code className="mono">{streamId}</code> will
          be added in the next phase with state polling, heartbeat, and one-click verification.
        </p>
      </div>
    </main>
  );
}
