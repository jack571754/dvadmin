export interface FieldAccess { is_query: boolean; is_create: boolean; is_update: boolean }
export type FieldPolicy = Record<string, FieldAccess>;

export interface PolicyColumn {
  column?: Record<string, unknown> | boolean;
  form?: Record<string, unknown> | boolean;
  addForm?: Record<string, unknown> | boolean;
  editForm?: Record<string, unknown> | boolean;
  viewForm?: Record<string, unknown> | boolean;
  search?: Record<string, unknown> | boolean;
  children?: Record<string, PolicyColumn>;
  [key: string]: unknown;
}

export function normalizeFieldPolicy(value: unknown): FieldPolicy {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new TypeError('Invalid field permission response');
  const result: FieldPolicy = {};
  for (const [key, access] of Object.entries(value)) {
    if (!access || typeof access !== 'object' || Array.isArray(access)) throw new TypeError('Invalid field permission entry');
    const entry = access as Record<string, unknown>;
    if (!['is_query', 'is_create', 'is_update'].every(flag => typeof entry[flag] === 'boolean')) {
      throw new TypeError('Invalid field permission flags');
    }
    Object.defineProperty(result, key, { enumerable: true, configurable: true, writable: true,
      value: { is_query: entry.is_query, is_create: entry.is_create, is_update: entry.is_update } });
  }
  return result;
}

function hidden(section: PolicyColumn['form']): Record<string, unknown> | false {
  return section === false ? false : { ...(typeof section === 'object' ? section : {}), show: false };
}

/** Permissions only narrow existing options, including validators and per-mode hiding rules. */
export function applyFieldPolicy<T extends Record<string, PolicyColumn>>(columns: T, policy: FieldPolicy, exclude: string[] = []): T {
  const result: Record<string, PolicyColumn> = {};
  for (const [key, source] of Object.entries(columns)) {
    const column = { ...source };
    if (column.children) column.children = applyFieldPolicy(column.children, policy, exclude);
    const access = Object.hasOwn(policy, key) ? policy[key] : undefined;
    if (access && !exclude.includes(key)) {
      if (!access.is_query) {
        column.column = source.column === false ? false : { ...(typeof source.column === 'object' ? source.column : {}), show: false, columnSetDisabled: true };
        column.search = source.search === false ? false : { ...(typeof source.search === 'object' ? source.search : {}), show: false, disabled: true };
        column.viewForm = hidden(source.viewForm);
      }
      if (!access.is_create) column.addForm = hidden(source.addForm);
      if (!access.is_update) column.editForm = hidden(source.editForm);
      // A mode-specific permission may never re-enable a base form intentionally disabled by the page.
      if (source.form === false) { column.addForm = false; column.editForm = false; column.viewForm = false; }
    }
    Object.defineProperty(result, key, { enumerable: true, configurable: true, writable: true, value: column });
  }
  return result as T;
}

export function fieldPolicyKey(policy: FieldPolicy): string {
  return JSON.stringify(Object.keys(policy).sort().map(key => [key, policy[key]]));
}
