import path from 'node:path';
import { createRequire } from 'node:module';
import { Readable } from 'node:stream';
import { existsSync } from 'node:fs';
import type { IncomingMessage } from 'node:http';
import type { Express } from 'express';

type NestCreateApp = {
  getExpressInstance: () => Promise<Express>;
};

type MockResponse = {
  statusCode: number;
  statusMessage: string;
  headersSent: boolean;
  setHeader: (name: string, value: number | string | readonly string[]) => MockResponse;
  getHeader: (name: string) => number | string | string[] | undefined;
  getHeaders: () => Record<string, number | string | string[]>;
  removeHeader: (name: string) => void;
  writeHead: (
    code: number,
    phraseOrHeaders?: string | Record<string, string | string[]>,
    maybeHeaders?: Record<string, string | string[]>,
  ) => MockResponse;
  write: (chunk?: unknown, encodingOrCb?: unknown, cb?: unknown) => boolean;
  end: (chunk?: unknown, encodingOrCb?: unknown, cb?: unknown) => MockResponse;
  on: (...args: unknown[]) => MockResponse;
  once: (...args: unknown[]) => MockResponse;
  emit: (...args: unknown[]) => boolean;
  removeListener: (...args: unknown[]) => MockResponse;
  cork: () => void;
  uncork: () => void;
  flushHeaders: () => void;
};

let cachedApp: Express | null = null;
let bootPromise: Promise<Express> | null = null;
let bootError: Error | null = null;

function candidateCreateAppPaths(): string[] {
  const cwd = process.cwd();
  return [
    // Copied next to the Next app during Vercel build (most reliable for tracing).
    path.join(cwd, 'vendor', 'nest-api', 'create-app.js'),
    // Monorepo sibling (local / full checkout).
    path.join(cwd, '..', 'api', 'dist', 'create-app.js'),
    path.join(cwd, 'node_modules', '@mcpfac', 'api', 'dist', 'create-app.js'),
    path.join(cwd, '..', '..', 'node_modules', '@mcpfac', 'api', 'dist', 'create-app.js'),
  ];
}

