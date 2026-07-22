import type { ApiResponse, ApiPaginatedResponse, ApiErrorResponse } from '@mcpfac/shared-types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  token?: string;
};

/**
 * Centralized API client per Vol. 3 — all frontend requests go through this wrapper.
 * Handles auth tokens, error parsing, and typed responses.
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`/api/v1${path}`, this.baseUrl);
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
    const { method = 'GET', body, headers = {}, params, token } = options;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(this.buildUrl(path, params), {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      const error: ApiErrorResponse = await response.json().catch(() => ({
        success: false as const,
        statusCode: response.status,
        message: response.statusText || 'Request failed',
        timestamp: new Date().toISOString(),
      }));
      throw new ApiError(error);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
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
export const apiClient = new ApiClient(API_BASE_URL);
