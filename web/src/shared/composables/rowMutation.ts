import { reactive } from 'vue';

/** Element Plus before-change commits only when this action returns true. */
export function useRowMutation() {
  const pending = reactive(new Set<string | number>());
  return {
    pending,
    async run(key: string | number, action: () => Promise<unknown>): Promise<boolean> {
      if (pending.has(key)) return false;
      pending.add(key);
      try { await action(); return true; }
      catch { return false; } // The HTTP client already reports non-cancellation failures.
      finally { pending.delete(key); }
    },
  };
}
