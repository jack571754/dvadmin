<template>
	<fs-page class="admin-role">
    <PageHeading :title="t('message.design.roleTitle')" :description="t('message.design.roleHint')" />
		<div v-if="listFailed" class="role-load-error" role="alert">
			<span>{{ t('message.design.roleListFailed') }}</span>
			<el-button link type="primary" @click="crudExpose.doRefresh()">{{ t('message.design.retry') }}</el-button>
		</div>
		<fs-crud ref="crudRef" v-bind="crudBinding"> </fs-crud>
		<PermissionDrawerCom />
		<RoleUser ref="RoleUserRef" />
	</fs-page>
</template>

<script lang="ts" setup name="role">
import { defineAsyncComponent, onActivated, onDeactivated, onMounted, onUnmounted, ref, watch } from 'vue';
import PageHeading from '/@/shared/ui/PageHeading.vue';
import { useI18n } from 'vue-i18n';
import { useFs } from '@fast-crud/fast-crud';
import type { PageQuery } from '@fast-crud/fast-crud';
import type { RolePageContext } from './context';
import { createCrudOptions } from './crud';
import * as api from './api';
import { RoleDrawerStores } from './stores/RoleDrawerStores';
import { RoleUserStores } from './stores/RoleUserStores';
import { useThemeConfig } from '/@/stores/themeConfig';
import { storeToRefs } from 'pinia';
import { useRowMutation } from '/@/shared/composables/rowMutation';
import { onSessionChanged } from '/@/shared/access/sessionEvents';
import { createLatestRequest } from '/@/shared/composables/latestRequest';
import { isSilentRequestError } from '/@/shared/api/errors';

const { t } = useI18n();
const { themeConfig } = storeToRefs(useThemeConfig());

const RoleUser = defineAsyncComponent(() => import('./components/searchUsers/index.vue'));
const RoleUserRef = ref();

const PermissionDrawerCom = defineAsyncComponent(() => import('./components/RoleDrawer.vue'));

const RoleDrawer = RoleDrawerStores(); // 角色-抽屉
const RoleUserDrawer = RoleUserStores(); // 授权用户抽屉参数

const listLoading = ref(false);
const listFailed = ref(false);
const latest = createLatestRequest<Record<string, unknown>>(pending => { listLoading.value = pending; });

const clearRoleContext = () => {
	RoleDrawer.$reset();
	RoleUserDrawer.$reset();
	latest.cancel();
};
const stopSession = onSessionChanged(clearRoleContext);
onUnmounted(() => { stopSession(); clearRoleContext(); latest.dispose(); });

// Every refresh, pagination and sort goes through one current query; a late answer cannot replace a newer one.
async function listRequest(query: PageQuery) {
	listFailed.value = false;
	const key = JSON.stringify(Object.fromEntries(Object.entries(query)
		.filter(([, value]) => value !== undefined && value !== '')
		.sort(([a], [b]) => a.localeCompare(b))));
	try {
		return await latest.run(key, signal => api.GetList(query, signal));
	} catch (error) {
		if (!isSilentRequestError(error)) listFailed.value = true;
		throw error;
	}
}

const roleContext: RolePageContext = { RoleDrawer, RoleUserDrawer, RoleUserRef,
  i18n: { t }, statusMutation: useRowMutation(), listRequest };
const { crudBinding, crudRef, crudExpose, resetCrudOptions } = useFs({
	createCrudOptions,
	context: roleContext,
});
const refresh = crudExpose.doRefresh;
// Register before useFs captures refresh for pagination, toolbar and form callbacks.
crudExpose.doRefresh = async (options) => {
	try { await refresh(options); }
	catch (error) { if (!isSilentRequestError(error)) listFailed.value = true; }
	finally { const table = crudBinding.value?.table; if (table) table.loading = listLoading.value; }
};

// 语言切换时重新构建 crud options
watch(
	() => themeConfig.value.globalI18n,
	() => {
        const form = { ...crudExpose.getSearchFormData() };
        const pagination = { ...crudBinding.value.pagination };
        const data = crudBinding.value.data;
        const sort = crudBinding.value?.table?.sort;
        const { crudOptions } = createCrudOptions({ crudExpose, context: roleContext });
        resetCrudOptions({ ...crudOptions, pagination, data,
          search: { ...crudOptions.search, initialForm: form }, table: { ...crudOptions.table, sort } });
	}
);

let resumeQuery = false;
onDeactivated(() => { resumeQuery = listLoading.value; latest.cancel(); });
onActivated(() => { if (resumeQuery) { resumeQuery = false; void crudExpose.doRefresh(); } });

// 页面打开后获取列表数据
onMounted(async () => {
	// 刷新
	await crudExpose.doRefresh();
});
</script>

<style scoped>
.role-load-error{display:flex;align-items:center;gap:12px;padding:10px 12px;margin-bottom:12px;color:var(--el-color-danger);background:var(--el-color-danger-light-9);border-radius:6px}
</style>
