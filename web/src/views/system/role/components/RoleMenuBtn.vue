<template>
	<el-alert v-if="departmentError" :title="departmentError" type="error" :closable="false">
    <el-button @click="loadDepartments(dialogVisible ? selectBtn.id : 0)">{{ $t('message.design.retry') }}</el-button>
  </el-alert>
  <div class="pccm-item" v-if="state.buttons.value.length > 0">
		<div class="menu-form-alert">
			<div style="display:flex;  align-items: center; white-space: nowrap; margin-bottom: 10px;">
				<span>{{ $t('message.pages.role.dialog.defaultInterfacePermission') }}</span>
				<el-select
					v-model="default_selectBtn.data_range"
					@change="defaulthandlePermissionRangeChange"
					:placeholder="$t('message.pages.role.dialog.selectDataPermission')"
					style="margin-left: 5px; width: 250px; min-width: 250px;"
				>
					<el-option v-for="item in dataPermissionRange" :key="item.value" :label="$t('message.pages.role.dataPermission.' + item.key)" :value="item.value" />
				</el-select>
				<el-tree-select
					v-show="default_selectBtn.data_range === 4"
					node-key="id"
					v-model="default_selectBtn.dept"
					:props="defaultTreeProps"
					:data="deptData"
					@change="customhandlePermissionRangeChange(default_selectBtn.dept)"
					:placeholder="$t('message.pages.role.dialog.customDeptPlaceholder')"
					multiple
					check-strictly
					:render-after-expand="false"
					show-checkbox
					class="dialog-tree"
					style="margin-left: 15px; width: AUTO; min-width: 250px; margin-top: 0;"
				/>
			</div>
			<div class="alert-toolbar">
				<span>{{ $t('message.pages.role.dialog.configureOperationPermission') }}</span>
				<el-button size="small" link type="primary" @click="expandAll">{{ $t('message.pages.role.buttons.expandAll') }}</el-button>
				<el-button size="small" link type="primary" @click="collapseAll">{{ $t('message.pages.role.buttons.collapseAll') }}</el-button>
			</div>
		</div>

		<!-- 按 Model > CRUD 语义分组的折叠面板 -->
		<el-collapse v-model="expandedModels" class="btn-group-collapse">
			<el-collapse-item
				v-for="modelGroup in groupedButtons"
				:key="modelGroup.model"
				:name="modelGroup.model"
			>
				<template #title>
					<div class="model-group-header">
						<el-checkbox
							:model-value="isModelAllSelected(modelGroup)"
							:indeterminate="isModelIndeterminate(modelGroup)" :disabled="state.writing.value || state.loading.value || !state.allowed('buttons')"
							@change="(val: boolean) => toggleModel(modelGroup, val)"
							@click.stop
						/>
						<el-icon style="margin: 0 6px;"><Folder /></el-icon>
						<span class="model-label">{{ modelGroup.model }}</span>
						<span class="group-count">{{ getTotalCount(modelGroup) }} {{ $t('message.pages.menu.scan.actions') }}</span>
					</div>
				</template>

				<!-- CRUD 语义子分组 -->
				<div class="intent-groups">
					<div
						v-for="intent in modelGroup.intents"
						:key="intent.type"
						class="intent-group"
					>
						<div class="intent-header">
							<el-checkbox
								:model-value="isIntentAllSelected(intent)"
								:indeterminate="isIntentIndeterminate(intent)" :disabled="state.writing.value || state.loading.value || !state.allowed('buttons')"
								@change="(val: boolean) => toggleIntent(modelGroup, intent, val)"
								@click.stop
							/>
							<el-tag :type="intentTagType(intent.type)" size="small" style="margin-left: 6px;">{{ intent.label }}</el-tag>
						</div>
						<div class="btn-checkboxes">
							<el-checkbox
								v-for="btn in intent.buttons"
								:key="btn.id"
								v-model="btn.isCheck" :disabled="state.writing.value || state.loading.value || !state.allowed('buttons')"
								@change="(checked: boolean) => handleCheckChange(btn, checked)"
								class="btn-checkbox-item"
							>
								<div class="btn-item">
									<span>{{ buttonName(btn) }}</span>
									<el-button v-show="btn.isCheck" link :aria-label="$t('message.pages.role.dialog.dataPermissionConfig') + ' ' + btn.name" :disabled="state.writing.value || state.loading.value || !state.allowed('range')" @click.stop.prevent="handleSettingClick(btn)">
										<el-icon><Setting /></el-icon>
									</el-button>
								</div>
							</el-checkbox>
						</div>
					</div>
				</div>
			</el-collapse-item>
		</el-collapse>
	</div>

	<el-dialog v-model="dialogVisible" :title="$t('message.pages.role.dialog.dataPermissionConfig')" width="400px" :close-on-click-modal="false" :before-close="handleDialogClose">
		<el-alert v-if="state.error.value" :title="state.error.value" type="error" :closable="false" />
		<div class="pc-dialog">
			<el-select v-model="selectBtn.data_range" :disabled="state.writing.value" @change="handlePermissionRangeChange" :placeholder="$t('message.pages.role.dialog.selectDataPermission')">
				<el-option v-for="item in dataPermissionRange" :key="item.value" :label="$t('message.pages.role.dataPermission.' + item.key)" :value="item.value" />
			</el-select>
			<el-tree-select
				v-show="selectBtn.data_range === 4"
				node-key="id"
				v-model="selectBtn.dept"
				:disabled="state.writing.value"
				:props="defaultTreeProps"
				:data="deptData"
				multiple
				check-strictly
				:render-after-expand="false"
				show-checkbox
				class="dialog-tree"
			/>
		</div>
		<template #footer>
			<div>
				<el-button type="primary" :loading="state.writing.value" :disabled="state.loading.value || !state.allowed('range')" @click="handleDialogConfirm"> {{ $t('message.pages.role.buttons.confirm') }}</el-button>
				<el-button :disabled="state.writing.value" @click="handleDialogClose"> {{ $t('message.pages.role.buttons.cancel') }}</el-button>
			</div>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { computed, inject, ref, watch, onBeforeUnmount } from 'vue';


