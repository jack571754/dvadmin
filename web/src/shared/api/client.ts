import axios, { AxiosError, AxiosHeaders, type AxiosRequestConfig, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { ApiError, type ApiErrorKind } from './errors.ts';

export interface HttpDependencies {
  getSession: () => { token: string | null; revision: number };
  subscribe: (reset: () => void) => () => void;
  getApiBaseURL: () => string;
  getOrigin: () => string;
  getLanguage: () => string;
  expireSession: () => void;
  notifyExpired: () => void;
  notifyError: (error: ApiError) => void;
  message: (kind: ApiErrorKind, status?: number) => string;
}

interface RequestScope {
  token: string | null;
  revision: number;
  bound: boolean;
  authenticated: boolean;
  controller: AbortController;
  release: () => void;
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === 'object' ? value as Record<string, unknown> : undefined;
}

/** Shared lifecycle and transport policy; callers select an explicit legacy response contract. */
export function createHttpRuntime(deps: HttpDependencies) {
  const active = new Set<RequestScope>();
  const scopes = new WeakMap<object, RequestScope>();
  let expired: { token: string; revision: number } | undefined;
  const unsubscribe = deps.subscribe(() => {
    for (const scope of active) if (scope.bound) scope.controller.abort();
  });

  function stale(scope: RequestScope | undefined) {
    if (!scope?.bound) return false;
    const current = deps.getSession();
    return scope.token !== current.token || scope.revision !== current.revision;
  }

  function cancel(config?: AxiosRequestConfig, cause?: unknown) {
    return new ApiError('cancelled', deps.message('cancelled'), { code: 'ERR_CANCELED', config, cause });
  }

  function finish(scope: RequestScope | undefined) {
    if (!scope) return;
    scope.release();
    active.delete(scope);
  }

  function report(error: ApiError, scope?: RequestScope) {
    if (error.kind === 'cancelled') return;
    if (error.kind === 'auth' && scope?.authenticated && scope.token) {
      if (expired?.token === scope.token && expired.revision === scope.revision) return;
      expired = { token: scope.token, revision: scope.revision };
      // Synchronous invalidation makes concurrent old responses stale before their callbacks run.
      deps.expireSession();
      deps.notifyExpired();
      return;
    }
    deps.notifyError(error);
  }

  async function decoded(response: AxiosResponse<unknown>) {
    const value = response.data;
    const contentType = String(response.headers['content-type'] || '').toLowerCase();
    if (value instanceof Blob && (contentType.includes('/json') || contentType.includes('+json'))) {
      try { return JSON.parse(await value.text()) as unknown; }
      catch { return value; }
    }
    return value;
  }

  function responseError(body: unknown, response: AxiosResponse<unknown>, contract: 'dvadmin' | 'legacy') {
    const value = record(body);
    // Swagger and third-party payloads retain their own return structures.
    if (!value || value.swagger !== undefined || value.code === undefined) return;
    const code = value.code;
    if (contract === 'legacy' ? !code : code === 2000) return;
    const kind: ApiErrorKind = code === 401 || code === 4001 ? 'auth'
      : code === 403 ? 'forbidden' : code === 400 ? 'validation' : 'business';
    return new ApiError(kind, typeof value.msg === 'string' ? value.msg : deps.message(kind), {
      code: typeof code === 'number' || typeof code === 'string' ? code : undefined,
      data: value.data, status: response.status, response, config: response.config,
    });
  }

  function createClient(defaults: AxiosRequestConfig, contract: 'dvadmin' | 'legacy' = 'dvadmin') {
    const client = axios.create(defaults);
    client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const current = deps.getSession();
      const base = new URL(config.baseURL || deps.getApiBaseURL(), deps.getOrigin());
      const target = new URL(config.url || '', base);
      const api = new URL(deps.getApiBaseURL(), deps.getOrigin());
      const bound = target.origin === api.origin;
      const headers = AxiosHeaders.from(config.headers);
      if (bound && current.token && !headers.has('Authorization')) headers.set('Authorization', `JWT ${current.token}`);
      if (!headers.has('Accept-Language')) headers.set('Accept-Language', deps.getLanguage());
      config.headers = headers;
      const adapter = axios.getAdapter(config.adapter || client.defaults.adapter);
      const controller = new AbortController();
      const callerSignal = config.signal;
      const abort = () => controller.abort();
      if (callerSignal?.aborted) controller.abort();
      else callerSignal?.addEventListener?.('abort', abort, { once: true });
      const scope: RequestScope = {
        ...current, bound,
        authenticated: bound && !!current.token && headers.get('Authorization') === `JWT ${current.token}`,
        controller, release: () => callerSignal?.removeEventListener?.('abort', abort),
      };
      config.signal = controller.signal;
      scopes.set(config, scope);
      active.add(scope);
      // Custom/mock adapters can reject with a plain Error; keep its request ownership too.
      config.adapter = async requestConfig => {
        try { return await adapter(requestConfig); }
        catch (error: unknown) {
          if (record(error)?.config) throw error;
          throw AxiosError.from(error, undefined, requestConfig);
        }
      };
      return config;
    });

    client.interceptors.response.use(async response => {
      const scope = scopes.get(response.config);
      try {
        if (stale(scope) || scope?.controller.signal.aborted) throw cancel(response.config);
        const body = await decoded(response);
        if (stale(scope) || scope?.controller.signal.aborted) throw cancel(response.config);
        const failure = responseError(body, response, contract);
        if (failure) { report(failure, scope); throw failure; }
        // Axios interceptor typing models raw responses. Legacy adapters return the full envelope.
        return (contract === 'dvadmin' && response.config.responseType === 'blob' ? response : response.data) as AxiosResponse;
      } finally { finish(scope); }
    }, async (cause: unknown) => {
      const original = record(cause);
      const config = original?.config as AxiosRequestConfig | undefined;
      const scope = config ? scopes.get(config) : undefined;
      try {
        if (stale(scope) || scope?.controller.signal.aborted || axios.isCancel(cause)) throw cancel(config, cause);
        const response = original?.response as AxiosResponse<unknown> | undefined;
        const status = response?.status;
        const body = response ? await decoded(response) : undefined;
        if (stale(scope) || scope?.controller.signal.aborted) throw cancel(config, cause);
        const code = original?.code;
        const kind: ApiErrorKind = status === 401 ? 'auth' : status === 403 ? 'forbidden'
          : status === 400 || status === 422 ? 'validation' : status !== undefined && status >= 500 ? 'server'
            : code === 'ECONNABORTED' || code === 'ETIMEDOUT' || status === 408 ? 'timeout'
              : status !== undefined ? 'business' : 'network';
        const envelope = record(body);
        const failure = new ApiError(kind,
          typeof envelope?.msg === 'string' ? envelope.msg : deps.message(kind, status), {
            status, data: envelope && 'data' in envelope ? envelope.data : body, response, config, cause,
            code: typeof envelope?.code === 'number' ? envelope.code : typeof code === 'string' ? code : undefined,
          });
        report(failure, scope);
        throw failure;
      } finally { finish(scope); }
    });
    return client;
  }

  return { createClient, dispose() {
    unsubscribe();
    for (const scope of active) { scope.controller.abort(); finish(scope); }
  }, get pendingCount() { return active.size; } };
}
