import { z } from 'zod';
import { badRequest, notFound, ok } from '@/lib/http';
import {
  clearExpiredVerifyNonceIfNeeded,
  isOverlayKeyValid,
  recordOverlayHeartbeat,
} from '@/lib/overlay';
import { getStreamById } from '@/lib/streams';

const bodySchema = z.object({
  streamId: z.string().min(1),
  overlaySessionId: z.string().min(1),
});

export async function POST(request: Request) {
  const url = new URL(request.url);
  const overlayKey = url.searchParams.get('k');
  if (!overlayKey) {
    return badRequest('Missing overlay key.');
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return badRequest('Invalid heartbeat payload.', parsed.error.flatten());
  }

  const stream = await getStreamById(parsed.data.streamId);
  if (!stream) {
    return notFound('Stream not found.');
  }

  if (!isOverlayKeyValid(stream, overlayKey)) {
    return badRequest('Overlay access denied.');
  }

  const currentStream = await clearExpiredVerifyNonceIfNeeded(stream);
  const shouldRefreshVerifiedAt =
    currentStream.overlay.lastVerifiedOverlaySessionId === parsed.data.overlaySessionId;

  await recordOverlayHeartbeat(
    parsed.data.streamId,
    parsed.data.overlaySessionId,
    shouldRefreshVerifiedAt,
  );

  return ok({
    ok: true,
    refreshedVerification: shouldRefreshVerifiedAt,
  });
}
