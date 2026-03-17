'use client';

import { useEffect, useRef, useState } from 'react';

interface OverlayClientProps {
  streamId: string;
  overlayKey: string;
  initialChartUrl: string;
  initialStateNonce: number;
}

const POLL_INTERVAL_MS = 500;
const HEARTBEAT_INTERVAL_MS = 15_000;

export function OverlayClient({
  streamId,
  overlayKey,
  initialChartUrl,
  initialStateNonce,
}: OverlayClientProps) {
  const [chartUrl, setChartUrl] = useState(initialChartUrl);
  const overlaySessionIdRef = useRef('');
  const stateNonceRef = useRef(initialStateNonce);
  const pendingVerifyNonceRef = useRef<string | null>(null);

  useEffect(() => {
    const storageKey = `camikey-overlay-session:${streamId}`;
    let storedSessionId = window.localStorage.getItem(storageKey);
    if (!storedSessionId) {
      storedSessionId = window.crypto.randomUUID().replace(/-/g, '');
      window.localStorage.setItem(storageKey, storedSessionId);
    }
    overlaySessionIdRef.current = storedSessionId;

    let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    async function sendHeartbeat() {
      if (!overlaySessionIdRef.current) {
        return;
      }

      try {
        await fetch(`/api/overlay/heartbeat?k=${encodeURIComponent(overlayKey)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            streamId,
            overlaySessionId: overlaySessionIdRef.current,
          }),
        });
      } catch {
        // Heartbeats are best effort; the next interval will retry.
      }
    }

    async function completeVerifyIfNeeded(verifyNonce: string | null) {
      if (!verifyNonce || pendingVerifyNonceRef.current === verifyNonce || !overlaySessionIdRef.current) {
        return;
      }

      pendingVerifyNonceRef.current = verifyNonce;
      const response = await fetch(`/api/overlay/verify/complete?k=${encodeURIComponent(overlayKey)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streamId,
          overlaySessionId: overlaySessionIdRef.current,
          verifyNonce,
        }),
      });

      if (!response.ok) {
        pendingVerifyNonceRef.current = null;
      }
    }

    async function poll() {
      try {
        try {
          const params = new URLSearchParams({
            streamId,
            k: overlayKey,
            overlaySessionId: overlaySessionIdRef.current,
            sinceNonce: String(stateNonceRef.current),
          });
          const response = await fetch(`/api/stream/state?${params.toString()}`, {
            method: 'GET',
            cache: 'no-store',
          });

          if (response.ok) {
            const json = (await response.json()) as {
              changed: boolean;
              stateNonce: number;
              chartUrl?: string;
              verifyNonce?: string | null;
            };

            stateNonceRef.current = json.stateNonce;
            if (json.chartUrl) {
              setChartUrl(json.chartUrl);
            }

            await completeVerifyIfNeeded(json.verifyNonce ?? null);
          }
        } catch {
          // Polling is continuous, so we can safely retry on the next cycle.
        }
      } finally {
        if (!cancelled) {
          pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
        }
      }
    }

    void sendHeartbeat();
    heartbeatTimer = setInterval(() => {
      void sendHeartbeat();
    }, HEARTBEAT_INTERVAL_MS);

    void poll();

    return () => {
      cancelled = true;
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
      }
      if (pollTimer) {
        clearTimeout(pollTimer);
      }
    };
  }, [overlayKey, streamId]);

  return (
    <div className="overlay-root">
      <div className="overlay-slot">
        <div className="overlay-badge">(i) Ad</div>
        <iframe className="overlay-frame" key={chartUrl} src={chartUrl} title="CAMIUP Overlay Chart" />
      </div>
    </div>
  );
}
