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
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

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

    // Log the error with full details for debugging (never exposed to client)
    this.logger.error(
      {
        statusCode,
        message,
        path: request.url,
        method: request.method,
        requestId: request.headers['x-request-id'],
        userId: (request as Record<string, unknown>).userId,
        ...(statusCode === HttpStatus.INTERNAL_SERVER_ERROR && exception instanceof Error
          ? { stack: exception.stack }
          : {}),
      },
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors,
      timestamp: new Date().toISOString(),
    });
  }
}
