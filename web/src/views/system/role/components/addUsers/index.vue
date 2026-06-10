<template>
	<el-dialog v-model="dialog" :title="$t('message.pages.role.dialog.assignUsers')" direction="rtl" destroy-on-close :before-close="handleDialogClose">
		<div style="height: 500px;" >
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
				<el-button type="primary" @click="handleDialogConfirm"> {{ $t('message.pages.role.buttons.confirm') }}</el-button>
				<el-button @click="handleDialogClose"> {{ $t('message.pages.role.buttons.cancel') }}</el-button>
			</div>
		</template>
	</el-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { useFs } from '@fast-crud/fast-crud';
import { createCrudOptions } from './crud';
import { successNotification } from '/@/utils/message';
import { addRoleUsers } from './api';
import { Close } from '@element-plus/icons-vue';
import XEUtils from 'xe-utils';
import { useThemeConfig } from '/@/stores/themeConfig';
import { storeToRefs } from 'pinia';

const { themeConfig } = storeToRefs(useThemeConfig());

const props = defineProps({
  refreshCallback: {
    type: Function,
    required: true,
  },
});

//对话框是否显示
const dialog = ref(false);

// 父组件刷新回调函数
const parentRefreshCallbackFunc =  props.refreshCallback;

//抽屉关闭确认
const handleDialogClose = () => {
	dialog.value = false;
	selectedRows.value = [];
};

const handleDialogConfirm = async () => {
	if (selectedRows.value.length === 0) {
		return;
	}
	await addRoleUsers(crudRef.value.getSearchFormData().role_id, XEUtils.pluck(selectedRows.value, 'id')).then(res => {
		successNotification(res.msg);
	})
	parentRefreshCallbackFunc && parentRefreshCallbackFunc();  // 刷新父组件
	handleDialogClose();
};

const { crudBinding, crudRef, crudExpose, selectedRows, resetCrudOptions } = useFs({ createCrudOptions, context: {} });
const { setSearchFormData, doRefresh } = crudExpose;

// 语言切换时重新构建 crud options
watch(
	() => themeConfig.value.globalI18n,
	() => {
		resetCrudOptions();
	}
);

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

defineExpose({ dialog, setSearchFormData, doRefresh, parentRefreshCallbackFunc});
</script>
