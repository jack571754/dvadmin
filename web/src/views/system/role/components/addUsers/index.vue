<template>
	<el-dialog v-model="dialog" :title="$t('message.pages.role.dialog.assignUsers')" direction="rtl" destroy-on-close :before-close="handleDialogClose">
		<div style="height: 500px;" >
			<el-alert v-if="list.error.value" :title="list.error.value" type="error" :closable="false"><el-button @click="doRefresh()">{{ $t('message.design.retry') }}</el-button></el-alert>
      <fs-crud ref="crudRef" v-bind="crudBinding">
				<template #pagination-right>
					<el-popover placement="top" :width="200" trigger="click">
						<template #reference>
							<el-button text :type="selectedRowsCount > 0 ? 'primary' : ''">{{ $t('message.pages.user.buttons.selectedCount', { count: selectedRowsCount }) }}</el-button>
						</template>
						<el-table :data="selectedRows" size="small" :max-height="500">
							<!-- <el-table-column width="100" property="id" label="id" /> -->
							<el-table-column width="100" property="name" :label="$t('message.pages.user.table.columns.name')" />
							<el-table-column fixed="right" :label="$t('message.pages.user.table.columns.actions')" min-width="50">
								<template #default="scope">
									<el-button text type="info" :icon="Close" @click="removeSelectedRows(scope.row)" circle />
								</template>
							</el-table-column>
						</el-table>
					</el-popover>
				</template>

			</fs-crud>
		</div>
		<template #footer>
			<div>
				<el-button type="primary" :loading="busy" :disabled="!auth('role:SetUserRole')" @click="handleDialogConfirm"> {{ $t('message.pages.role.buttons.confirm') }}</el-button>
				<el-button :disabled="busy" @click="handleDialogClose"> {{ $t('message.pages.role.buttons.cancel') }}</el-button>
			</div>
		</template>
	</el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue';
import { useExpose, useCrud } from '@fast-crud/fast-crud';
import { createCrudOptions } from './crud';
import { successNotification } from '/@/utils/message';
import { addRoleUsers, getRoleUsersUnauthorized } from './api';
import { Close } from '@element-plus/icons-vue';
import { useThemeConfig } from '/@/stores/themeConfig';
import { auth } from '/@/utils/authFunction';
import { captureSession } from '/@/shared/access/sessionEvents';
import { createConfirmedAction } from '/@/features/users/confirmedAction';
import { createRoleUserList } from '/@/features/roles/userList';
const theme = useThemeConfig();
const props = defineProps<{ roleId?: string | number; refreshCallback: () => unknown }>();
const dialog = ref(false), busy = ref(false), crudRef = ref(), crudBinding = ref();
const list = createRoleUserList(() => dialog.value ? props.roleId : undefined, getRoleUsersUnauthorized);
const selectedRows = list.selected;
const selectedRowsCount = computed(() => selectedRows.value.length);
const { crudExpose } = useExpose({ crudRef, crudBinding });
const refresh = crudExpose.doRefresh;
crudExpose.doRefresh = async options => {
  try { await refresh(options); } catch { /* Keep selection and present list/HTTP errors. */ }
  finally { if (crudBinding.value?.table) crudBinding.value.table.loading = list.loading.value; }
};
const context = { selectedRows, listRequest: list.request };
const { resetCrudOptions } = useCrud({ crudExpose, crudOptions: createCrudOptions({ crudExpose, context }).crudOptions });
const run = createConfirmedAction(new Set(), auth, () => {
  const assertSession = captureSession(), role = props.roleId;
  return () => { assertSession(); if (!dialog.value || props.roleId !== role) throw new DOMException('Role changed', 'AbortError'); };
});
function handleDialogClose(done?: () => void) { if (!busy.value) { dialog.value = false; list.reset(); if (typeof done === 'function') done(); } }
async function handleDialogConfirm() {
  if (busy.value || !selectedRows.value.length || props.roleId === undefined) return;
  const role = props.roleId, ids = selectedRows.value.map(row => row.id);
  busy.value = true;
  const saved = await run(role, 'role:SetUserRole', async () => true, () => addRoleUsers(role, ids));
  busy.value = false;
  if (saved) { successNotification('message.pages.role.messages.assignSuccess'); handleDialogClose(); props.refreshCallback(); }
}
function removeSelectedRows(row: { id: string | number }) { selectedRows.value = selectedRows.value.filter(item => item.id !== row.id); crudExpose.getBaseTableRef()?.toggleRowSelection(row, false); }
watch(() => props.roleId, () => { dialog.value = false; list.reset(); crudBinding.value.data = []; });
watch(() => theme.themeConfig.globalI18n, () => {
  const options = createCrudOptions({ crudExpose, context }).crudOptions;
  resetCrudOptions({ ...options, data: crudBinding.value.data, pagination: { ...crudBinding.value.pagination },
    search: { ...options.search, initialForm: { ...crudExpose.getSearchFormData() } } });
});
onBeforeUnmount(list.dispose);
const { setSearchFormData, doRefresh } = crudExpose;
const parentRefreshCallbackFunc = props.refreshCallback;
defineExpose({ dialog, setSearchFormData, doRefresh, parentRefreshCallbackFunc, close: () => { dialog.value = false; list.reset(); } });
</script>
