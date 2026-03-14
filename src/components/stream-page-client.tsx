'use client';

import { useState } from 'react';

interface StreamPageClientProps {
  streamId: string;
  slug: string;
  deployerWallet: string;
  streamerCoinMint: string;
  defaultDexscreenerUrl: string;
  verifiedAt: string | null;
  lastHeartbeatAt: string | null;
}

type VerifyUiState = 'idle' | 'pending' | 'success' | 'error';

function formatTimestamp(value: string | null): string {
  if (!value) {
    return 'Not yet detected';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function StreamPageClient({
  streamId,
  slug,
  deployerWallet,
  streamerCoinMint,
  defaultDexscreenerUrl,
  verifiedAt,
  lastHeartbeatAt,
}: StreamPageClientProps) {
  const [verifyState, setVerifyState] = useState<VerifyUiState>('idle');
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [currentVerifiedAt, setCurrentVerifiedAt] = useState<string | null>(verifiedAt);
  const [currentHeartbeatAt, setCurrentHeartbeatAt] = useState<string | null>(lastHeartbeatAt);

  async function handleVerify() {
    try {
      setVerifyState('pending');
      setVerifyMessage(null);

      const requestResponse = await fetch('/api/overlay/verify/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ streamId }),
      });

      if (!requestResponse.ok) {
        const json = (await requestResponse.json()) as { error?: string };
        setVerifyState('error');
        setVerifyMessage(json.error || 'Not detected. Open OBS, switch to the scene with the overlay, then try again.');
        return;
      }

      const deadline = Date.now() + 30_000;
      while (Date.now() < deadline) {
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const statusResponse = await fetch(
          `/api/overlay/verify/status?streamId=${encodeURIComponent(streamId)}`,
          {
            method: 'GET',
            cache: 'no-store',
          },
        );

        if (!statusResponse.ok) {
          continue;
        }

        const statusJson = (await statusResponse.json()) as {
          status: 'pending' | 'success' | 'failed' | 'verified' | 'idle';
          verifiedAt: string | null;
          lastHeartbeatAt: string | null;
        };

        if (statusJson.status === 'success' || statusJson.status === 'verified') {
          setVerifyState('success');
          setVerifyMessage('Verified. We detected your OBS overlay running.');
          setCurrentVerifiedAt(statusJson.verifiedAt);
          setCurrentHeartbeatAt(statusJson.lastHeartbeatAt);
          return;
        }

        if (statusJson.status === 'failed') {
          setVerifyState('error');
          setVerifyMessage('Not detected. Open OBS, switch to the scene with the overlay, then try again.');
          return;
        }
      }

      setVerifyState('error');
      setVerifyMessage('Not detected. Open OBS, switch to the scene with the overlay, then try again.');
    } catch {
      setVerifyState('error');
      setVerifyMessage('Not detected. Open OBS, switch to the scene with the overlay, then try again.');
    }
  }

  return (
    <section className="hero">
      <div className="card panel stack">
        <div className="eyebrow">Streamer Page</div>
        <h1 style={{ fontSize: '2.4rem', margin: '10px 0 12px' }}>{slug}</h1>
        <p className="subtitle">
          This page becomes both the streamer control page and the buyer landing page. In this phase,
          it already supports the required one-click overlay verification flow with no manual code entry.
        </p>
        <dl className="detail-list">
          <div className="detail">
            <dt>Deployer wallet</dt>
            <dd className="mono">{deployerWallet}</dd>
          </div>
          <div className="detail">
            <dt>Streamer coin mint</dt>
            <dd className="mono">{streamerCoinMint}</dd>
          </div>
          <div className="detail">
            <dt>Default chart</dt>
            <dd className="mono">{defaultDexscreenerUrl}</dd>
          </div>
        </dl>
      </div>

      <div className="card panel stack">
        <div>
          <div className="eyebrow">Overlay Verification</div>
          <h2 style={{ fontSize: '1.7rem', margin: '10px 0 12px' }}>Verify that OBS is actually running the overlay.</h2>
          <p className="subtitle">
            Click once here, then CAMIKey waits for the live overlay itself to answer from OBS.
          </p>
        </div>

        <div className="button-row">
          <button className="button" disabled={verifyState === 'pending'} onClick={handleVerify} type="button">
            {verifyState === 'pending' ? 'Waiting for overlay...' : 'Verify overlay'}
          </button>
        </div>

        {verifyMessage ? (
          <div className={`status ${verifyState === 'success' ? 'success' : 'error'}`}>{verifyMessage}</div>
        ) : null}

        <div className="status info">Verification expires in 12h (auto-renews while overlay is running).</div>

        <dl className="detail-list">
          <div className="detail">
            <dt>Last verified</dt>
            <dd>{formatTimestamp(currentVerifiedAt)}</dd>
          </div>
          <div className="detail">
            <dt>Last overlay heartbeat</dt>
            <dd>{formatTimestamp(currentHeartbeatAt)}</dd>
          </div>
          <div className="detail">
            <dt>OBS reminder</dt>
            <dd>Keep the Browser Source on the scene with the overlay slot visible while verifying.</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
