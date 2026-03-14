import { z } from 'zod';
import { badRequest, notFound, ok } from '@/lib/http';
import {
  clearExpiredVerifyNonceIfNeeded,
  completeVerifyChallenge,
  isOverlayKeyValid,
} from '@/lib/overlay';
import { getDb } from '@/lib/firestore';
import { createId } from '@/lib/ids';
import { getStreamById } from '@/lib/streams';

const bodySchema = z.object({
  streamId: z.string().min(1),
  overlaySessionId: z.string().min(1),
  verifyNonce: z.string().min(1),
});

export async function POST(request: Request) {
  const url = new URL(request.url);
  const overlayKey = url.searchParams.get('k');
  if (!overlayKey) {
    return badRequest('Missing overlay key.');
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return badRequest('Invalid verify completion payload.', parsed.error.flatten());
  }

  const stream = await getStreamById(parsed.data.streamId);
  if (!stream) {
    return notFound('Stream not found.');
  }

  if (!isOverlayKeyValid(stream, overlayKey)) {
    return badRequest('Overlay access denied.');
  }

  const currentStream = await clearExpiredVerifyNonceIfNeeded(stream);
  if (!currentStream.overlay.verifyNonce || currentStream.overlay.verifyNonce !== parsed.data.verifyNonce) {
    return badRequest('Verification request was not active.');
  }

  if (
    !currentStream.overlay.verifyNonceExpiresAt ||
    currentStream.overlay.verifyNonceExpiresAt.getTime() <= Date.now()
  ) {
    return badRequest('Verification request expired.');
  }

  await completeVerifyChallenge(parsed.data.streamId, parsed.data.overlaySessionId);
  await getDb()
    .collection('streams')
    .doc(parsed.data.streamId)
    .collection('events')
    .doc(createId('evt'))
    .set({
      type: 'overlay_verified',
      createdAt: new Date(),
      message: 'Overlay verification completed from OBS.',
    });

  return ok({
    ok: true,
  });
}
