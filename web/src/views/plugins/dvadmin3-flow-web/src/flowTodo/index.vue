<template>
    <fs-page>
        <fs-crud ref="crudRef" v-bind="crudBinding">
          <template #cell-rowHandle-left="scope">
            <el-button type="primary" size="small" @click="onHandle(scope)">处理</el-button>
          </template>
        </fs-crud>
      <flowDialog v-if="flowDialogShow" v-model="flowDialogShow" :items="rowItem" @handleSubmit="handleSubmit"></flowDialog>
    </fs-page>
</template>

<script lang="ts" setup>
import {ref, onMounted} from 'vue';
import {useFs} from '@fast-crud/fast-crud';
import {createCrudOptions} from './crud';
import flowDialog from "../components/flowDialog/index.vue"
const {crudBinding, crudRef, crudExpose} = useFs({createCrudOptions});

// 页面打开后获取列表数据
onMounted(() => {
    crudExpose.doRefresh();
});

const rowItem = ref()
const flowDialogShow = ref(false)
const onHandle = (scope) => {
  flowDialogShow.value = true
  rowItem.value = scope.row
}

const handleSubmit = () => {
  crudExpose.doRefresh();
}

</script>