import { RoleMenuBtnType } from '../types';
import { getRoleToDeptAll } from './api';
import { Folder, Setting } from '@element-plus/icons-vue';
import XEUtils from 'xe-utils';

import { roleAuthorizationKey } from '/@/features/roles/authorization';
import { i18n } from '/@/i18n/index';

/** CRUD 语义类型 */
type IntentType = 'read' | 'write' | 'delete' | 'other';

/** 按 intent 分组的按钮列表 */
interface IntentGroup {
	type: IntentType;
	label: string;
	buttons: RoleMenuBtnType[];
}

/** 按 model 分组的按钮列表 */
interface ModelGroup {
	model: string;
	intents: IntentGroup[];
}

const state = inject(roleAuthorizationKey)!;


const dialogVisible = ref(false);

const default_selectBtn = ref<RoleMenuBtnType>({
	id: 0,
	menu_btn_pre_id: 0,
	isCheck: false,
	name: '',
	data_range: 0,
	dept: [],
});

const selectBtn = ref<RoleMenuBtnType>({
	id: 0,
	menu_btn_pre_id: 0,
	isCheck: false,
	name: '',
	data_range: 0,
	dept: [],
});

const t = (key: string) => i18n.global.t(key);

const buttonName = (btn: RoleMenuBtnType) => i18n.global.locale.value === 'en' ? btn.name_en || btn.name
  : i18n.global.locale.value === 'zh-tw' ? btn.name_zh_tw || btn.name : btn.name;
const dataPermissionRange = ref([
	{ key: 'ownDataOnly', label: t('message.pages.role.dataPermission.ownDataOnly'), value: 0 },
	{ key: 'deptAndBelow', label: t('message.pages.role.dataPermission.deptAndBelow'), value: 1 },
	{ key: 'deptOnly', label: t('message.pages.role.dataPermission.deptOnly'), value: 2 },
	{ key: 'allData', label: t('message.pages.role.dataPermission.allData'), value: 3 },
	{ key: 'customData', label: t('message.pages.role.dataPermission.customData'), value: 4 },
]);

const defaultTreeProps = {
	children: 'children',
	label: 'name',
	value: 'id',
};

