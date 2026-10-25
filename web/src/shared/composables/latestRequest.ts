import { ApiError } from '../api/errors.ts';

/** A list owns one current query. Equal in-flight queries share their response. */
export function createLatestRequest<T>(onPending: (pending: boolean) => void = () => {}) {
  let sequence = 0;
  let disposed = false;
  let active: { key: string; controller: AbortController; promise: Promise<T> } | undefined;
  const cancelled = () => new ApiError('cancelled', 'Query superseded', { code: 'ERR_CANCELED' });

  function cancel() {
    sequence++;
    active?.controller.abort();
    active = undefined;
    onPending(false);
  }

  return {
    run(key: string, request: (signal: AbortSignal) => Promise<T>): Promise<T> {
      if (disposed) return Promise.reject(cancelled());
      if (active?.key === key) return active.promise;
      active?.controller.abort();
      const current = ++sequence;
      const controller = new AbortController();
      onPending(true);
      const promise = Promise.resolve().then(() => {
        if (disposed || current !== sequence) throw cancelled();
        return request(controller.signal);
      }).then(result => {
        if (disposed || current !== sequence || controller.signal.aborted) throw cancelled();
        return result;
      }).catch((error: unknown) => {
        if (disposed || current !== sequence || controller.signal.aborted) throw cancelled();
        throw error;
      }).finally(() => {
        if (current === sequence) { active = undefined; onPending(false); }
      });
      active = { key, controller, promise };
      return promise;
    },
    cancel,
    dispose() { disposed = true; cancel(); },
  };
}
