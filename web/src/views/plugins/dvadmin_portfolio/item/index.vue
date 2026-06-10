<template>
  <fs-page>
    <fs-crud ref="crudRef" v-bind="crudBinding" />
  </fs-page>
</template>

<script lang="ts" setup name="portfolioItem">
import { onMounted } from 'vue';
import { useFs } from '@fast-crud/fast-crud';
import { createCrudOptions } from './crud';

const { crudBinding, crudRef, crudExpose } = useFs({ createCrudOptions });

onMounted(() => {
  crudExpose.doRefresh();
});
</script>