/** CRUD 意图映射配置 */
const INTENT_CONFIG: Record<IntentType, { keywords: string[]; labelKey: string; order: number }> = {
	read: {
		keywords: ['list', 'retrieve', 'export', 'search', 'query', 'detail', 'info', 'get'],
		labelKey: 'message.pages.role.buttons.intentRead',
		order: 1,
	},
	write: {
		keywords: ['create', 'update', 'patch', 'import', 'copy', 'add', 'edit', 'save', 'submit'],
		labelKey: 'message.pages.role.buttons.intentWrite',
		order: 2,
	},
	delete: {
		keywords: ['delete', 'remove', 'destroy'],
		labelKey: 'message.pages.role.buttons.intentDelete',
		order: 3,
	},
	other: {
		keywords: [],
		labelKey: 'message.pages.role.buttons.intentOther',
		order: 4,
	},
};

/** 根据 action 名称判断 CRUD 意图 */
const getIntentType = (action: string): IntentType => {
	const lower = action.toLowerCase();
	for (const [type, config] of Object.entries(INTENT_CONFIG)) {
		if (config.keywords.some(kw => lower.includes(kw))) {
			return type as IntentType;
		}
	}
	return 'other';
};

/** CRUD 意图标签颜色 */
const intentTagType = (type: IntentType): string => {
	const map: Record<IntentType, string> = {
		read: 'success',
		write: 'primary',
		delete: 'danger',
		other: 'info',
	};
	return map[type];
};

const expandedModels = ref<string[]>([]);

/** 按 Model > CRUD 意图分组 */
const groupedButtons = computed(() => {
	// value 格式: app:model:action
	// 示例: system:Users:List, system:Menu:Create
	const modelMap: Map<string, Map<IntentType, RoleMenuBtnType[]>> = new Map();

	for (const btn of state.buttons.value) {
		const value = (btn as any).value || '';
		const parts = value.split(':');
		const model = parts[1] || parts[0] || 'other';
		const action = parts[2] || '';

		if (!modelMap.has(model)) {
			modelMap.set(model, new Map());
		}
		const intentMap = modelMap.get(model)!;

		const intentType = getIntentType(action);
		if (!intentMap.has(intentType)) {
			intentMap.set(intentType, []);
		}
		intentMap.get(intentType)!.push(btn);
	}

	const groups = [] as Array<{ model: string; intents: IntentGroup[] }>;
	for (const [model, intentMap] of modelMap) {
		// 按固定顺序排列 CRUD 意图
		const intentTypes = (Object.keys(INTENT_CONFIG) as IntentType[])
			.filter(type => intentMap.has(type))
			.sort((a, b) => INTENT_CONFIG[a].order - INTENT_CONFIG[b].order);
		const intents = intentTypes.map(type => ({
			type,
			label: i18n.global.t(INTENT_CONFIG[type].labelKey),
			buttons: intentMap.get(type)!,
		}));
		groups.push({ model, intents });
	}

	// 按 model 名称排序
	groups.sort((a, b) => a.model.localeCompare(b.model));
	return groups;
});

/** 展开/折叠全部 */
const expandAll = () => {
	expandedModels.value = groupedButtons.value.map(g => g.model);
};
const collapseAll = () => {
	expandedModels.value = [];
};

/** Model 全选/半选 */
const isModelAllSelected = (modelGroup: ModelGroup) => {
	const allBtns = modelGroup.intents.flatMap(i => i.buttons);
	return allBtns.length > 0 && allBtns.every(btn => btn.isCheck);
};

const isModelIndeterminate = (modelGroup: ModelGroup) => {
	const allBtns = modelGroup.intents.flatMap(i => i.buttons);
	const selected = allBtns.filter(btn => btn.isCheck).length;
	return selected > 0 && selected < allBtns.length;
};

const toggleModel = (modelGroup: ModelGroup, checked: boolean) => {
  void state.saveButtons(modelGroup.intents.flatMap(intent => intent.buttons.map(btn => btn.id)), checked,
    default_selectBtn.value.data_range ?? 0, default_selectBtn.value.dept);
};

/** CRUD 意图全选/半选 */
const isIntentAllSelected = (intent: IntentGroup) => {
	return intent.buttons.length > 0 && intent.buttons.every(btn => btn.isCheck);
};

const isIntentIndeterminate = (intent: IntentGroup) => {
	const selected = intent.buttons.filter(btn => btn.isCheck).length;
	return selected > 0 && selected < intent.buttons.length;
};

const toggleIntent = (_modelGroup: ModelGroup, intent: IntentGroup, checked: boolean) => {
  void state.saveButtons(intent.buttons.map(btn => btn.id), checked,
    default_selectBtn.value.data_range ?? 0, default_selectBtn.value.dept);
};

