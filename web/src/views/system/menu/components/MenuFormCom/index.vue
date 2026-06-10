<template>
	<div class="menu-form-com">
		<div class="menu-form-alert">
			{{ $t('message.pages.menu.tree.menuAlert') }}
		</div>
		<el-form ref="formRef" :rules="rules" :model="menuFormData" label-width="80px" label-position="right">
			<el-form-item :label="$t('message.pages.menu.form.menuName')" prop="name">
				<el-row :gutter="5" class="menu-name-row">
					<el-col :span="8">
						<el-input 
							v-model="menuFormData.name" 
							:placeholder="$t('message.pages.menu.form.menuNameZhCn')" 
							clearable 
						/>
					</el-col>
					<el-col :span="8">
						<el-input 
							v-model="menuFormData.name_en" 
							:placeholder="$t('message.pages.menu.form.menuNameEn')" 
							clearable 
						/>
					</el-col>
					<el-col :span="8">
						<el-input 
							v-model="menuFormData.name_zh_tw" 
							:placeholder="$t('message.pages.menu.form.menuNameZhTw')" 
							clearable 
						/>
					</el-col>
				</el-row>
			</el-form-item>
			<el-form-item :label="$t('message.pages.menu.form.parentMenu')" prop="parent">
				<el-tree-select v-model="menuFormData.parent" :props="defaultTreeProps" :data="deptDefaultList"
					:cache-data="props.cacheData" lazy check-strictly clearable :load="handleTreeLoad"
					:placeholder="$t('message.pages.menu.form.parentMenuPlaceholder')" style="width: 100%" />
			</el-form-item>

			<el-form-item :label="$t('message.pages.menu.form.path')" prop="web_path">
				<el-input v-model="menuFormData.web_path" :placeholder="$t('message.pages.menu.form.pathPlaceholder')" />
			</el-form-item>

			<el-form-item :label="$t('message.pages.menu.form.icon')" prop="icon">
				<IconSelector clearable v-model="menuFormData.icon" />
			</el-form-item>

			<el-row>
				<el-col :span="12">
					<el-form-item required :label="$t('message.pages.menu.form.status')">
						<el-switch v-model="menuFormData.status" width="60" inline-prompt :active-text="$t('message.pages.menu.form.enabled')"
							:inactive-text="$t('message.pages.menu.form.disabled')" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item v-if="menuFormData.status" required :label="$t('message.pages.menu.form.visible')">
						<el-switch v-model="menuFormData.visible" width="60" inline-prompt :active-text="$t('message.pages.menu.form.show')"
							:inactive-text="$t('message.pages.menu.form.hide')" />
					</el-form-item>
				</el-col>
			</el-row>

			<el-row>
				<el-col :span="12">
					<el-form-item required :label="$t('message.pages.menu.form.isCatalog')">
						<el-switch v-model="menuFormData.is_catalog" width="60" inline-prompt :active-text="$t('message.pages.menu.form.yes')"
							:inactive-text="$t('message.pages.menu.form.no')" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item v-if="!menuFormData.is_catalog" required :label="$t('message.pages.menu.form.isLink')">
						<el-switch v-model="menuFormData.is_link" width="60" inline-prompt :active-text="$t('message.pages.menu.form.yes')"
							:inactive-text="$t('message.pages.menu.form.no')" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item required v-if="!menuFormData.is_catalog" :label="$t('message.pages.menu.form.isAffix')">
						<el-switch v-model="menuFormData.is_affix" width="60" inline-prompt :active-text="$t('message.pages.menu.form.yes')"
							:inactive-text="$t('message.pages.menu.form.no')" />
					</el-form-item>
				</el-col>
				<el-col :span="12">
					<el-form-item v-if="!menuFormData.is_catalog && menuFormData.is_link" required :label="$t('message.pages.menu.form.isIframe')">
						<el-switch v-model="menuFormData.is_iframe" width="60" inline-prompt :active-text="$t('message.pages.menu.form.yes')"
							:inactive-text="$t('message.pages.menu.form.no')" />
					</el-form-item>
				</el-col>
			</el-row>

			<el-form-item :label="$t('message.pages.menu.form.remark')">
				<el-input v-model="menuFormData.description" maxlength="200" show-word-limit type="textarea"
					:placeholder="$t('message.pages.menu.form.remarkPlaceholder')" />
			</el-form-item>

			<el-divider></el-divider>

			<div style="min-height: 184px">
				<el-form-item v-if="!menuFormData.is_catalog && !menuFormData.is_link" :label="$t('message.pages.menu.form.component')" prop="component">
					<el-autocomplete class="w-full" v-model="menuFormData.component" :fetch-suggestions="querySearch"
						:trigger-on-focus="false" clearable :debounce="100" :placeholder="$t('message.pages.menu.form.componentPlaceholder')" />
				</el-form-item>

				<el-form-item v-if="!menuFormData.is_catalog && !menuFormData.is_link" :label="$t('message.pages.menu.form.componentName')"
					prop="component_name">
					<el-input v-model="menuFormData.component_name" :placeholder="$t('message.pages.menu.form.componentNamePlaceholder')" />
				</el-form-item>

				<el-form-item v-if="!menuFormData.is_catalog && menuFormData.is_link" :label="$t('message.pages.menu.form.linkUrl')" prop="link_url">
					<el-input v-model="menuFormData.link_url" :placeholder="$t('message.pages.menu.form.linkUrlPlaceholder')" />
          <el-alert :title="$t('message.pages.menu.form.tokenTip')" type="info" />
				</el-form-item>

				<el-form-item v-if="!menuFormData.is_catalog" :label="$t('message.pages.menu.form.cache')">
					<el-switch v-model="menuFormData.cache" width="60" inline-prompt :active-text="$t('message.pages.menu.form.enabled')"
						:inactive-text="$t('message.pages.menu.form.disabled')" />
				</el-form-item>
			</div>

			<el-divider></el-divider>
		</el-form>
	</div>
