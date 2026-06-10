<template>
	<fs-page>
		<div class="container">
			<header>
				<div class="buttons-group">
					<el-button type="primary" :icon="FolderAdd" @click="tabsDrawer = true">
						{{ $t('message.pages.config.buttons.addGroup') }}
					</el-button>
					<el-button type="warning" :icon="Edit" @click="contentDrawer = true">
						{{ $t('message.pages.config.buttons.addContent') }}
					</el-button>
					<el-button type="danger" :icon="Delete" @click="handleDeleteGroup">
						{{ $t('message.pages.config.buttons.deleteGroup') }}
					</el-button>
				</div>
				<div class="search-box">
					<el-input
						v-model="searchQuery"
						:placeholder="$t('message.pages.config.header.searchPlaceholder')"
						clearable
						prefix-icon="Search"
					/>
				</div>
			</header>

			<div class="filters">
				<el-button
					v-for="tab in editableTabs"
					:key="tab.key"
					:type="editableTabsValue === tab.key ? 'primary' : 'default'"
					@click="editableTabsValue = tab.key"
					class="filter-btn"
				>
					{{ tab.title_i18n || tab.title }}
				</el-button>
			</div>

			<div class="config-grid">
				<div
					v-for="item in filteredFormList"
					:key="item.id"
					class="config-card"
				>
					<div class="card-header">
						<div>
							<div class="card-title">{{ item.title_i18n || item.title }}</div>
							<div v-if="item.placeholder" class="card-subtitle">{{ item.placeholder }}</div>
						</div>
						<div class="card-tags">
							<el-tag size="small" :type="getTagType(item.form_item_type_label)">
								{{ getLabel(item.form_item_type_label) }}
							</el-tag>
							<template v-if="item.rule && item.rule.length > 0">
								<el-tag 
									v-for="(rule, index) in parseRules(item.rule)" 
									:key="index" 
									size="small" 
									type="warning"
									class="rule-tag"
								>
									{{ getRuleLabel(rule) }}
								</el-tag>
							</template>
						</div>
					</div>
					<div class="card-content">
						<!-- Key 信息 -->
						<div class="card-meta">
							<el-icon><Key /></el-icon>
							<span class="meta-key">{{ editableTabsValue }}.{{ item.key }}</span>
						</div>
						
						<!-- 值展示区 -->
						<div class="card-value">
							<!-- 开关类型 -->
							<span v-if="item.form_item_type_label === 'switch'" class="switch-value">
								<el-switch
									v-model="formData[item.key]"
									active-color="#13ce66"
									inactive-color="#ff4949"
									@change="handleConfigChange(item)"
								/>
							</span>
							<!-- 文本/长文本/数字/日期/时间/日期时间类型 - 编辑模式 -->
							<div v-else-if="['text', 'textarea', 'number', 'date', 'time', 'datetime'].includes(item.form_item_type_label) && editingItem?.id === item.id" class="edit-mode">
								<!-- 文本/长文本/数字类型使用输入框 -->
								<el-input
									v-if="['text', 'textarea', 'number'].includes(item.form_item_type_label)"
									v-model="editingValue"
									:type="item.form_item_type_label === 'textarea' ? 'textarea' : 'text'"
									:rows="item.form_item_type_label === 'textarea' ? 3 : 1"
									:placeholder="item.placeholder"
									@input="handleNumberInput(item)"
								/>
								<!-- 日期类型使用日期选择器 -->
								<el-date-picker
									v-else-if="item.form_item_type_label === 'date'"
									v-model="editingValue"
									type="date"
									:placeholder="item.placeholder || '请选择日期'"
									format="YYYY-MM-DD"
									value-format="YYYY-MM-DD"
								/>
								<!-- 时间类型使用时间选择器 -->
								<el-time-picker
									v-else-if="item.form_item_type_label === 'time'"
									v-model="editingValue"
									:placeholder="item.placeholder || '请选择时间'"
									format="HH:mm:ss"
									value-format="HH:mm:ss"
								/>
								<!-- 日期时间类型使用日期时间选择器 -->
								<el-date-picker
									v-else
									v-model="editingValue"
									type="datetime"
									:placeholder="item.placeholder || '请选择日期时间'"
									format="YYYY-MM-DD HH:mm:ss"
									value-format="YYYY-MM-DD HH:mm:ss"
								/>
							</div>
							<!-- 下拉/单选/多选类型 - 编辑模式 -->
							<div v-else-if="['select', 'radio', 'checkbox'].includes(item.form_item_type_label) && editingItem?.id === item.id" class="edit-mode">
								<!-- 下拉选择 -->
								<el-select
									v-if="item.form_item_type_label === 'select'"
									v-model="editingValue"
									:placeholder="item.placeholder || '请选择'"
									clearable
									style="width: 100%"
								>
									<el-option
										v-for="opt in dictOptions"
										:key="opt.value"
										:label="opt.label"
										:value="opt.value"
									/>
								</el-select>
								<!-- 单选框组 -->
								<el-radio-group v-else-if="item.form_item_type_label === 'radio'" v-model="editingValue">
									<el-radio
										v-for="opt in dictOptions"
										:key="opt.value"
										:value="opt.value"
									>
										{{ opt.label }}
									</el-radio>
								</el-radio-group>
								<!-- 多选框组 -->
								<el-checkbox-group v-else v-model="editingValue">
									<el-checkbox
										v-for="opt in dictOptions"
										:key="opt.value"
										:value="opt.value"
									>
										{{ opt.label }}
									</el-checkbox>
								</el-checkbox-group>
							</div>
							<!-- 图片/文件类型 - 编辑模式 -->
							<div v-else-if="['img', 'imgs', '文件附件'].includes(item.form_item_type_label) && editingItem?.id === item.id" class="edit-mode">
								<!-- 单张图片 -->
								<el-input
									v-if="item.form_item_type_label === 'img'"
									v-model="editingValue"
									:placeholder="item.placeholder || '请输入图片URL'"
								/>
								<!-- 多张图片 -->
								<div v-else-if="item.form_item_type_label === 'imgs'" class="image-list">
									<div v-for="(img, index) in editingValue" :key="index" class="image-item">
										<el-input v-model="editingValue[index]" placeholder="图片URL" />
										<el-button type="danger" size="small" @click="editingValue.splice(index, 1)">删除</el-button>
									</div>
									<el-button type="primary" size="small" @click="editingValue.push('')">添加图片</el-button>
								</div>
								<!-- 文件附件 -->
								<div v-else class="file-list">
									<div v-for="(file, index) in editingValue" :key="index" class="file-item">
										<el-input v-model="editingValue[index]" placeholder="文件URL" />
										<el-button type="danger" size="small" @click="editingValue.splice(index, 1)">删除</el-button>
									</div>
									<el-button type="primary" size="small" @click="editingValue.push('')">添加文件</el-button>
								</div>
							</div>
							<!-- 文本/长文本/数字/日期/时间/日期时间类型 - 查看模式 -->
							<span v-else-if="['text', 'textarea', 'number', 'date', 'time', 'datetime'].includes(item.form_item_type_label)" class="text-value">{{ displayValue(item) }}</span>
							<!-- 下拉/单选/多选类型 - 查看模式 -->
							<span v-else-if="['select', 'radio', 'checkbox'].includes(item.form_item_type_label)" class="text-value">{{ displayValue(item) }}</span>
							<!-- 图片/文件类型 - 查看模式 -->
							<span v-else-if="['img', 'imgs', '文件附件'].includes(item.form_item_type_label)" class="text-value">{{ displayValue(item) }}</span>
							<!-- 其他类型 -->
							<span v-else class="text-value">{{ displayValue(item) }}</span>
						</div>
					</div>
					<div class="card-footer">
						<div class="actions">
							<!-- 编辑模式下的确认和取消按钮 -->
							<template v-if="editingItem?.id === item.id">
								<el-button type="primary" size="small" @click="handleConfirmEdit(item)">
									确认
								</el-button>
								<el-button size="small" @click="handleCancelEdit">
									取消
								</el-button>
							</template>
							<!-- 正常模式下的编辑和删除按钮 - 开关类型不显示编辑按钮 -->
							<template v-else-if="item.form_item_type_label !== 'switch'">
								<el-button type="primary" link :icon="Edit" @click="handleEdit(item)">
									{{ $t('message.pages.config.buttons.edit') }}
								</el-button>
								<el-button type="danger" link :icon="Delete" @click="handleDelete(item)">
									{{ $t('message.pages.config.buttons.delete') }}
								</el-button>
							</template>
							<!-- 开关类型只显示删除按钮 -->
							<template v-else>
								<el-button type="danger" link :icon="Delete" @click="handleDelete(item)">
									{{ $t('message.pages.config.buttons.delete') }}
								</el-button>
							</template>
						</div>
					</div>
				</div>
			</div>

			<!-- 新增分组抽屉 -->
			<el-drawer
				v-model="tabsDrawer"
				:title="$t('message.pages.config.dialog.addGroup')"
				direction="rtl"
				size="30%"
			>
				<addTabs @success="handleTabsSuccess"></addTabs>
			</el-drawer>

			<!-- 新增内容抽屉 -->
			<el-drawer
				v-model="contentDrawer"
				:title="$t('message.pages.config.dialog.addContent')"
				direction="rtl"
				size="30%"
			>
				<addContent @success="handleContentSuccess"></addContent>
			</el-drawer>
		</div>
	</fs-page>
