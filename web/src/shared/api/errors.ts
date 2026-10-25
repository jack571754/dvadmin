import type { AxiosRequestConfig, AxiosResponse } from 'axios';

export type ApiErrorKind = 'network' | 'timeout' | 'cancelled' | 'auth' | 'forbidden' | 'validation' | 'business' | 'server';

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly code?: string | number;
  readonly status?: number;
  readonly data?: unknown;
  readonly msg: string;
  readonly response?: AxiosResponse<unknown>;
  readonly config?: AxiosRequestConfig;
  readonly __CANCEL__: boolean;

  constructor(kind: ApiErrorKind, message: string, options: {
    code?: string | number; status?: number; data?: unknown;
    response?: AxiosResponse<unknown>; config?: AxiosRequestConfig; cause?: unknown;
  } = {}) {
    super(message, { cause: options.cause });
    this.name = kind === 'cancelled' ? 'AbortError' : 'ApiError';
    this.kind = kind;
    this.msg = message;
    this.code = options.code;
    this.status = options.status;
    this.data = options.data;
    this.response = options.response;
    this.config = options.config;
    this.__CANCEL__ = kind === 'cancelled';
  }
}

export function isSilentRequestError(error: unknown): boolean {
  return error instanceof ApiError && error.kind === 'cancelled';
}

/** Session changes, superseded queries and aborted requests must not surface as failures. */
export function isCancellation(error: unknown): boolean {
  if (error instanceof ApiError) return error.kind === 'cancelled';
  if (!error || typeof error !== 'object') return false;
  const source = error as Record<string, unknown>;
  return source.name === 'AbortError' || source.kind === 'cancelled' || source.code === 'ERR_CANCELED';
}
