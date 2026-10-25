import { ref } from 'vue';
import { createLatestRequest } from '../../shared/composables/latestRequest.ts';
import { ApiError } from '../../shared/api/errors.ts';

export function createRoleUserList(currentRole: () => string | number | undefined,
  fetch: (query: Record<string, unknown>, signal: AbortSignal) => Promise<Record<string, unknown>>) {
  const loading = ref(false), error = ref('');
  const selected = ref<Array<{ id: string | number; [key: string]: unknown }>>([]);
  const latest = createLatestRequest<Record<string, unknown>>(value => { loading.value = value; });
  return {
    loading, error, selected,
    async request(query: Record<string, unknown>) {
      const role = currentRole();
      if (role === undefined) return { data: [], total: 0, page: 1, limit: 20, code: 2000 };
      const snapshot = { ...query, role_id: role };
      error.value = '';
      try {
        const result = await latest.run(JSON.stringify(snapshot), signal => fetch(snapshot, signal));
        if (role !== currentRole()) throw new ApiError('cancelled', 'Role changed');
        return result;
      } catch (failure) {
        if (!(failure instanceof ApiError && failure.kind === 'cancelled')) error.value = failure instanceof Error ? failure.message : 'Request failed';
        throw failure;
      }
    },
    reset() { latest.cancel(); error.value = ''; selected.value = []; },
    dispose: () => latest.dispose(),
  };
}