/** 获取 Model 分组的总按钮数 */
const getTotalCount = (modelGroup: ModelGroup) => {
	return modelGroup.intents.reduce((sum, i) => sum + i.buttons.length, 0);
};

const handleCheckChange = (btn: RoleMenuBtnType, checked: boolean) => {
  void state.saveButtons([btn.id], checked, default_selectBtn.value.data_range ?? 0, default_selectBtn.value.dept);
};

const handleDialogConfirm = async () => {
  if (await state.saveRange(selectBtn.value)) dialogVisible.value = false;
};
const handleDialogClose = () => { if (!state.writing.value) dialogVisible.value = false; };
const handleSettingClick = async (btn: RoleMenuBtnType) => {
  if (state.writing.value || state.loading.value || !state.allowed('range')) return;
  selectBtn.value = { ...btn, dept: [...(btn.dept || [])] };
  dialogVisible.value = true;
  void loadDepartments(btn.id);
};
watch(() => state.selected.value?.id, () => { dialogVisible.value = false; });
watch(() => state.buttons.value, () => { expandedModels.value = groupedButtons.value.map(group => group.model); });

const defaulthandlePermissionRangeChange = async (val: number) => {
	default_selectBtn.value.data_range = val;
	if (val !== 4) default_selectBtn.value.dept = [];
};

const customhandlePermissionRangeChange = async (dept: Array<number>) => {
	default_selectBtn.value.dept = dept;

};

const handlePermissionRangeChange = async (val: number) => {
	if (val < 4) {
		selectBtn.value.dept = [];
	}
};

const deptData = ref<number[]>([]);

let alive = true, departmentRequest = 0;
const departmentError = ref('');
onBeforeUnmount(() => { alive = false; departmentRequest++; });
async function loadDepartments(buttonId: string | number = 0) {
  const request = ++departmentRequest, roleId = state.role.value;
  if (roleId === undefined) return;
  departmentError.value = '';
  try {
    const res = await getRoleToDeptAll({ role: roleId, menu_button: buttonId });
    if (alive && request === departmentRequest && roleId === state.role.value)
      deptData.value = XEUtils.toArrayTree(res.data, { parentKey: 'parent', strict: false });
  } catch (error) {
    if (alive && request === departmentRequest) departmentError.value = error instanceof Error ? error.message : t('message.design.roleFailed');
  }
}
watch(() => state.role.value, () => {
  dialogVisible.value = false; deptData.value = [];
  default_selectBtn.value.data_range = 0; default_selectBtn.value.dept = [];
  void loadDepartments();
}, { immediate: true });
</script>

<style lang="scss" scoped>
.pccm-item {
	margin-bottom: 10px;
	.menu-form-alert {
		color: #fff;
		line-height: 24px;
		padding: 8px 16px;
		margin-bottom: 20px;
		border-radius: 4px;
		background-color: var(--el-color-primary);
	}
	.alert-toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		span {
			color: #fff;
		}
	}
}

.btn-group-collapse {
	border: 1px solid var(--el-border-color);
	border-radius: 4px;
	overflow: hidden;
}

.model-group-header {
	display: flex;
	align-items: center;
	font-size: 14px;
	font-weight: 500;
	width: 100%;
	padding-right: 12px;

	.model-label {
		margin-left: 4px;
		font-weight: 600;
	}

	.group-count {
		margin-left: auto;
		font-size: 12px;
		color: #909399;
		font-weight: normal;
	}
}

.intent-groups {
	padding: 8px 0 8px 8px;
}

.intent-group {
	margin-bottom: 12px;
	&:last-child {
		margin-bottom: 0;
	}

	.intent-header {
		display: flex;
		align-items: center;
		margin-bottom: 6px;
		padding-bottom: 4px;
		border-bottom: 1px solid var(--el-border-color-lighter);
	}
}

.btn-checkboxes {
	display: flex;
	flex-wrap: wrap;
	gap: 4px 16px;
	padding-left: 20px;
}

.btn-checkbox-item {
	min-width: 120px;
}

.btn-item {
	display: flex;
	align-items: center;
	gap: 4px;
	.el-icon {
		color: var(--el-color-primary);
	}
}

.dialog-tree {
	width: 100%;
	margin-top: 20px;
}
</style>