</template>

<script lang="ts" setup name="config">
import { useI18n } from 'vue-i18n';
import { Edit, FolderAdd, Delete, Key } from '@element-plus/icons-vue';
import * as api from './api';
import addTabs from './components/addTabs.vue';
import addContent from './components/addContent.vue';
import { ref, onMounted, watch, computed } from 'vue';
import { storeToRefs } from 'pinia';
import pinia from '/@/stores/index';
import { useThemeConfig } from '/@/stores/themeConfig';
import { ElMessage, ElMessageBox } from 'element-plus';

let tabsDrawer = ref(false);
let contentDrawer = ref(false);
let editableTabsValue = ref('base');
let editableTabs: any = ref([]);
let formList = ref<any[]>([]);
let formData = ref<any>({});
let searchQuery = ref('');
let editingItem = ref<any>(null);
let editingValue = ref<any>('');
let dictOptions = ref<any[]>([]); // 字典选项

const { t } = useI18n();
const { themeConfig } = storeToRefs(useThemeConfig(pinia));

// 获取标签类型
const getTagType = (type: string) => {
	const typeMap: any = {
		'switch': 'success',
		'select': 'warning',
		'radio': 'primary',
		'checkbox': 'info',
		'text': 'info',
		'textarea': 'info',
		'number': 'danger',
		'img': 'warning',
		'imgs': 'warning',
	};
	return typeMap[type] || 'info';  // 默认使用 info,避免空字符串
};

