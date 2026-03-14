import { badRequest, ok, unauthorized } from '@/lib/http';
import { refreshLiveIndexFromCron } from '@/lib/live-index';

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const secret = request.headers.get('x-cron-secret') || url.searchParams.get('secret');
    const result = await refreshLiveIndexFromCron(secret);

    return ok({
      indexedAt: result.indexedAt.toISOString(),
      count: result.streams.length,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'CRON_AUTH_FAILED') {
      return unauthorized('Invalid cron secret.');
    }

    if (error instanceof Error) {
      return badRequest(error.message);
    }

    return badRequest('Failed to refresh the live index.');
  }
}
