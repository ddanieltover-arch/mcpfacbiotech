import { ConfigService } from '@nestjs/config';
import type { Options } from 'pino-http';
import { buildPinoParams } from './logger.config';

describe('buildPinoParams', () => {
  function config(values: Record<string, string | undefined>): ConfigService {
    return {
      get: <T = string>(key: string) => values[key] as T | undefined,
    } as ConfigService;
  }

  function httpOptions(params: ReturnType<typeof buildPinoParams>): Options {
    const raw = params.pinoHttp;
    if (Array.isArray(raw)) {
      return raw[0] as Options;
    }
    return raw as Options;
  }

  it('uses debug + pino-pretty in development', () => {
    const http = httpOptions(buildPinoParams(config({ NODE_ENV: 'development' })));

    expect(http).toMatchObject({
      name: 'mcpfac-api',
      level: 'debug',
    });
    expect(http.transport).toMatchObject({ target: 'pino-pretty' });
  });

  it('uses info + raw JSON in production', () => {
    const http = httpOptions(buildPinoParams(config({ NODE_ENV: 'production' })));

    expect(http).toMatchObject({
      level: 'info',
      transport: undefined,
    });
  });

  it('honors LOG_LEVEL override', () => {
    const http = httpOptions(
      buildPinoParams(config({ NODE_ENV: 'production', LOG_LEVEL: 'warn' })),
    );

    expect(http.level).toBe('warn');
  });

  it('reuses X-Request-ID when present', () => {
    const http = httpOptions(buildPinoParams(config({ NODE_ENV: 'production' })));
    const headers: Record<string, string> = {};
    const res = {
      setHeader: (key: string, value: string) => {
        headers[key] = value;
      },
    };

    const id = http.genReqId?.(
      { headers: { 'x-request-id': 'req-fixed-1' } } as never,
      res as never,
    );

    expect(id).toBe('req-fixed-1');
    expect(headers['X-Request-ID']).toBe('req-fixed-1');
  });
});
