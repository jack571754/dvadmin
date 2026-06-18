<template>
	<fs-page>
		<fs-crud ref="crudRef" v-bind="crudBinding"> </fs-crud>
	</fs-page>
</template>

<script lang="ts" setup name="productSpecSubmission">
import { ref, onMounted } from 'vue';
import { useFs } from '@fast-crud/fast-crud';
import { createCrudOptions } from './crud';
import { GetPermission } from '/@/api/design_order/product_spec_submission';
import { handleColumnPermission } from '/@/utils/columnPermission';
import { useProductSpecTemplateStore } from '/@/stores/productSpecTemplate';

const { crudBinding, crudRef, crudExpose, crudOptions, resetCrudOptions } = useFs({ createCrudOptions });

onMounted(async () => {
	// 先加载模板表（内置 + 自定义），供 template_type 下拉使用
	const templateStore = useProductSpecTemplateStore();
	await templateStore.load();
	// 重新构建 crudOptions（此时 store 已加载，template_type dict 含自定义模板）
	const refreshedOptions = createCrudOptions({ crudExpose });
	// 设置列权限
	const newOptions = await handleColumnPermission(GetPermission, refreshedOptions);
	// 重置crudBinding
	resetCrudOptions(newOptions);
	// 刷新
	crudExpose.doRefresh();
});
</script>
