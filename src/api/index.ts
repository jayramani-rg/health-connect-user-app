import type { ApiResponse, NormalizedError } from '../types/common.types';
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../config/env';

interface ApiConfigureOptions {
  getToken: () => string | null;
  getRefreshToken: () => string | null;
  onTokensRefreshed: (accessToken: string, refreshToken: string) => void;
  onSessionExpired: () => void;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
  isRetry?: boolean;
  authOverride?: string;
}

// A real Error subclass, not a plain object literal — every screen in the app checks
// `error instanceof Error` to decide whether to show the actual server/network message or a generic
// fallback. A plain `{ message, statusCode, errors }` literal fails that check and silently hides the
// real reason behind a hardcoded fallback everywhere in the app; extending Error fixes that at the source.
class ApiError extends Error implements NormalizedError {
  statusCode: number;
  errors: string[] | null;

  constructor(message: string, statusCode: number, errors: string[] | null = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

function normalizeError(message: string, statusCode: number, errors: string[] | null = null): NormalizedError {
  return new ApiError(message, statusCode, errors);
}

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}

class ApiSingleton {
  private baseUrl = API_BASE_URL;
  private getToken: () => string | null = () => null;
  private getRefreshToken: () => string | null = () => null;
  private onTokensRefreshed: (accessToken: string, refreshToken: string) => void = () => {};
  private onSessionExpired: () => void = () => {};
  private refreshPromise: Promise<boolean> | null = null;

  configure(options: ApiConfigureOptions): void {
    this.getToken = options.getToken;
    this.getRefreshToken = options.getRefreshToken;
    this.onTokensRefreshed = options.onTokensRefreshed;
    this.onSessionExpired = options.onSessionExpired;
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { body, skipAuth, isRetry, authOverride, headers, ...rest } = options;
    const token = authOverride ?? (skipAuth ? null : this.getToken());
    const formData = isFormData(body);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...rest,
        headers: {
          ...(formData ? {} : { 'Content-Type': 'application/json' }),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...headers,
        },
        body: formData ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
    } catch (error) {
      clearTimeout(timeout);
      if (error instanceof Error && error.name === 'AbortError') {
        throw normalizeError('Request timed out. Please try again.', 0);
      }
      throw normalizeError('Network error — check your connection.', 0);
    }
    clearTimeout(timeout);

    let payload: ApiResponse<T> | null = null;
    try {
      payload = (await response.json()) as ApiResponse<T>;
    } catch {
      payload = null;
    }

    if (response.status === 401 && !skipAuth && !authOverride && !isRetry) {
      const refreshed = await this.refreshTokens();
      if (refreshed) {
        return this.request<T>(path, { ...options, isRetry: true });
      }
      this.onSessionExpired();
      throw normalizeError('Your session has expired. Please sign in again.', 401);
    }

    if (!response.ok) {
      throw normalizeError(payload?.message ?? `Request failed (${response.status}).`, response.status, payload?.errors ?? null);
    }

    if (!payload) {
      throw normalizeError('Unexpected empty response from server.', response.status);
    }

    return payload;
  }

  private async refreshTokens(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    if (!this.refreshPromise) {
      this.refreshPromise = this.performRefresh(refreshToken).finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
  }

  private async performRefresh(refreshToken: string): Promise<boolean> {
    try {
      const result = await this.request<{ accessToken: string; refreshToken: string }>('/auth/refresh-token', {
        method: 'POST',
        body: { refreshToken },
        skipAuth: true,
      });

      if (result.data.accessToken && result.data.refreshToken) {
        this.onTokensRefreshed(result.data.accessToken, result.data.refreshToken);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }
}

export const API = new ApiSingleton();