// 获取类型标签
const getLabel = (type: string) => {
	const labelMap: any = {
		'text': '文本',
		'textarea': '长文本',
		'number': '数字',
		'date': '日期',
		'time': '时间',
		'datetime': '日期时间',
		'select': '下拉',
		'checkbox': '多选',
		'radio': '单选',
		'switch': '开关',
		'img': '图片',
		'imgs': '多图片',
	};
	return labelMap[type] || type;
};

// 解析校验规则
const parseRules = (rule: any) => {
	if (!rule) return [];
	try {
		// rule 可能是字符串或数组
		if (typeof rule === 'string') {
			return [JSON.parse(rule)];
		}
		if (Array.isArray(rule)) {
			return rule;
		}
		return [rule];
	} catch (e) {
		return [];
	}
};

// 获取校验规则标签
const getRuleLabel = (rule: any) => {
	if (!rule) return '';
	if (rule.required) return '必填';
	if (rule.type === 'email') return '邮箱';
	if (rule.type === 'url') return 'URL';
	return '校验';
};

// 显示值
const displayValue = (item: any) => {
	const value = formData.value[item.key];
	if (value === null || value === undefined) return '-';
	if (Array.isArray(value)) return value.join(', ');
	return String(value);
};

// 过滤后的配置列表
const filteredFormList = computed(() => {
	if (!searchQuery.value) return formList.value;
	const query = searchQuery.value.toLowerCase();
	return formList.value.filter(item => 
		(item.title_i18n || item.title).toLowerCase().includes(query) ||
		item.key.toLowerCase().includes(query)
	);
});

