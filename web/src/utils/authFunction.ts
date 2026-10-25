import { BtnPermissionStore } from '/@/stores/btnPermission';

export function auth(value: string): boolean {
  return BtnPermissionStore().hasPermission(value);
}

export function auths(values: string[]): boolean {
  return values.some(auth);
}

export function authAll(values: string[]): boolean {
  const store = BtnPermissionStore();
  return store.status === 'ready' && values.every(auth);
}
