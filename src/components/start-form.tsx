'use client';

import { FormEvent, useState } from 'react';

interface RegisterResult {
  streamId: string;
  slug: string;
  overlayKey: string;
  streamerPageUrl: string;
  overlayUrl: string;
}

export function StartForm() {
  const [deployerWallet, setDeployerWallet] = useState('');
  const [streamerCoinMint, setStreamerCoinMint] = useState('');
  const [desiredSlug, setDesiredSlug] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RegisterResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/stream/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deployerWallet,
          streamerCoinMint,
          desiredSlug,
        }),
      });

      const json = (await response.json()) as RegisterResult & { error?: string };
      if (!response.ok) {
        throw new Error(json.error || 'Registration failed');
      }

      setResult(json);
      setDesiredSlug('');
      setStreamerCoinMint('');
      setDeployerWallet('');
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card panel stack">
      <div>
        <div className="eyebrow">Streamer Registration</div>
        <h1 style={{ fontSize: '2rem', margin: '10px 0 12px' }}>Register your creator market stream.</h1>
        <p className="subtitle">
          CAMIUP verifies the streamer coin directly against Pump.fun metadata before creating the
          overlay. We only support live Pump.fun streams and Dexscreener chart swaps.
        </p>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          <span className="label">Pump.fun deployer wallet</span>
          <input
            className="input mono"
            onChange={(event) => setDeployerWallet(event.target.value)}
            placeholder="Creator wallet address"
            required
            value={deployerWallet}
          />
        </label>

        <label>
          <span className="label">Streamer coin mint</span>
          <input
            className="input mono"
            onChange={(event) => setStreamerCoinMint(event.target.value)}
            placeholder="Pump.fun CA / token mint"
            required
            value={streamerCoinMint}
          />
        </label>

        <label>
          <span className="label">Desired slug</span>
          <input
            className="input mono"
            onChange={(event) => setDesiredSlug(event.target.value.toLowerCase())}
            placeholder="your-stream-name"
            required
            value={desiredSlug}
          />
        </label>

        <div className="button-row">
          <button className="button" disabled={submitting} type="submit">
            {submitting ? 'Creating stream...' : 'Create stream'}
          </button>
        </div>
      </form>

      {error ? <div className="status error">{error}</div> : null}

      {result ? (
        <div className="stack">
          <div className="status success">
            Stream created. Keep the overlay URL safe because the key is only shown once.
          </div>
          <dl className="detail-list">
            <div className="detail">
              <dt>Streamer page URL</dt>
              <dd className="mono">{result.streamerPageUrl}</dd>
            </div>
            <div className="detail">
              <dt>Overlay URL</dt>
              <dd className="mono">{result.overlayUrl}</dd>
            </div>
            <div className="detail">
              <dt>Overlay key</dt>
              <dd className="mono">{result.overlayKey}</dd>
            </div>
            <div className="detail">
              <dt>OBS note</dt>
              <dd>Load the overlay URL in an OBS Browser Source. Recommended slot size: 640x360.</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </div>
  );
}
