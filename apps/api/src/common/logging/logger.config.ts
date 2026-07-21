import { ConfigService } from '@nestjs/config';
import { IncomingMessage, ServerResponse } from 'http';
import { Params } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import type { Options } from 'pino-http';

/**
 * Volume 4 logging: structured Pino logs with request ID, route, duration.
 * Never logs Authorization / Cookie or other sensitive fields.
 */
export function buildPinoParams(config: ConfigService): Params {
  const nodeEnv = config.get<string>('NODE_ENV') ?? 'development';
  const isProd = nodeEnv === 'production';
  const level = config.get<string>('LOG_LEVEL') ?? (isProd ? 'info' : 'debug');

  const pinoHttp: Options = {
    name: 'mcpfac-api',
    level,
    genReqId: (req: IncomingMessage, res: ServerResponse) => {
      const header = req.headers['x-request-id'];
      const id =
        (typeof header === 'string' && header.trim()) ||
        (Array.isArray(header) && header[0]) ||
        randomUUID();
      res.setHeader('X-Request-ID', id);
      return id;
    },
    customProps: (req) => ({
      requestId: req.id,
    }),
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.headers["x-api-key"]',
        'body.password',
        'body.currentPassword',
        'body.newPassword',
        'body.token',
      ],
      remove: true,
    },
    autoLogging: {
      ignore: (req) => {
        const url = req.url ?? '';
        return url.includes('/health') || url.includes('/api/docs');
      },
    },
    transport: isProd
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
  };

  return { pinoHttp };
}
