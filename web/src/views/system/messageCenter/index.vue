<template>
	<fs-page>
		<fs-crud ref="crudRef" v-bind="crudBinding">
			<template #header-middle>
				<el-tabs v-model="tabActivted" @tab-click="onTabClick">
				<el-tab-pane :label="$t('message.pages.messageCenter.tabs.myPublish')" name="send"></el-tab-pane>
					<el-tab-pane :label="$t('message.pages.messageCenter.tabs.myReceive')" name="receive"></el-tab-pane>
				</el-tabs>
			</template>
		</fs-crud>
	</fs-page>
</template>

<script lang="ts" setup name="messageCenter">
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFs } from '@fast-crud/fast-crud';
import createCrudOptions from './crud';
import { useThemeConfig } from '/@/stores/themeConfig';
import { storeToRefs } from 'pinia';

const { themeConfig } = storeToRefs(useThemeConfig());

// tab选择
const tabActivted = ref('send');
const onTabClick = (tab: any) => {
	const { paneName } = tab;
	tabActivted.value = paneName;
	crudExpose.doRefresh();
};

const context: any = { tabActivted }; //将 tabActivted 通过context传递给crud.tsx

const { crudRef, crudBinding, crudExpose, resetCrudOptions } = useFs({ createCrudOptions, context });

// 语言切换时重新构建 crud options
watch(
	() => themeConfig.value.globalI18n,
	() => {
		resetCrudOptions();
	}
);

// 页面打开后获取列表数据
onMounted(() => {
	crudExpose.doRefresh();
});
</script>