function loadCreateApp(): NestCreateApp {
  const require = createRequire(
    typeof __filename !== 'undefined' ? __filename : import.meta.url,
  );

  const errors: string[] = [];

  try {
    return require('@mcpfac/api/create-app') as NestCreateApp;
  } catch (error) {
    errors.push(
      `@mcpfac/api/create-app: ${error instanceof Error ? error.message : String(error)}`,
    );
  }

  for (const candidate of candidateCreateAppPaths()) {
    if (!existsSync(candidate)) {
      errors.push(`missing ${candidate}`);
      continue;
    }
    try {
      return require(candidate) as NestCreateApp;
    } catch (error) {
      errors.push(`${candidate}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(`Unable to load Nest create-app. Tried:\n${errors.join('\n')}`);
}

async function loadNestExpress(): Promise<Express> {
  if (bootError) {
    throw bootError;
  }
  if (cachedApp) {
    return cachedApp;
  }
  if (!bootPromise) {
    bootPromise = (async () => {
      try {
        const mod = loadCreateApp();
        cachedApp = await mod.getExpressInstance();
        return cachedApp;
      } catch (error) {
        bootError = error instanceof Error ? error : new Error(String(error));
        bootPromise = null;
        throw bootError;
      }
    })();
  }
  return bootPromise;
}

function toNodeHeaders(headers: Headers): IncomingMessage['headers'] {
  const result: IncomingMessage['headers'] = {};
  headers.forEach((value, key) => {
    if (key.toLowerCase() === 'transfer-encoding') {
      return;
    }
    const existing = result[key];
    if (existing === undefined) {
      result[key] = value;
    } else if (Array.isArray(existing)) {
      existing.push(value);
    } else {
      result[key] = [existing, value];
    }
  });
  return result;
}

function toBuffer(chunk: unknown, encoding?: unknown): Buffer {
  if (Buffer.isBuffer(chunk)) {
    return chunk;
  }
  if (chunk instanceof Uint8Array) {
    return Buffer.from(chunk);
  }
  const enc = typeof encoding === 'string' ? (encoding as BufferEncoding) : 'utf8';
  return Buffer.from(String(chunk ?? ''), enc);
}

/**
 * Bridge a Web Fetch Request into the Nest Express instance and return a Fetch Response.
 */
export async function handleWithNest(request: Request): Promise<Response> {
  const app = await loadNestExpress();
  const url = new URL(request.url);
  const bodyBuffer =
    request.method === 'GET' || request.method === 'HEAD'
      ? null
      : Buffer.from(await request.arrayBuffer());

  return new Promise<Response>((resolve, reject) => {
    const req = new Readable({
      read() {
        /* pushed below */
      },
    }) as IncomingMessage;

    req.method = request.method;
    req.url = `${url.pathname}${url.search}`;
    req.headers = toNodeHeaders(request.headers);
    if (bodyBuffer && bodyBuffer.length > 0) {
      req.headers['content-length'] = String(bodyBuffer.length);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).socket = { remoteAddress: '127.0.0.1' };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any).connection = (req as any).socket;

    const resChunks: Buffer[] = [];
    const headerStore = new Map<string, number | string | string[]>();
    let resolved = false;

    const finish = (res: MockResponse) => {
      if (resolved) {
        return;
      }
      resolved = true;

      const body = Buffer.concat(resChunks);
      const headers = new Headers();
      headerStore.forEach((value, key) => {
        if (key === 'content-encoding' || key === 'transfer-encoding' || key === 'content-length') {
          return;
        }
        if (Array.isArray(value)) {
          for (const entry of value) {
            headers.append(key, String(entry));
          }
        } else {
          headers.set(key, String(value));
        }
      });

      resolve(
        new Response(body.length > 0 ? body : null, {
          status: res.statusCode,
          statusText: res.statusMessage,
          headers,
        }),
      );
    };

    const res: MockResponse = {
      statusCode: 200,
      statusMessage: 'OK',
      headersSent: false,
      setHeader(name, value) {
        headerStore.set(String(name).toLowerCase(), value as number | string | string[]);
        return this;
      },
      getHeader(name) {
        return headerStore.get(String(name).toLowerCase());
      },
      getHeaders() {
        return Object.fromEntries(headerStore.entries());
      },
      removeHeader(name) {
        headerStore.delete(String(name).toLowerCase());
      },
      writeHead(code, phraseOrHeaders, maybeHeaders) {
        this.statusCode = code;
        if (typeof phraseOrHeaders === 'string') {
          this.statusMessage = phraseOrHeaders;
          if (maybeHeaders) {
            for (const [key, value] of Object.entries(maybeHeaders)) {
              this.setHeader(key, value);
            }
          }
        } else if (phraseOrHeaders) {
          for (const [key, value] of Object.entries(phraseOrHeaders)) {
            this.setHeader(key, value);
          }
        }
        this.headersSent = true;
        return this;
      },
      write(chunk, encodingOrCb, cb) {
        if (chunk !== undefined && chunk !== null) {
          const encoding = typeof encodingOrCb === 'string' ? encodingOrCb : undefined;
          resChunks.push(toBuffer(chunk, encoding));
        }
        const callback = typeof encodingOrCb === 'function' ? encodingOrCb : cb;
        if (typeof callback === 'function') {
          (callback as () => void)();
        }
        return true;
      },
      end(chunk, encodingOrCb, cb) {
        if (chunk !== undefined && chunk !== null) {
          this.write(chunk, encodingOrCb);
        }
        const callback = typeof encodingOrCb === 'function' ? encodingOrCb : cb;
        if (typeof callback === 'function') {
          (callback as () => void)();
        }
        finish(this);
        return this;
      },
      on() {
        return this;
      },
      once() {
        return this;
      },
      emit() {
        return false;
      },
      removeListener() {
        return this;
      },
      cork() {},
      uncork() {},
      flushHeaders() {
        this.headersSent = true;
      },
    };

    try {
      if (bodyBuffer && bodyBuffer.length > 0) {
        req.push(bodyBuffer);
      }
      req.push(null);
      app(req, res as never);
    } catch (error) {
      if (!resolved) {
        resolved = true;
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    }
  });
}

export async function proxyToOrigin(origin: string, request: Request): Promise<Response> {
  const nestOrigin = origin.replace(/\/$/, '');
  const incoming = new URL(request.url);
  const target = new URL(`${incoming.pathname}${incoming.search}`, nestOrigin);

  const headers = new Headers(request.headers);
  headers.delete('host');

  const init: RequestInit & { duplex?: 'half' } = {
    method: request.method,
    headers,
    redirect: 'manual',
  };

  if (request.method !== 'GET' && request.method !== 'HEAD' && request.body) {
    init.body = request.body;
    init.duplex = 'half';
  }

  return fetch(target, init);
}

/** Local turbo dx: proxy :3000 API traffic to Nest on :3001. */
export async function proxyToLocalNest(request: Request): Promise<Response> {
  return proxyToOrigin(process.env.BACKEND_URL || 'http://localhost:3001', request);
}

export function shouldEmbedNest(): boolean {
  return process.env.VERCEL === '1' || process.env.NEST_EMBEDDED === '1';
}

/**
 * Temporary bridge while Nest embed cold-start / tracing is verified.
 * Keep the old API project until same-origin embed is healthy, then unset.
 */
export function getNestFallbackOrigin(): string | undefined {
  const explicit =
    process.env.NEST_FALLBACK_URL?.trim() ||
    process.env.BACKEND_URL?.trim() ||
    process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, '');
  }
  if (process.env.VERCEL === '1') {
    return 'https://api.mcpfacbiotech.site';
  }
  return undefined;
}