// 获取配置列表
const getFormList = () => {
	api.GetDetail(editableTabsValue.value, themeConfig.value.globalI18n).then((res: any) => {
		formList.value = res.data || [];
		formData.value = {};
		formList.value.forEach(item => {
			formData.value[item.key] = item.value;
		});
	});
};

// 获取Tab列表
const getTabs = () => {
	api
		.GetList({
			limit: 999,
			parent__isnull: true,
			language: themeConfig.value.globalI18n,
		})
		.then((res: any) => {
			let data = res.data;
			editableTabs.value = data;
			if (data.length > 0 && !editableTabsValue.value) {
				editableTabsValue.value = data[0].key;
			}
			getFormList();
		});
};

// 处理配置变更
const handleConfigChange = async (item: any) => {
	try {
		await api.UpdateObj({
			id: item.id,
			value: formData.value[item.key]
		});
		ElMessage.success(t('message.pages.config.messages.updateSuccess'));
	} catch (error) {
		// 重新获取数据以恢复原值
		getFormList();
		ElMessage.error(t('message.pages.config.messages.updateFailed'));
	}
};

// 编辑配置
const handleEdit = (item: any) => {
	// 对文本、长文本、数字、日期、时间、日期时间类型进行内联编辑
	const inlineEditTypes = ['text', 'textarea', 'number', 'date', 'time', 'datetime'];
	if (inlineEditTypes.includes(item.form_item_type_label)) {
		editingItem.value = item;
		editingValue.value = formData.value[item.key] !== null && formData.value[item.key] !== undefined ? String(formData.value[item.key]) : '';
	} 
	// 下拉、单选、多选类型也需要内联编辑
	else if (['select', 'radio', 'checkbox'].includes(item.form_item_type_label)) {
		editingItem.value = item;
		// 这些类型的值可能是数组或字符串
		if (Array.isArray(formData.value[item.key])) {
			editingValue.value = formData.value[item.key];
		} else {
			editingValue.value = formData.value[item.key] !== null && formData.value[item.key] !== undefined ? String(formData.value[item.key]) : '';
		}
		// 加载字典选项
		loadDictOptions(item);
	}
	else if (['img', 'imgs', '文件附件'].includes(item.form_item_type_label)) {
		editingItem.value = item;
		// 图片/文件类型的值可能是字符串或数组
		if (item.form_item_type_label === 'imgs' || item.form_item_type_label === '文件附件') {
			editingValue.value = formData.value[item.key] !== null && formData.value[item.key] !== undefined ? formData.value[item.key] : [];
			if (typeof editingValue.value === 'string' && editingValue.value) {
				try {
					editingValue.value = JSON.parse(editingValue.value);
				} catch (e) {
					editingValue.value = [editingValue.value];
				}
			}
			if (!Array.isArray(editingValue.value)) {
				editingValue.value = [];
			}
		} else {
			editingValue.value = formData.value[item.key] !== null && formData.value[item.key] !== undefined ? String(formData.value[item.key]) : '';
		}
	}
	else {
		// 其他类型打开抽屉编辑
		contentDrawer.value = true;
		// TODO: 传递编辑参数
	}
};

// 加载字典选项
const loadDictOptions = async (item: any) => {
	if (!item.setting) {
		dictOptions.value = [];
		return;
	}
	try {
		// setting 可能是字典的 key
		const res: any = await api.GetList({
			limit: 999,
			parent_key: item.setting,
		});
		dictOptions.value = res.data || [];
	} catch (error) {
		console.error('加载字典选项失败:', error);
		dictOptions.value = [];
	}
};

