<template>
	<fs-page>
		<fs-crud ref="crudRef" v-bind="crudBinding" />
	</fs-page>
</template>

<script lang="ts" setup name="specTemplate">
import { onMounted } from 'vue';
import { useFs } from '@fast-crud/fast-crud';

import { GetPermission } from '/@/api/design_order/spec_template';
import { handleColumnPermission } from '/@/utils/columnPermission';
import { createCrudOptions } from './crud';

const {
	crudBinding,
	crudRef,
	crudExpose,
	crudOptions,
	resetCrudOptions,
} = useFs({ createCrudOptions });

onMounted(async () => {
	const permittedOptions = await handleColumnPermission(GetPermission, crudOptions);
	resetCrudOptions(permittedOptions);
	crudExpose.doRefresh();
});
</script>
