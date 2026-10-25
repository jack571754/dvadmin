import { computed, ref, type InjectionKey } from 'vue';
import type { RoleMenuTreeType, RoleMenuBtnType, RoleMenuFieldType, UsersType } from '../../views/system/role/types';

type Id = string | number;
interface Dependencies {
  menus(roleId: Id): Promise<RoleMenuTreeType[]>;
  detail(roleId: Id, menuId: Id): Promise<{ menu_btn: RoleMenuBtnType[]; menu_field: RoleMenuFieldType[] }>;
  menu(data: { roleId: Id; menuId: Id; isCheck: boolean }): Promise<unknown>;
  fields(roleId: Id, rows: RoleMenuFieldType[]): Promise<unknown>;
  buttons(data: { roleId: Id; menuId: Id; buttons: Record<string, unknown>[] }): Promise<unknown>;
  range(data: RoleMenuBtnType): Promise<unknown>;
  users?(roleId: Id, data: { direction: 'left' | 'right'; movedKeys: Id[] }): Promise<UsersType[]>;
  allowed(operation: 'menu' | 'fields' | 'buttons' | 'range' | 'users'): boolean;
  discard(): Promise<boolean>;
  failed(error: unknown): string;
}
const copy = <T>(value: T): T => JSON.parse(JSON.stringify(value));
export function createRoleAuthorization(api: Dependencies) {
  const role = ref<Id>();
  const tree = ref<RoleMenuTreeType[]>([]);
  const selected = ref<RoleMenuTreeType>();
  const buttons = ref<RoleMenuBtnType[]>([]);
  const fields = ref<RoleMenuFieldType[]>([]);
  const baseline = ref<RoleMenuFieldType[]>([]);
  const users = ref<UsersType[]>([]);
  const loading = ref(false), treeLoading = ref(false), writing = ref(false);
  const error = ref(''), treeError = ref('');
  const dirty = computed(() => JSON.stringify(fields.value) !== JSON.stringify(baseline.value));
  let revision = 0, selection = 0;
  let confirmedButtons: RoleMenuBtnType[] = [];
  function reset() {
    revision++; selection++;
    role.value = undefined; tree.value = []; selected.value = undefined; users.value = [];
    buttons.value = []; confirmedButtons = []; fields.value = []; baseline.value = [];
    loading.value = false; treeLoading.value = false; writing.value = false;
    error.value = ''; treeError.value = '';
  }
  async function loadTree() {
    if (role.value === undefined) return;
    const epoch = revision, id = role.value;
    treeLoading.value = true; treeError.value = '';
    try { const rows = await api.menus(id); if (epoch === revision) tree.value = rows; }
    catch (failure) { if (epoch === revision) treeError.value = api.failed(failure); }
    finally { if (epoch === revision) treeLoading.value = false; }
  }
  async function open(id: Id, assigned: UsersType[] = []) { reset(); role.value = id; users.value = copy(assigned); await loadTree(); }
  async function assignUsers(direction: 'left' | 'right', movedKeys: Id[]) {
    if (writing.value || role.value === undefined || !api.allowed('users') || !api.users) return false;
    const epoch = revision, roleId = role.value;
    writing.value = true; error.value = '';
    try {
      const rows = await api.users(roleId, { direction, movedKeys: [...movedKeys] });
      if (epoch !== revision) return false;
      users.value = copy(rows); return true;
    } catch (failure) { if (epoch === revision) error.value = api.failed(failure); return false; }
    finally { if (epoch === revision) writing.value = false; }
  }
  async function canLeave() {
    if (writing.value) return false;
    if (!dirty.value) return true;
    const epoch = revision, menu = selection;
    return await api.discard() && epoch === revision && menu === selection && !writing.value;
  }
  async function select(node: RoleMenuTreeType, retry = false) {
    if (role.value === undefined || writing.value) return false;
    if (!retry && selected.value?.id === node.id) return true;
    if (!retry && !(await canLeave())) return false;
    const epoch = revision, request = ++selection, roleId = role.value;
    selected.value = node; buttons.value = []; fields.value = []; baseline.value = []; error.value = '';
    if (node.is_catalog || node.id === undefined) { loading.value = false; return true; }
    loading.value = true;
    try {
      const data = await api.detail(roleId, node.id);
      if (epoch !== revision || request !== selection) return false;
      buttons.value = copy(data.menu_btn || []); confirmedButtons = copy(buttons.value);
      fields.value = copy(data.menu_field || []); baseline.value = copy(fields.value);
    } catch (failure) { if (epoch === revision && request === selection) error.value = api.failed(failure); }
    finally { if (epoch === revision && request === selection) loading.value = false; }
    return true;
  }
  async function write(operation: 'fields' | 'buttons' | 'range', action: (id: Id, menu: Id) => Promise<unknown>, success?: () => void) {
    if (writing.value || loading.value || role.value === undefined || selected.value?.id === undefined || !api.allowed(operation)) return false;
    const epoch = revision, menuEpoch = selection, id = role.value, menu = selected.value.id;
    writing.value = true; error.value = '';
    try {
      await action(id, menu);
      if (epoch !== revision || menuEpoch !== selection) return false;
      success?.(); return true;
    } catch (failure) { if (epoch === revision && menuEpoch === selection) error.value = api.failed(failure); return false; }
    finally { if (epoch === revision) writing.value = false; }
  }
  async function toggleMenu(node: RoleMenuTreeType, checked: boolean) {
    if (writing.value || treeLoading.value || role.value === undefined || node.id === undefined || !api.allowed('menu')) return false;
    const epoch = revision, id = role.value;
    writing.value = true; treeError.value = '';
    try { await api.menu({ roleId: id, menuId: node.id, isCheck: checked }); if (epoch === revision) node.isCheck = checked; return epoch === revision; }
    catch (failure) { if (epoch === revision) treeError.value = api.failed(failure); return false; }
    finally { if (epoch === revision) writing.value = false; }
  }
  async function saveFields() {
    if (!dirty.value) return true;
    const snapshot = copy(fields.value);
    return write('fields', id => api.fields(id, snapshot), () => { baseline.value = snapshot; });
  }
  async function saveButtons(ids: Id[], checked: boolean, range: number, dept: number[]) {
    const epoch = revision, menuEpoch = selection;
    const target = buttons.value.filter(row => ids.includes(row.id));
    const payload = target.map(row => ({ btnId: row.id, isCheck: checked, data_range: range, dept: [...dept] }));
    if (!payload.length) return false;
    const saved = await write('buttons', (roleId, menuId) => api.buttons({ roleId, menuId, buttons: payload }));
    if (!saved && epoch === revision && menuEpoch === selection) buttons.value = copy(confirmedButtons);
    if (saved) await refreshButtons();
    return saved;
  }
  async function saveRange(row: RoleMenuBtnType) {
    const snapshot = copy(row);
    const saved = await write('range', () => api.range(snapshot));
    if (saved) await refreshButtons();
    return saved;
  }
  async function refreshButtons() {
    if (role.value === undefined || selected.value?.id === undefined) return;
    const epoch = revision, request = selection;
    loading.value = true;
    try {
      const data = await api.detail(role.value, selected.value.id);
      if (epoch === revision && request === selection) { buttons.value = copy(data.menu_btn || []); confirmedButtons = copy(buttons.value); }
    } catch (failure) {
      if (epoch === revision && request === selection) { buttons.value = []; error.value = api.failed(failure); }
    } finally { if (epoch === revision && request === selection) loading.value = false; }
  }
  return { role, tree, selected, buttons, fields, users, dirty, loading, treeLoading, writing, error, treeError,
    open, reset, loadTree, select, canLeave, toggleMenu, saveFields, saveButtons, saveRange, refreshButtons, assignUsers,
    allowed: api.allowed,
    discardFields: () => { if (!writing.value) fields.value = copy(baseline.value); } };
}
export type RoleAuthorization = ReturnType<typeof createRoleAuthorization>;
export const roleAuthorizationKey: InjectionKey<RoleAuthorization> = Symbol('roleAuthorization');
