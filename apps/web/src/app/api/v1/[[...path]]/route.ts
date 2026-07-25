import 'reflect-metadata';
import { handleWithNest, proxyToLocalNest, shouldEmbedNest } from '@/server/nest-bridge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function handle(request: Request): Promise<Response> {
  try {
    if (shouldEmbedNest()) {
      return await handleWithNest(request);
    }
    return await proxyToLocalNest(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[nest-route] failed:', message);
    return Response.json(
      {
        success: false,
        statusCode: 500,
        message: 'API bridge failed',
        error: message,
      },
      { status: 500 },
    );
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
export const HEAD = handle;
