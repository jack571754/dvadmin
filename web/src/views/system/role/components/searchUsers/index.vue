<template>
	<el-drawer size="70%" v-model="RoleUserDrawer.drawerVisible" direction="rtl" destroy-on-close :before-close="handleClose">
	<template #header>
		<div>
			{{ $t('message.pages.role.dialog.currentRole') }}
			<el-tag>{{ RoleUserDrawer.role_name }}</el-tag>
		</div>
	</template>
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
				<el-button v-show="selectedRowsCount > 0 && auth('role:SetMenu')" type="danger"  @click="multipleDel" :icon="Delete">{{ $t('message.pages.role.buttons.batchDelete') }}</el-button>
			</el-tooltip>
		</template>
	 </fs-crud>
	<subUser ref="subUserRef" :refreshCallback="refreshData"> </subUser>
	</el-drawer>
</template>

<script lang="ts" setup>
import {auth} from "/@/utils/authFunction";
import { ref, onMounted, defineAsyncComponent, computed, watch } from 'vue';
import { useFs } from '@fast-crud/fast-crud';
import { createCrudOptions } from './crud';
import { Close, Delete } from '@element-plus/icons-vue';
import XEUtils from 'xe-utils';
import {removeRoleUser} from "./api"
import { ElMessageBox } from 'element-plus';
import { errorMessage, successNotification } from '/@/utils/message';
import { i18n } from '/@/i18n/index';
import { useThemeConfig } from '/@/stores/themeConfig';
import { storeToRefs } from 'pinia';
import { RoleUserStores } from '../../stores/RoleUserStores';

const { themeConfig } = storeToRefs(useThemeConfig());
const RoleUserDrawer = RoleUserStores(); // 授权用户抽屉参数

const subUser = defineAsyncComponent(() => import('../addUsers/index.vue'));
const subUserRef = ref();

const refreshData = () => {
  crudExpose.doRefresh();
};

//抽屉是否显示
const drawer = ref(false);

//抽屉关闭确认
const handleClose = (done: () => void) => {
	selectedRows.value = [];
	done();
};

// 选中行的条数
const selectedRowsCount = computed(() => {
	return selectedRows.value.length;
});

const removeSelectedRows = (row: any) => {
	const tableRef = crudExpose.getBaseTableRef();
	const tableData = crudExpose.getTableData();
	if (XEUtils.pluck(tableData, 'id').includes(row.id)) {
		tableRef.toggleRowSelection(row, false);
	} else {
		selectedRows.value = XEUtils.remove(selectedRows.value, (item: any) => item.id !== row.id);
	}
};

const multipleDel = async ()  => {
	if (selectedRows.value.length < 1) {
		errorMessage('message.pages.role.messages.checkUsersFirst');
		return
	} 
	await ElMessageBox.confirm(i18n.global.t('message.pages.role.messages.deleteUserConfirm', { count: selectedRows.value.length }), i18n.global.t('message.pages.role.buttons.confirm'));
		const req = await removeRoleUser(crudRef.value.getSearchFormData().role_id, XEUtils.pluck(selectedRows.value, 'id'));
		selectedRows.value = [];
		successNotification(req.msg)
		crudExpose.doRefresh()
}

const { crudBinding, crudRef, crudExpose, selectedRows, resetCrudOptions } = useFs({ createCrudOptions, context: {subUserRef} });
const { setSearchFormData, doRefresh } = crudExpose;

// 语言切换时重新构建 crud options
watch(
	() => themeConfig.value.globalI18n,
	() => {
		resetCrudOptions();
	}
);

defineExpose({ drawer, setSearchFormData, doRefresh });

</script>
