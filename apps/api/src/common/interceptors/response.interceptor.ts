import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';

/**
 * Wraps all successful responses in the standard API response envelope
 * per Appendix C. Attaches a unique requestId for log correlation.
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = (request.headers['x-request-id'] as string) ?? uuidv4();

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
