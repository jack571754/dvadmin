<template>
	<fs-page>
		<fs-crud ref="crudRef" v-bind="crudBinding"> </fs-crud>
		<subDict ref="subDictRef"></subDict>
	</fs-page>
</template>

<script lang="ts" setup name="dictionary">
import { ref, onMounted, defineAsyncComponent, watch } from 'vue';
import { useFs } from '@fast-crud/fast-crud';
import { createCrudOptions } from './crud';
import { useThemeConfig } from '/@/stores/themeConfig';
import { storeToRefs } from 'pinia';

const { themeConfig } = storeToRefs(useThemeConfig());
const subDict = defineAsyncComponent(() => import('./subDict/index.vue'));
const subDictRef = ref();

const { crudBinding, crudRef, crudExpose, resetCrudOptions } = useFs({ createCrudOptions, context: { subDictRef } });

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