// 确认编辑
const handleConfirmEdit = async (item: any) => {
	try {
		// 数字类型需要转换为数字
		let valueToSave: any = editingValue.value;
		if (item.form_item_type_label === 'number') {
			if (editingValue.value === '' || editingValue.value === null || editingValue.value === undefined) {
				valueToSave = null;
			} else {
				const numValue = Number(editingValue.value);
				if (isNaN(numValue)) {
					ElMessage.error('请输入有效的数字');
					return;
				}
				valueToSave = numValue;
			}
		}
		// 图片/文件数组类型需要转换为JSON字符串
		else if (item.form_item_type_label === 'imgs' || item.form_item_type_label === '文件附件') {
			if (Array.isArray(editingValue.value)) {
				valueToSave = JSON.stringify(editingValue.value);
			} else {
				valueToSave = editingValue.value;
			}
		}
		
		await api.UpdateObj({
			id: item.id,
			value: valueToSave
		});
		formData.value[item.key] = valueToSave;
		ElMessage.success(t('message.pages.config.messages.updateSuccess'));
		editingItem.value = null;
		editingValue.value = '';
		dictOptions.value = [];
	} catch (error) {
		ElMessage.error(t('message.pages.config.messages.updateFailed'));
	}
};

// 取消编辑
const handleCancelEdit = () => {
	editingItem.value = null;
	editingValue.value = '';
	dictOptions.value = [];
};

// 数字输入处理
const handleNumberInput = (item: any) => {
	if (item.form_item_type_label === 'number') {
		let value = editingValue.value;
		// 只允许输入数字、小数点、负号
		value = value.replace(/[^0-9.-]/g, '');
		// 确保只有一个小数点
		const parts = value.split('.');
		if (parts.length > 2) {
			value = parts[0] + '.' + parts.slice(1).join('');
		}
		// 确保负号只在开头
		const hasMinus = value.startsWith('-');
		value = value.replace(/-/g, '');
		if (hasMinus) {
			value = '-' + value;
		}
		// 确保只有一个负号
		if (value.indexOf('-') !== value.lastIndexOf('-')) {
			value = value.replace(/-/g, '');
			if (value.charAt(0) === '-') {
				value = '-' + value.substring(1);
			}
		}
		editingValue.value = value;
	}
};

// 删除配置
const handleDelete = (item: any) => {
	ElMessageBox.confirm(
		t('message.pages.config.messages.deleteConfirm'),
		t('message.pages.config.buttons.delete'),
		{
			confirmButtonText: t('message.pages.config.buttons.confirm'),
			cancelButtonText: t('message.pages.config.buttons.cancel'),
			type: 'warning',
		}
	).then(async () => {
		try {
			await api.DelObj(item.id);
			ElMessage.success(t('message.pages.config.messages.deleteSuccess'));
			getFormList();
		} catch (error) {
			ElMessage.error(t('message.pages.config.messages.deleteFailed'));
		}
	}).catch(() => {});
};

// Tab添加成功
const handleTabsSuccess = () => {
	tabsDrawer.value = false;
	getTabs();
};

// 内容添加成功
const handleContentSuccess = () => {
	contentDrawer.value = false;
	getFormList();
};

// 删除当前分组
const handleDeleteGroup = () => {
	ElMessageBox.confirm(
		t('message.pages.config.messages.deleteGroupConfirm'),
		t('message.pages.config.buttons.deleteGroup'),
		{
			confirmButtonText: t('message.pages.config.buttons.confirm'),
			cancelButtonText: t('message.pages.config.buttons.cancel'),
			type: 'warning',
		}
	).then(async () => {
		try {
			// 查找当前分组的ID
			const currentGroup = editableTabs.value.find((tab: any) => tab.key === editableTabsValue.value);
			if (!currentGroup) {
				ElMessage.error(t('message.pages.config.messages.groupNotFound'));
				return;
			}
			
			await api.DelObj(currentGroup.id);
			ElMessage.success(t('message.pages.config.messages.deleteGroupSuccess'));
			
			// 重新获取分组列表
			await getTabs();
			
			// 如果分组列表不为空,切换到第一个分组
			if (editableTabs.value.length > 0) {
				editableTabsValue.value = editableTabs.value[0].key;
			}
		} catch (error) {
			ElMessage.error(t('message.pages.config.messages.deleteGroupFailed'));
		}
	}).catch(() => {});
};

