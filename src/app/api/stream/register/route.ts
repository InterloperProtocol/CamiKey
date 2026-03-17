import { z } from 'zod';
import { badRequest, ok, serverError } from '@/lib/http';
import { getRequestOrigin } from '@/lib/env';
import { registerStream } from '@/lib/streams';

const bodySchema = z.object({
  deployerWallet: z.string().trim().min(1),
  streamerCoinMint: z.string().trim().min(1),
  desiredSlug: z.string().trim().min(1),
});

export async function POST(request: Request) {
  try {
    const body = bodySchema.parse(await request.json());
    const result = await registerStream(body, {
      appUrl: getRequestOrigin(request),
    });
    return ok(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return badRequest('Invalid registration payload.', error.flatten());
    }

    if (error instanceof Error) {
      return badRequest(error.message);
    }

    return serverError('Failed to register stream.');
  }
}
