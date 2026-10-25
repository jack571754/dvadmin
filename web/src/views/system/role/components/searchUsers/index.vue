<template>
	<el-drawer size="min(1000px, 100vw)" v-model="RoleUserDrawer.drawerVisible" direction="rtl" destroy-on-close :before-close="handleClose">
	<template #header>
		<div>
			{{ $t('message.pages.role.dialog.currentRole') }}
			<el-tag>{{ RoleUserDrawer.role_name }}</el-tag>
		</div>
	</template>
    <el-alert v-if="list.error.value" :title="list.error.value" type="error" :closable="false"><el-button @click="doRefresh()">{{ $t('message.design.retry') }}</el-button></el-alert>
    <fs-crud ref="crudRef" v-bind="crudBinding">
		<template #pagination-right>
				<el-popover placement="top" :width="200" trigger="click">
					<template #reference>
						<el-button text :type="selectedRowsCount > 0 ? 'primary' : ''">{{ $t('message.pages.user.buttons.selectedCount', { count: selectedRowsCount }) }}</el-button>
					</template>
					<el-table :data="selectedRows" size="small" :max-height="500" >
						<!-- <el-table-column width="100" property="id" label="id" /> -->
						<el-table-column width="100" property="name" :label="$t('message.pages.user.table.columns.name')" />
						<el-table-column fixed="right" :label="$t('message.pages.user.table.columns.actions')" min-width="60">
							<template #default="scope">
								<el-button text type="info" :icon="Close" @click="removeSelectedRows(scope.row)" circle />
							</template>
						</el-table-column>
					</el-table>
				</el-popover>
			</template>
		<template #pagination-left>
			<el-tooltip :content="$t('message.pages.role.buttons.batchDelete')">
				<el-button v-show="selectedRowsCount > 0 && auth('role:SetUserRole')" type="danger" :disabled="busy" @click="multipleDel" :icon="Delete">{{ $t('message.pages.role.buttons.batchDelete') }}</el-button>
			</el-tooltip>
		</template>
	 </fs-crud>
	<subUser ref="subUserRef" :role-id="RoleUserDrawer.role_id" :refreshCallback="refreshData"> </subUser>
	</el-drawer>
</template>

<script lang="ts" setup>
import { auth } from '/@/utils/authFunction';
import { ref, defineAsyncComponent, computed, watch, onBeforeUnmount } from 'vue';
import { useExpose, useCrud } from '@fast-crud/fast-crud';
import { createCrudOptions } from './crud';
import { Close, Delete } from '@element-plus/icons-vue';
import { removeRoleUser, getRoleUsersAuthorized } from './api';
import { ElMessageBox } from 'element-plus';
import { successNotification } from '/@/utils/message';
import { useI18n } from 'vue-i18n';
import { useThemeConfig } from '/@/stores/themeConfig';
import { RoleUserStores } from '../../stores/RoleUserStores';
import { createRoleUserList } from '/@/features/roles/userList';
import { createConfirmedAction } from '/@/features/users/confirmedAction';
import { captureSession } from '/@/shared/access/sessionEvents';
const { t } = useI18n();
const theme = useThemeConfig();
const RoleUserDrawer = RoleUserStores();
const subUser = defineAsyncComponent(() => import('../addUsers/index.vue'));
const subUserRef = ref(), crudRef = ref(), crudBinding = ref();
const drawer = ref(false), busy = ref(false);
const list = createRoleUserList(() => RoleUserDrawer.drawerVisible ? RoleUserDrawer.role_id : undefined, getRoleUsersAuthorized);
const selectedRows = list.selected;
const selectedRowsCount = computed(() => selectedRows.value.length);
const { crudExpose } = useExpose({ crudRef, crudBinding });
const refresh = crudExpose.doRefresh;
crudExpose.doRefresh = async options => {
  try { await refresh(options); } catch { /* The list and HTTP client present failures. */ }
  finally { if (crudBinding.value?.table) crudBinding.value.table.loading = list.loading.value; }
};
const pending = new Set<string | number>();
const run = createConfirmedAction(pending, auth, () => {
  const assertSession = captureSession(), role = RoleUserDrawer.role_id;
  return () => { assertSession(); if (!RoleUserDrawer.drawerVisible || role !== RoleUserDrawer.role_id) throw new DOMException('Role changed', 'AbortError'); };
});
async function removeUsers(ids: Array<string | number>) {
  if (busy.value || !ids.length) return;
  const role = RoleUserDrawer.role_id;
  if (role === undefined) return;
  busy.value = true;
  const saved = await run(role, 'role:SetUserRole', async () => {
    try { await ElMessageBox.confirm(t('message.pages.role.messages.deleteUserConfirm', { count: ids.length }), t('message.pages.role.buttons.confirm')); return true; }
    catch { return false; }
  }, async () => { await removeRoleUser(role, [...ids]); });
  busy.value = false;
  if (saved) { selectedRows.value = []; successNotification('message.pages.role.messages.updateSuccess'); await crudExpose.doRefresh(); }
}
const multipleDel = () => removeUsers(selectedRows.value.map(row => row.id));
function removeSelectedRows(row: { id: string | number }) { selectedRows.value = selectedRows.value.filter(item => item.id !== row.id); crudExpose.getBaseTableRef()?.toggleRowSelection(row, false); }
const refreshData = () => crudExpose.doRefresh();
function handleClose(done: () => void) { if (!busy.value) { list.reset(); subUserRef.value?.close?.(); done(); } }
const context = { subUserRef, listRequest: list.request, selectedRows, busy, removeUsers };
const { resetCrudOptions } = useCrud({ crudExpose, crudOptions: createCrudOptions({ crudExpose, context }).crudOptions });
watch(() => [RoleUserDrawer.role_id, RoleUserDrawer.drawerVisible], () => {
  list.reset(); subUserRef.value?.close?.();
  crudBinding.value.data = [];
});
watch(() => theme.themeConfig.globalI18n, () => {
  const options = createCrudOptions({ crudExpose, context }).crudOptions;
  resetCrudOptions({ ...options, data: crudBinding.value.data, pagination: { ...crudBinding.value.pagination },
    search: { ...options.search, initialForm: { ...crudExpose.getSearchFormData() } } });
});
onBeforeUnmount(list.dispose);
const { setSearchFormData, doRefresh } = crudExpose;
defineExpose({ drawer, setSearchFormData, doRefresh });
</script>
