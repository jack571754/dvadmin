<template>
	<el-drawer
		class="admin-permission-drawer"
		v-model="RoleDrawer.drawerVisible"
		:title="$t('message.pages.role.dialog.assignPermissions')"
		direction="rtl"
		size="min(1080px, 100vw)"
		:close-on-click-modal="false"
		:before-close="closeDrawer"
		:destroy-on-close="true"
	>
		<template #header>
			<div>
				{{ $t('message.pages.role.dialog.currentRole') }}
				<el-tag style="margin-right: 20px">{{ RoleDrawer.roleName }}</el-tag>
				{{ $t('message.pages.role.dialog.authorizedUsers') }}
				<el-button size="small" :icon="UserFilled" :disabled="state.writing.value || !auth('role:SetUserRole')" @click="handleUsers">{{ state.users.value.length }}</el-button>
			</div>
		</template>
		<el-alert v-if="state.error.value" :title="state.error.value" type="error" :closable="false">
      <el-button v-if="state.selected.value" :disabled="state.writing.value" @click="retryDetail">{{ $t('message.design.retry') }}</el-button>
    </el-alert>
    <div v-if="state.loading.value" role="status">{{ $t('message.design.roleLoading') }}</div>
		<splitpanes class="default-theme" style="height: 100%">
			<pane min-size="20" size="22">
				<div class="pane-box">
					<MenuTreeCom />
				</div>
			</pane>
			<pane min-size="20">
				<div class="pane-box">
					<el-tabs v-model="activeName" class="demo-tabs">
						<el-tab-pane :label="$t('message.pages.role.dialog.interfacePermission')" name="first"><MenuBtnCom /></el-tab-pane>
						<el-tab-pane :label="$t('message.pages.role.dialog.columnPermission')" name="second"><MenuFieldCom /></el-tab-pane>
					</el-tabs>
				</div>
			</pane>
		</splitpanes>
	</el-drawer>

	<el-dialog v-model="dialogVisible" :title="$t('message.pages.role.dialog.assignUsers')" width="min(700px, 95vw)" :close-on-click-modal="false" destroy-on-close :before-close="closeUsers">
		<RoleUsersCom />
	</el-dialog>
</template>

<script setup lang="ts">
import { Splitpanes, Pane } from 'splitpanes';
import 'splitpanes/dist/splitpanes.css';
import { UserFilled } from '@element-plus/icons-vue';
import { RoleDrawerStores } from '../stores/RoleDrawerStores';
import { defineAsyncComponent, ref, provide, watch, onBeforeUnmount, onDeactivated } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

import { createRoleAuthorization, roleAuthorizationKey } from '/@/features/roles/authorization';
import * as api from './api';
import { auth } from '/@/utils/authFunction';
import { ElMessageBox } from 'element-plus';
import { useI18n } from 'vue-i18n';

const MenuTreeCom = defineAsyncComponent(() => import('./RoleMenuTree.vue'));
const MenuBtnCom = defineAsyncComponent(() => import('./RoleMenuBtn.vue'));
const MenuFieldCom = defineAsyncComponent(() => import('./RoleMenuField.vue'));
const RoleUsersCom = defineAsyncComponent(() => import('./RoleUsers.vue'));
const RoleDrawer = RoleDrawerStores(); // 抽屉参数

const activeName = ref('first');
const dialogVisible = ref(false);
const { t } = useI18n();
const state = createRoleAuthorization({
  menus: roleId => api.getRoleMenu({ roleId }),
  detail: async (roleId, menuId) => (await api.getRoleMenuBtnField({ roleId, menuId })).data,
  menu: api.setRoleMenu,
  fields: api.setRoleMenuField,
  buttons: api.batchSetRoleMenuBtn,
  range: api.setRoleMenuBtnDataRange,
  users: async (roleId, data) => (await api.setRoleUsers(roleId, data)).data.users,
  allowed: operation => auth(operation === 'users' ? 'role:SetUserRole' : operation === 'buttons' ? 'role:SetMenuButton' : operation === 'range' ? 'role:SetDataRange' : 'role:SetMenu'),
  discard: async () => {
    try { await ElMessageBox.confirm(t('message.design.roleLeaveDraft'), t('message.design.roleUnsaved'), {
      confirmButtonText: t('message.design.roleDiscard'), cancelButtonText: t('message.design.roleStay'), type: 'warning',
    }); return true; } catch { return false; }
  },
  failed: error => error instanceof Error ? error.message : t('message.design.roleFailed'),
});
provide(roleAuthorizationKey, state);
watch(() => [RoleDrawer.drawerVisible, RoleDrawer.roleId], () => {
  dialogVisible.value = false;
  if (RoleDrawer.drawerVisible && RoleDrawer.roleId !== undefined) {
    activeName.value = 'first'; void state.open(RoleDrawer.roleId, RoleDrawer.users || []);
  } else state.reset();
}, { immediate: true });
watch(() => auth('role:SetMenu'), allowed => { if (!allowed) { state.reset(); RoleDrawer.handleDrawerClose(); } });
onBeforeUnmount(state.reset);
onBeforeRouteLeave(() => state.canLeave());
onDeactivated(() => { state.reset(); RoleDrawer.handleDrawerClose(); });
async function closeDrawer() { if (await state.canLeave()) RoleDrawer.handleDrawerClose(); }
async function retryDetail() {
  if (state.dirty.value) { await state.refreshButtons(); return; }
  if (state.selected.value) await state.select(state.selected.value, true);
}

const handleUsers = () => {
  if (!state.writing.value && auth('role:SetUserRole')) dialogVisible.value = true;
};
function closeUsers(done: () => void) { if (!state.writing.value) done(); }
watch(() => state.users.value, rows => { if (RoleDrawer.roleId === state.role.value) RoleDrawer.users = rows; });
</script>

<style lang="scss" scoped>
.pane-box {
	width: 100%;
	height: 100%;
	max-width: 100%; /* 确保不超过父元素的宽度 */
	max-height: 100%; /* 确保不超过父元素的高度 */
	overflow: auto; /* 当内容超出容器尺寸时显示滚动条 */
	padding: 24px;
	background-color: var(--admin-surface);
}
</style>