onMounted(() => {
	getTabs();
});

// 语言切换时刷新
watch(
	() => themeConfig.value.globalI18n,
	() => {
		getTabs();
	}
);

// Tab切换时刷新配置列表
watch(editableTabsValue, () => {
	getFormList();
});
</script>

<style scoped>
.container {
	max-width: 100%;
	margin: 0 auto;
	padding: 20px;
}

header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 30px;
}

.buttons-group {
	display: flex;
	align-items: center;
	gap: 12px;
}

.search-box {
	width: 300px;
}

.filters {
	display: flex;
	gap: 12px;
	margin-bottom: 25px;
	flex-wrap: wrap;
}

.filter-btn {
	padding: 8px 20px;
	border-radius: 20px;
	transition: all 0.3s ease;
}

.config-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
	gap: 25px;
}

.config-card {
	background: var(--el-bg-color);
	border-radius: 12px;
	overflow: hidden;
	box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
	transition: transform 0.3s ease, box-shadow 0.3s ease;
	border: 1px solid var(--el-border-color-lighter);
	display: flex;
	flex-direction: column;
}

.config-card:hover {
	transform: translateY(-5px);
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.card-header {
	padding: 20px;
	border-bottom: 1px solid var(--el-border-color-lighter);
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.card-tags {
	display: flex;
	align-items: center;
	gap: 8px;
	flex-wrap: wrap;
	justify-content: flex-end;
}

.rule-tag {
	margin-left: 4px;
}

.card-title {
	font-size: 18px;
	font-weight: 600;
	color: var(--el-text-color-primary);
}

.card-subtitle {
	font-size: 13px;
	color: var(--el-text-color-secondary);
	margin-top: 6px;
}

.card-content {
	padding: 20px;
	padding-bottom: 0;
	flex: 1;
}

.card-meta {
	display: flex;
	align-items: center;
	color: var(--el-text-color-secondary);
	font-size: 14px;
	margin-bottom: 15px;
	gap: 6px;
}

.meta-key {
	font-family: 'Courier New', monospace;
	background: var(--el-fill-color);
	padding: 2px 8px;
	border-radius: 4px;
	font-size: 13px;
}

.card-value {
	color: var(--el-text-color-regular);
	line-height: 1.6;
	min-height: 40px;
	display: flex;
	align-items: center;
}

.switch-value {
	display: flex;
	align-items: center;
}

.text-value {
	word-break: break-all;
}

/* 编辑模式样式 */
.edit-mode {
	width: 100%;
}

.edit-mode :deep(.el-input__wrapper) {
	box-shadow: 0 0 0 1px var(--el-color-primary) inset;
}

/* 图片和文件列表样式 */
.image-list,
.file-list {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.image-item,
.file-item {
	display: flex;
	gap: 10px;
	align-items: center;
}

.image-item .el-input,
.file-item .el-input {
	flex: 1;
}

/* 额外信息展示区 */
.card-extra-info {
	margin-top: 12px;
}

.info-row {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 8px;
	font-size: 13px;
}

.info-row:last-child {
	margin-bottom: 0;
}

.info-label {
	color: var(--el-text-color-secondary);
	font-weight: 500;
	min-width: 40px;
}

.info-value {
	color: var(--el-text-color-regular);
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.rule-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 6px;
	flex: 1;
}

.card-footer {
	padding: 15px 20px;
	background: var(--el-fill-color-lighter);
	display: flex;
	justify-content: flex-end;
	align-items: center;
}

.actions {
	display: flex;
	gap: 12px;
}

@media (max-width: 768px) {
	.config-grid {
		grid-template-columns: 1fr;
	}

	header {
		flex-direction: column;
		align-items: flex-start;
	}

	.search-box {
		width: 100%;
	}

	.filters {
		width: 100%;
	}
}
</style>
