/** A session owns one in-flight initialization and one successful result. */
export function createSessionBootstrap(getKey: () => string | null) {
  let owner: string | null = null;
  let revision = 0;
  let pending: Promise<void> | undefined;
  let ready = false;

  function reset() {
    revision++;
    owner = null;
    pending = undefined;
    ready = false;
  }

  function ensure(initialize: (assertCurrent: () => void) => Promise<void>): Promise<void> {
    const key = getKey();
    if (!key) return Promise.reject(new DOMException('No session', 'AbortError'));
    if (key !== owner) reset();
    if (ready) return Promise.resolve();
    if (pending) return pending;
    owner = key;
    const current = ++revision;
    const assertCurrent = () => {
      if (current !== revision || key !== getKey()) {
        throw new DOMException('Session changed', 'AbortError');
      }
    };
    pending = Promise.resolve().then(() => {
      assertCurrent();
      return initialize(assertCurrent);
    }).then(() => {
      assertCurrent();
      ready = true;
    }).finally(() => {
      if (current === revision) pending = undefined;
    });
    return pending;
  }

  return { ensure, reset };
}
