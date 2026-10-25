export interface UserListState {
  status: 'all' | 'active' | 'disabled';
  department: number | null;
  page: number;
  pageSize: number;
  ordering?: string;
}

export function normalizeUserListState(value: unknown): UserListState {
  const source = value && typeof value === 'object' ? value as Record<string, unknown> : {};
  return {
    status: source.status === 'active' || source.status === 'disabled' ? source.status : 'all',
    department: typeof source.department === 'number' && Number.isSafeInteger(source.department) && source.department > 0 ? source.department : null,
    page: typeof source.page === 'number' && Number.isSafeInteger(source.page) && source.page > 0 ? source.page : 1,
    pageSize: typeof source.pageSize === 'number' && [10, 20, 50, 100].includes(source.pageSize) ? source.pageSize : 20,
    ordering: typeof source.ordering === 'string' && /^-?(id|name|username|create_datetime)$/.test(source.ordering) ? source.ordering : undefined,
  };
}

/** Allowlist non-sensitive preferences; names, emails and free-text queries are never stored. */
export function createUserListState(storage: Pick<Storage, 'getItem' | 'setItem'>, accountId: string) {
  const key = `dvadmin:users:list:v1:${encodeURIComponent(accountId)}`;
  return {
    read(): UserListState {
      try { return normalizeUserListState(accountId ? JSON.parse(storage.getItem(key) || 'null') : null); }
      catch { return normalizeUserListState(null); }
    },
    write(value: UserListState) {
      if (!accountId) return;
      try { storage.setItem(key, JSON.stringify(normalizeUserListState(value))); }
      catch { /* Unavailable storage must not block a successful query. */ }
    },
  };
}
