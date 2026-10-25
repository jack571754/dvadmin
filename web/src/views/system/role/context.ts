import type { PageQuery } from '@fast-crud/fast-crud';
import type { useRowMutation } from '/@/shared/composables/rowMutation';
import type { RoleDrawerStores } from './stores/RoleDrawerStores';
import type { RoleUserStores } from './stores/RoleUserStores';

export type RoleDrawer = ReturnType<typeof RoleDrawerStores>;
export type RoleUserDrawer = ReturnType<typeof RoleUserStores>;
export type RoleStatusMutation = ReturnType<typeof useRowMutation>;

/** Public surface of the async "assign users" dialog component. */
export interface RoleUserDialogRef {
  setSearchFormData: (options: { form: { role_id: string | number } }) => void;
  doRefresh: () => void;
}

/** Everything the CRUD table needs from the page; provided once so the table cannot silently fall back. */
export interface RolePageContext {
  RoleDrawer: RoleDrawer;
  RoleUserDrawer: RoleUserDrawer;
  RoleUserRef: { value: RoleUserDialogRef | undefined };
  i18n: { t: (key: string) => string };
  statusMutation: RoleStatusMutation;
  listRequest: (query: PageQuery) => Promise<unknown>;
}
