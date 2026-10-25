import { defineStore } from 'pinia';
import { onScopeDispose, ref } from 'vue';

interface PermissionSession {
  getToken: () => string | null;
  subscribe: (reset: () => void) => () => void;
}

/** Dependencies are injected to test delayed responses and account changes. */
export function createPermissionStore(fetchPermissions: () => Promise<unknown>, session: PermissionSession) {
  return defineStore('BtnPermission', () => {
    const data = ref<string[]>([]);
    const status = ref<'idle' | 'loading' | 'ready' | 'error'>('idle');
    let revision = 0;
    let owner: string | null = null;
    let pending: Promise<string[]> | undefined;

    function resetPermissions() {
      revision++;
      owner = null;
      pending = undefined;
      data.value = [];
      status.value = 'idle';
    }

    function hasPermission(value: string) {
      return status.value === 'ready' && owner === session.getToken() && data.value.includes(value);
    }

    function getBtnPermissionStore(): Promise<string[]> {
      const token = session.getToken();
      if (owner !== token) resetPermissions();
      if (!token) return Promise.resolve([]);
      if (pending) return pending;
      owner = token;
      const current = ++revision;
      status.value = 'loading';
      data.value = [];
      pending = Promise.resolve().then(fetchPermissions).then((result) => {
        if (current !== revision || token !== session.getToken()) {
          throw new DOMException('Permission session changed', 'AbortError');
        }
        if (!Array.isArray(result) || !result.every(item => typeof item === 'string')) {
          throw new TypeError('Invalid button permission response');
        }
        data.value = [...new Set(result)];
        status.value = 'ready';
        return data.value;
      }).catch((error: unknown) => {
        if (current === revision) {
          data.value = [];
          status.value = 'error';
        }
        throw error;
      }).finally(() => {
        if (current === revision) pending = undefined;
      });
      return pending;
    }

    onScopeDispose(session.subscribe(resetPermissions));
    return { data, status, hasPermission, getBtnPermissionStore, resetPermissions };
  });
}
