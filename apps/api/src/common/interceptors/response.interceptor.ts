import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { randomUUID } from 'crypto';
import { Request, Response } from 'express';

/**
 * Wraps all successful responses in the standard API response envelope
 * per Appendix C. Attaches a unique requestId for log correlation.
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request & { id?: string }>();
    const response = http.getResponse<Response>();

    const requestId =
      (typeof request.id === 'string' && request.id) ||
      (request.headers['x-request-id'] as string) ||
      randomUUID();

    request.headers['x-request-id'] = requestId;
    if (!response.getHeader('X-Request-ID')) {
      response.setHeader('X-Request-ID', requestId);
    }

    return next.handle().pipe(
      map((data) => {
        // Allow raw responses (e.g. file downloads, redirects)
        if (data && typeof data === 'object' && 'raw' in data) {
          return (data as { raw: unknown }).raw;
        }

        return {
          success: true,
          message: (data as Record<string, unknown>)?.message ?? 'Success',
          data: (data as Record<string, unknown>)?.data ?? data,
          metadata: {
            requestId,
            timestamp: new Date().toISOString(),
          },
        };
      }),
    );
  }
}
