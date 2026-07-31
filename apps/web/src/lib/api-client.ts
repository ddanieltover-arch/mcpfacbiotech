import type { ApiResponse, ApiPaginatedResponse, ApiErrorResponse } from '@mcpfac/shared-types';
import { getBackendOrigin } from '@/lib/backend-origin';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  token?: string;
  /** Client abort timeout in ms. Default 30s; use a higher value for slow mutations (e.g. checkout). */
  timeoutMs?: number;
};

/**
 * Centralized API client per Vol. 3 — all frontend requests go through this wrapper.
 * Handles auth tokens, error parsing, and typed responses.
 */
class ApiClient {
  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    // Resolve per request so browser origin / env changes are never stale.
    const url = new URL(`/api/v1${path}`, getBackendOrigin());
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {}, params, token, timeoutMs = 30_000 } = options;

    const requestHeaders: Record<string, string> = {
      ...headers,
    };

    // Only set JSON content-type when sending a body — otherwise browsers
    // treat GETs as non-simple and fire CORS preflights that the API bridge
    // historically broke (surface as "Failed to fetch" in admin).
    if (body !== undefined) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await fetch(this.buildUrl(path, params), {
        method,
        headers: requestHeaders,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        // Keep under serverless maxDuration (60s) so the bridge can still respond.
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      const message =
        error instanceof Error && error.name === 'TimeoutError'
          ? 'Request timed out — try again'
          : error instanceof Error
            ? error.message
            : 'Failed to fetch';
      const origin = getBackendOrigin();
      throw new ApiError({
        success: false,
        statusCode: 0,
        message:
          message === 'Failed to fetch'
            ? `Failed to fetch ${path} via ${origin}`
            : message,
        timestamp: new Date().toISOString(),
      });
    }

    if (!response.ok) {
      const raw = await response.text();
      let error: ApiErrorResponse;
      try {
        error = JSON.parse(raw) as ApiErrorResponse;
      } catch {
        error = {
          success: false,
          statusCode: response.status,
          message: raw.trim() || response.statusText || 'Request failed',
          timestamp: new Date().toISOString(),
        };
      }
      throw new ApiError(error);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    const raw = await response.text();
    if (!raw) {
      throw new ApiError({
        success: false,
        statusCode: response.status,
        message: `Empty response from ${path}`,
        timestamp: new Date().toISOString(),
      });
    }

    return JSON.parse(raw) as T;
  }

  async get<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(path, { ...options, method: 'GET' });
  }

  async getList<T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiPaginatedResponse<T>> {
    return this.request<ApiPaginatedResponse<T>>(path, { ...options, method: 'GET' });
  }

  async post<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(path, { ...options, method: 'POST', body });
  }

  async put<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(path, { ...options, method: 'PUT', body });
  }

  async patch<T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.request<ApiResponse<T>>(path, { ...options, method: 'PATCH', body });
  }

  async delete(path: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<void> {
    return this.request<void>(path, { ...options, method: 'DELETE' });
  }
}

/**
 * Typed API error with the standard error envelope.
 */
export class ApiError extends Error {
  statusCode: number;
  errors?: { field: string; message: string }[];

  constructor(error: ApiErrorResponse) {
    super(error.message);
    this.name = 'ApiError';
    this.statusCode = error.statusCode;
    this.errors = error.errors;
  }
}

/**
 * Singleton API client instance.
 */
export const apiClient = new ApiClient();
