import type { FieldPolicy } from '../../shared/api/fieldPolicy.ts';

export function restrictSavedColumns(value: unknown, policy: FieldPolicy): unknown[] | undefined {
  if (!Array.isArray(value)) return;
  return value.filter((item: unknown): item is Record<string, unknown> & { key: string } =>
    !!item && typeof item === 'object' && typeof (item as Record<string, unknown>).key === 'string').map(item => {
    const denied = Object.hasOwn(policy, item.key) && !policy[item.key].is_query;
    return { key: item.key, title: typeof item.title === 'string' ? item.title : '',
      fixed: item.fixed === 'left' || item.fixed === 'right' ? item.fixed : false,
      show: denied ? false : item.show !== false, __disabled: denied || item.__disabled === true,
      __show: item.__show !== false, __key: typeof item.__key === 'string' ? item.__key : `.${item.key}`,
      ...(item.children ? { children: restrictSavedColumns(item.children, policy) } : {}),
    };
  });
}

export function createUserColumnStorage(storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>,
  account: string, getPolicy: () => FieldPolicy) {
  const keyFor = (key: string) => `dvadmin:users:columns:v1:${encodeURIComponent(account)}:${encodeURIComponent(key)}`;
  return {
    async get(key: string) {
      try { return restrictSavedColumns(JSON.parse(storage.getItem(keyFor(key)) || 'null'), getPolicy()); }
      catch { return undefined; }
    },
    async set(key: string, value: unknown) {
      try { storage.setItem(keyFor(key), JSON.stringify(restrictSavedColumns(value, getPolicy()))); } catch { /* Preferences are optional. */ }
    },
    async remove(key: string) { try { storage.removeItem(keyFor(key)); } catch { /* Preferences are optional. */ } },
  };
}
