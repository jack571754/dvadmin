/** Hold the lock across confirmation and request; bind approval to the initiating session. */
export function createConfirmedAction(pending: Set<string | number>, allowed: (permission: string) => boolean,
  capture: () => () => void) {
  return async (key: string | number, permission: string, confirm: () => Promise<boolean>, action: () => Promise<unknown>) => {
    if (pending.has(key) || !allowed(permission)) return false;
    const assertCurrent = capture();
    pending.add(key);
    try {
      if (!(await confirm())) return false;
      assertCurrent();
      if (!allowed(permission)) return false;
      await action();
      assertCurrent();
      return true;
    } catch { return false; } // HTTP reports request errors; confirmation and session cancellation are quiet.
    finally { pending.delete(key); }
  };
}