</template>

<script lang="ts" setup>
import XEUtils from 'xe-utils';
import { ref, onMounted, reactive } from 'vue';
import { ElForm, FormRules } from 'element-plus';
import { useI18n } from 'vue-i18n';
import IconSelector from '/@/components/iconSelector/index.vue';
import { lazyLoadMenu, AddObj, UpdateObj } from '../../api';
import { successNotification } from '/@/utils/message';
import { MenuFormDataType, MenuTreeItemType, ComponentFileItem, APIResponseData } from '../../types';
import type Node from 'element-plus/es/components/tree/src/model/node';

const { t } = useI18n();
const activeMenuNameTab = ref('zhCn');

interface IProps {
	initFormData: Partial<MenuTreeItemType> | null;
	treeData: MenuTreeItemType[];
	cacheData: MenuTreeItemType[];
}

const defaultTreeProps: any = {
	children: 'children',
	label: 'name',
	value: 'id',
	isLeaf: (data: MenuTreeItemType[], node: Node) => {
		if (node?.data.hasChild) {
			return false;
		} else {
			return true;
		}
	},
};
const validateWebPath = (rule: any, value: string, callback: Function) => {
	let pattern = /^\/.*?/;
	const reg = pattern.test(value);
	if (reg) {
		callback();
	} else {
		callback(new Error(t('message.pages.menu.validation.pathRequired')));
	}
};

const validateLinkUrl = (rule: any, value: string, callback: Function) => {
	let pattern = /^\/.*?/;
	let patternUrl = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
	const reg = pattern.test(value) || patternUrl.test(value)
	if (reg) {
		callback();
	} else {
		callback(new Error(t('message.pages.menu.validation.linkUrlRequired')));
	}
};

const props = withDefaults(defineProps<IProps>(), {
	initFormData: () => null,
	treeData: () => [],
	cacheData: () => [],
});
const emit = defineEmits(['drawerClose']);

const formRef = ref<InstanceType<typeof ElForm>>();

const rules = reactive<FormRules>({
	web_path: [{ required: true, message: t('message.pages.menu.validation.pathRequired'), validator: validateWebPath, trigger: 'blur' }],
	name: [{ required: true, message: t('message.pages.menu.form.menuName') + t('message.pages.menu.validation.fieldNameRequired'), trigger: 'blur' }],
	component: [{ required: true, message: t('message.pages.menu.validation.componentRequired'), trigger: 'blur' }],
	component_name: [{ required: true, message: t('message.pages.menu.validation.componentNameRequired'), trigger: 'blur' }],
	link_url: [{ required: true, message: t('message.pages.menu.validation.linkUrlRequired'), validator: validateLinkUrl, trigger: 'blur' }],
});

