import { z } from 'zod';
import { badRequest, notFound, ok } from '@/lib/http';
import { clearExpiredVerifyNonceIfNeeded, getVerificationStatus } from '@/lib/overlay';
import { getStreamById } from '@/lib/streams';

const querySchema = z.object({
  streamId: z.string().min(1),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({
    streamId: url.searchParams.get('streamId'),
  });

  if (!parsed.success) {
    return badRequest('Invalid verify status query.', parsed.error.flatten());
  }

  const stream = await getStreamById(parsed.data.streamId);
  if (!stream) {
    return notFound('Stream not found.');
  }

  const currentStream = await clearExpiredVerifyNonceIfNeeded(stream);
  return ok({
    status: getVerificationStatus(currentStream),
    verifiedAt: currentStream.overlay.verifiedAt?.toISOString() ?? null,
    lastHeartbeatAt: currentStream.overlay.lastHeartbeatAt?.toISOString() ?? null,
    expiresAt: currentStream.overlay.verifyNonceExpiresAt?.toISOString() ?? null,
  });
}
