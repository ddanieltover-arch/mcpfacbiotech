import type { IncomingMessage, ServerResponse } from 'http';
import type { Express } from 'express';

/**
 * Vercel serverless entry (apps/api/api/index.ts).
 * Uses compiled Nest output so path aliases and workspace packages resolve.
 */
let cached: Express | null = null;
let bootError: Error | null = null;

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  try {
    if (bootError) {
      throw bootError;
    }

    if (!cached) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { getExpressInstance } = require('../dist/create-app') as {
        getExpressInstance: () => Promise<Express>;
      };
      cached = await getExpressInstance();
    }

    cached(req, res);
  } catch (error) {
    bootError = error instanceof Error ? error : new Error(String(error));
    console.error('[vercel-api] bootstrap failed:', bootError.message);
    console.error(bootError.stack);

    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('content-type', 'application/json');
      res.end(
        JSON.stringify({
          error: 'FUNCTION_BOOTSTRAP_FAILED',
          message: bootError.message,
        }),
      );
    }
  }
}
