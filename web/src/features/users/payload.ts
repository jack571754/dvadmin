import { Md5 } from 'ts-md5';
import type { FieldPolicy } from '../../shared/api/fieldPolicy.ts';

/** Operate on a fresh submission snapshot; never mutate the visible password or retry draft. */
export function prepareUserPayload(form: Record<string, unknown>, mode: 'add' | 'edit', policy: FieldPolicy,
  formKeys: string[], id?: string | number): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const key of formKeys) {
    if (!Object.hasOwn(form, key) || key === 'id' || (key === 'password' && mode === 'edit')) continue;
    const access = Object.hasOwn(policy, key) ? policy[key] : undefined;
    if (access && !(mode === 'add' ? access.is_create : access.is_update)) continue;
    Object.defineProperty(result, key, { enumerable: true, configurable: true, writable: true, value: form[key] });
  }
  if (mode === 'add' && typeof result.password === 'string' && result.password) result.password = Md5.hashStr(result.password);
  if (mode === 'edit' && id !== undefined) result.id = id;
  return result;
}
