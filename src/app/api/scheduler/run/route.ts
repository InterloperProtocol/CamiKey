import { badRequest, ok, unauthorized } from '@/lib/http';
import { runScheduledLifecycleFromCron } from '@/lib/scheduler';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const secret = request.headers.get('x-cron-secret') || url.searchParams.get('secret');
    const forceLiveIndex = url.searchParams.get('forceLiveIndex') === '1';
    const limitRaw = url.searchParams.get('limit');
    const limit = limitRaw ? Number(limitRaw) : undefined;

    const result = await runScheduledLifecycleFromCron(secret, {
      forceLiveIndex,
      limit,
    });

    return ok(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'CRON_AUTH_FAILED') {
      return unauthorized('Invalid cron secret.');
    }

    if (error instanceof Error) {
      return badRequest(error.message);
    }

    return badRequest('Failed to run scheduled lifecycle.');
  }
}
