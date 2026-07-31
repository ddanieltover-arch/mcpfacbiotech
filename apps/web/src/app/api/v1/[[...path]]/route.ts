import 'reflect-metadata';
import {
  getNestFallbackOrigin,
  handleCorsPreflight,
  handleWithNest,
  proxyToLocalNest,
  proxyToOrigin,
  readRequestBody,
  shouldEmbedNest,
} from '@/server/nest-bridge';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function handle(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return handleCorsPreflight(request);
  }

  // Buffer once so embed failure can still proxy POST/PUT/PATCH with a body.
  const bodyBuffer = await readRequestBody(request);

  try {
    if (shouldEmbedNest()) {
      try {
        return await handleWithNest(request, bodyBuffer);
      } catch (embedError) {
        const fallback = getNestFallbackOrigin();
        if (fallback) {
          console.error(
            '[nest-route] embed failed; proxying to fallback API:',
            embedError instanceof Error ? embedError.message : embedError,
          );
          return await proxyToOrigin(fallback, request, bodyBuffer);
        }
        throw embedError;
      }
    }
    return await proxyToLocalNest(request, bodyBuffer);
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
