import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter that normalizes all errors into the standard
 * API error envelope (Appendix C). Never exposes stack traces to clients.
 * Errors are emitted through Nest Logger (backed by Pino after bootstrap).
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { id?: string; user?: { id?: string } }>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let errors: { field: string; message: string }[] | undefined;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as Record<string, unknown>;
        message = (responseObj.message as string) ?? message;

        // Handle class-validator errors
        if (Array.isArray(responseObj.message)) {
          message = 'Validation failed';
          errors = (responseObj.message as string[]).map((msg) => ({
            field: 'unknown',
            message: msg,
          }));
        }
      }
    }

    const requestId =
      request.id ??
      (typeof request.headers['x-request-id'] === 'string'
        ? request.headers['x-request-id']
        : undefined);

    // Structured fields for Pino; stack only for unexpected 500s (never to client)
    this.logger.error({
      statusCode,
      message,
      path: request.url,
      method: request.method,
      requestId,
      userId: request.user?.id,
      ...(statusCode >= HttpStatus.INTERNAL_SERVER_ERROR && exception instanceof Error
        ? { err: { type: exception.name, message: exception.message, stack: exception.stack } }
        : {}),
    });

    if (requestId && !response.getHeader('X-Request-ID')) {
      response.setHeader('X-Request-ID', requestId);
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors,
      timestamp: new Date().toISOString(),
      ...(requestId ? { metadata: { requestId } } : {}),
    });
  }
}
