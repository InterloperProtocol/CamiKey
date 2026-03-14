import { z } from 'zod';
import { badRequest, notFound, ok } from '@/lib/http';
import { createVerifyChallenge } from '@/lib/overlay';
import { getStreamById } from '@/lib/streams';

const bodySchema = z.object({
  streamId: z.string().min(1),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return badRequest('Invalid verify request payload.', parsed.error.flatten());
  }

  const stream = await getStreamById(parsed.data.streamId);
  if (!stream) {
    return notFound('Stream not found.');
  }

  const challenge = await createVerifyChallenge(parsed.data.streamId);
  return ok({
    status: 'pending',
    expiresAt: challenge.expiresAt.toISOString(),
  });
}