let deptDefaultList = ref<MenuTreeItemType[]>([]);
let menuFormData = reactive<MenuFormDataType>({
	parent: '',
	name: '',
	name_en: '',
	name_zh_tw: '',
	component: '',
	web_path: '',
	icon: '',
	cache: true,
	status: true,
	visible: true,
	component_name: '',
	description: '',
	is_catalog: false,
	is_link: false,
	is_iframe: false,
	is_affix: false,
	link_url: ''
});
let menuBtnLoading = ref(false);

const setMenuFormData = () => {
	if (props.initFormData?.id) {
		menuFormData.id = props.initFormData?.id || '';
		menuFormData.name = props.initFormData?.name || '';
		menuFormData.name_en = props.initFormData?.name_en || '';
		menuFormData.name_zh_tw = props.initFormData?.name_zh_tw || '';
		menuFormData.parent = props.initFormData?.parent || '';
		menuFormData.component = props.initFormData?.component || '';
		menuFormData.web_path = props.initFormData?.web_path || '';
		menuFormData.icon = props.initFormData?.icon || '';
		menuFormData.status = !!props.initFormData.status;
		menuFormData.visible = !!props.initFormData.visible;
		menuFormData.cache = !!props.initFormData.cache;
		menuFormData.component_name = props.initFormData?.component_name || '';
		menuFormData.description = props.initFormData?.description || '';
		menuFormData.is_catalog = !!props.initFormData.is_catalog;
		menuFormData.is_link = !!props.initFormData.is_link;
		menuFormData.is_iframe = !!props.initFormData.is_iframe;
		menuFormData.is_affix = !!props.initFormData.is_affix;
		menuFormData.link_url = props.initFormData.link_url;
	}
};

const querySearch = (queryString: string, cb: any) => {
	const files: any = import.meta.glob('@views/**/*.vue');
	let fileLists: Array<any> = [];
	Object.keys(files).forEach((queryString: string) => {
		fileLists.push({
			label: queryString.replace(/(\.\/|\.vue)/g, ''),
			value: queryString.replace(/(\.\/|\.vue)/g, ''),
		});
	});
	const results = queryString ? fileLists.filter(createFilter(queryString)) : fileLists;
	// 统一去掉/src/views/前缀
	results.forEach((val) => {
		val.label = val.label.replace('/src/views/', '');
		val.value = val.value.replace('/src/views/', '');
	});
	cb(results);
};

const createFilter = (queryString: string) => {
	return (file: ComponentFileItem) => {
		return file.value.toLowerCase().indexOf(queryString.toLowerCase()) !== -1;
	};
};

/**
 * 树的懒加载
 */
const handleTreeLoad = (node: Node, resolve: Function) => {
	if (node.level !== 0) {
		lazyLoadMenu({ parent: node.data.id }).then((res: APIResponseData) => {
			resolve(XEUtils.filter(res.data, (i: MenuTreeItemType) => i.is_catalog));
		});
	}
};

const handleSubmit = () => {
	if (!formRef.value) return;
	formRef.value.validate(async (valid) => {
		if (!valid) return;
		try {
			let res;
			menuBtnLoading.value = true;
			if (menuFormData.id) {
        if (menuFormData.parent == undefined) {
          menuFormData.parent = null
        }
				res = await UpdateObj(menuFormData);
			} else {
				res = await AddObj(menuFormData);
			}
			if (res?.code === 2000) {
				successNotification(res.msg as string);
				handleCancel('submit');
			}
		} finally {
			menuBtnLoading.value = false;
		}
	});
};

defineExpose({
	handleSubmit
});

const handleCancel = (type: string = '') => {
	activeMenuNameTab.value = 'zhCn';
	emit('drawerClose', type);
	formRef.value?.resetFields();
};

/**
 * 初始化
 */
onMounted(async () => {
	props.treeData.map((item) => {
		if (item.is_catalog) {
			deptDefaultList.value.push(item);
		}
	});
	setMenuFormData();
});
</script>

<style lang="scss" scoped>
.menu-form-com {
	margin: 10px;
	overflow-y: auto;

	.menu-form-alert {
		color: #fff;
		line-height: 24px;
		padding: 8px 16px;
		margin-bottom: 20px;
		border-radius: 4px;
		background-color: var(--el-color-primary);
	}

	.menu-name-row {
		width: 100%;
	}
}
</style>
