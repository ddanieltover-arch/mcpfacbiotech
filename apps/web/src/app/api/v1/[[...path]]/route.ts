import 'reflect-metadata';
import {
  applyCorsHeaders,
  getNestFallbackOrigin,
  handleCorsPreflight,
  handleWithNest,
  proxyToOrigin,
  readRequestBody,
  resolveProxyOrigin,
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
    let response: Response;

    if (shouldEmbedNest()) {
      try {
        response = await handleWithNest(request, bodyBuffer);
      } catch (embedError) {
        const fallback = getNestFallbackOrigin();
        if (!fallback) {
          throw embedError;
        }
        console.error(
          '[nest-route] embed failed; proxying to fallback API:',
          embedError instanceof Error ? embedError.message : embedError,
        );
        response = await proxyToOrigin(fallback, request, bodyBuffer);
      }
    } else {
      // Default on Vercel: proxy to the API project. Embed is opt-in via NEST_EMBEDDED=1.
      response = await proxyToOrigin(resolveProxyOrigin(), request, bodyBuffer);
    }

    return applyCorsHeaders(request, response);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[nest-route] failed:', message);
    return applyCorsHeaders(
      request,
      Response.json(
        {
          success: false,
          statusCode: 500,
          message: 'API bridge failed',
          error: message,
        },
        { status: 500 },
      ),
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
