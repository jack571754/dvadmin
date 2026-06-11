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

const { crudBinding, crudRef, crudExpose, crudOptions, resetCrudOptions } = useFs({ createCrudOptions });

onMounted(async () => {
	// 设置列权限
	const newOptions = await handleColumnPermission(GetPermission, crudOptions);
	// 重置crudBinding
	resetCrudOptions(newOptions);
	// 刷新
	crudExpose.doRefresh();
});
</script>
