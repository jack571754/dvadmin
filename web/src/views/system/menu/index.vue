<template>
	<fs-page>
		<el-row class="menu-el-row">
			<el-col :span="6">
				<div class="menu-box menu-left-box">
					<MenuTreeCom
						ref="menuTreeRef"
						:treeData="menuTreeData"
						@treeClick="handleTreeClick"
						@updateDept="handleUpdateMenu"
						@deleteDept="handleDeleteMenu"
					/>
				</div>
			</el-col>

			<el-col :span="18">
				<div class="menu-box menu-table">
					<el-tabs type="card" class="menu-tabs">
						<el-tab-pane :label="$t('message.pages.menu.dialog.buttonPermission')">
							<div style="height: 72vh">
								<MenuButtonCom ref="menuButtonRef" class="menu-btn-fill" :handleScanClick="handleOpenScanModal" />
							</div>
						</el-tab-pane>
						<el-tab-pane :label="$t('message.pages.menu.dialog.columnPermissionTab')">
							<div style="height: 72vh">
								<MenuFieldCom ref="menuFieldRef" />
							</div>
						</el-tab-pane>
					</el-tabs>
				</div>

				<ScanModal
					ref="scanModalRef"
					v-model="scanModalVisible"
					:menuId="selectedMenuId"
					@success="handleScanSuccess"
				/>

			</el-col>
		</el-row>

		<el-drawer v-model="drawerVisible" direction="rtl" size="500px" :close-on-click-modal="false" :show-close="false" :before-close="handleDrawerClose">
			<template #header>
				<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
					<span>{{ $t('message.pages.menu.dialog.menuConfig') }}</span>
					<div>
						<el-button @click="handleDrawerClose" size="small">{{ $t('message.pages.menu.buttons.cancel') }}</el-button>
						<el-button type="primary" @click="handleSaveMenu" size="small" :loading="menuBtnLoading">{{ $t('message.pages.menu.buttons.save') }}</el-button>
					</div>
				</div>
			</template>
			<MenuFormCom
				v-if="drawerVisible"
				:initFormData="drawerFormData"
				:cacheData="menuTreeCacheData"
				:treeData="menuTreeData"
				@drawerClose="handleDrawerClose"
				@save="handleSaveMenu"
				ref="menuFormComRef"
			/>
		</el-drawer>
	</fs-page>
</template>

<script lang="ts" setup name="menuPages">
import { ref, onMounted, nextTick } from 'vue';
import XEUtils from 'xe-utils';
import { ElMessageBox, ElMessage } from 'element-plus';
import MenuTreeCom from './components/MenuTreeCom/index.vue';
import MenuButtonCom from './components/MenuButtonCom/index.vue';
import MenuFormCom from './components/MenuFormCom/index.vue';
import MenuFieldCom from './components/MenuFieldCom/index.vue';
import ScanModal from './components/ScanModal/index.vue';
import { GetList, DelObj } from './api';
import { successNotification } from '/@/utils/message';
import { i18n } from '/@/i18n/index';
import { APIResponseData, MenuTreeItemType } from './types';

let menuTreeData = ref([]);
let menuTreeCacheData = ref<MenuTreeItemType[]>([]);
let drawerVisible = ref(false);
let drawerFormData = ref<Partial<MenuTreeItemType>>({});
let menuTreeRef = ref<InstanceType<typeof MenuTreeCom> | null>(null);
let menuButtonRef = ref<InstanceType<typeof MenuButtonCom> | null>(null);
let menuFieldRef = ref<InstanceType<typeof MenuFieldCom> | null>(null);
let selectedMenuId = ref<number | null>(null);
let scanModalVisible = ref(false);
let scanModalRef = ref<any>(null);
let menuFormComRef = ref<InstanceType<typeof MenuFormCom> | null>(null);
let menuBtnLoading = ref(false);
const getData = () => {
	GetList({}).then((ret: APIResponseData) => {
		const responseData = ret.data;
		const result = XEUtils.toArrayTree(responseData, {
			parentKey: 'parent',
			children: 'children',
			strict: true,
		});
		menuTreeData.value = result;
	});
};

/**
 * 菜单的点击事件
 */
const handleTreeClick = (record: MenuTreeItemType) => {
	selectedMenuId.value = record.id ?? null;
	menuButtonRef.value?.handleRefreshTable(record);
  menuFieldRef.value?.handleRefreshTable(record)
};

/**
 * 部门的 新增 or 编辑 事件
 */
const handleUpdateMenu = (type: string, record?: MenuTreeItemType) => {
	if (type === 'update' && record) {
		const parentData = menuTreeRef.value?.treeRef?.currentNode.parent.data || {};
		menuTreeCacheData.value = [parentData];
		drawerFormData.value = record;
	}
	drawerVisible.value = true;
};
const handleDrawerClose = (type?: string) => {
	if (type === 'submit') {
		getData();
	}
	drawerVisible.value = false;
	drawerFormData.value = {};
};

const handleSaveMenu = () => {
	menuFormComRef.value?.handleSubmit();
};

const handleOpenScanModal = () => {
	if (!selectedMenuId.value) {
		ElMessage.warning('请先选择一个菜单');
		return;
	}
	scanModalVisible.value = true;
	nextTick(() => {
		scanModalRef.value?.handleOpen();
	});
};

const handleScanSuccess = () => {
	if (selectedMenuId.value) {
		menuButtonRef.value?.handleRefreshTable({ id: selectedMenuId.value });
	}
};

/**
 * 部门的删除事件
 */
const handleDeleteMenu = (id: string, callback: Function) => {
	ElMessageBox.confirm(i18n.global.t('message.pages.menu.dialog.deleteMenuConfirm'), '删除确认', {
		confirmButtonText: i18n.global.t('message.pages.menu.buttons.confirm'),
		cancelButtonText: i18n.global.t('message.pages.menu.buttons.cancel'),
		type: 'warning',
	}).then(async () => {
		const res: APIResponseData = await DelObj(id);
		callback();
		if (res?.code === 2000) {
			successNotification(res.msg as string);
			getData();
		}
	});
};

onMounted(() => {
	getData();
});
</script>

<style lang="scss" scoped>
.menu-el-row {
	height: 100%;
	overflow: hidden;

	.el-col {
		height: 100%;
		padding: 10px 0;
		box-sizing: border-box;
	}
}

.menu-box {
	height: 100%;
	padding: 10px;
	background-color: var(--el-fill-color-blank);;
	box-sizing: border-box;
}

.menu-left-box {
	position: relative;
	border-radius: 0 8px 8px 0;
	margin-right: 10px;
}

.menu-right-box {
	border-radius: 8px 0 0 8px;
}

.menu-table {
	margin-left: 10px;
	padding-bottom: 10px;
	border-radius: 8px;
}

.menu-scan-btn {
	display: flex;
	justify-content: flex-end;
	margin-bottom: 8px;
}

.menu-btn-pane {
	display: flex;
	flex-direction: column;
	height: 100%;

	.menu-btn-fill {
		flex: 1;
		overflow: hidden;
	}
}
</style>
