<template>
	<fs-page>
		<fs-crud ref="crudRef" v-bind="crudBinding"> </fs-crud>
	</fs-page>
</template>

<script lang="ts" setup name="productSpecSubmission">
import { onMounted } from 'vue';
import { useFs } from '@fast-crud/fast-crud';
import { createCrudOptions } from './crud';
import { GetPermission } from '/@/api/design_order/product_spec_submission';
import { handleColumnPermission } from '/@/utils/columnPermission';

const { crudBinding, crudRef, crudExpose, resetCrudOptions } = useFs({ createCrudOptions });

onMounted(async () => {
	// 注意：createCrudOptions 返回 { crudOptions: {...} } 包装，handleColumnPermission / resetCrudOptions
	// 需要内层 CrudOptions（含 columns/request），若传整个包装会导致 request 配置丢失、doRefresh 不发请求
	const refreshedOptions = createCrudOptions({ crudExpose }).crudOptions;
	// 设置列权限
	const newOptions = await handleColumnPermission(GetPermission, refreshedOptions, ['product_count', 'status']);
	// 重置crudBinding
	resetCrudOptions(newOptions);
	// 刷新
	crudExpose.doRefresh();
});
</script>
