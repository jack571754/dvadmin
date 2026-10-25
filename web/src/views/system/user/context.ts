import type { PageQuery } from '@fast-crud/fast-crud';
import type { useRowMutation } from '/@/shared/composables/rowMutation';
import type { createUserFormSession } from '/@/features/users/formSession';

export type UserFormSession = ReturnType<typeof createUserFormSession>;
export type UserStatusMutation = ReturnType<typeof useRowMutation>;

/** Everything the user CRUD table needs from the page; required so the table cannot silently bypass it. */
export interface UserPageContext {
  listRequest: (query: PageQuery) => Promise<unknown>;
  i18n: { t: (key: string) => string };
  statusMutation: UserStatusMutation;
  onExportTask: () => void;
  formSession: UserFormSession;
  assertFormAccess: (mode: string) => void;
  submitUser: (mode: 'add' | 'edit', form: Record<string, unknown>, id?: string | number) => Promise<unknown>;
  openUserForm: (mode: 'add' | 'edit', row?: Record<string, unknown>, index?: number) => Promise<void>;
  focusFormError: (field?: string) => void;
  startForm: () => void;
  statusPayload: (row: Record<string, unknown>) => Record<string, unknown>;
  canUpdateField: (key: string) => boolean;
}
