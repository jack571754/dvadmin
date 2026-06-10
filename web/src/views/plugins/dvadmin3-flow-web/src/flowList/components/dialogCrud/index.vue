<template>
  <el-dialog v-model="dialogTableVisible" append-to-body :title="flowInfo.name" width="80%" :close-on-click-modal="false" @close="onCancel">
    <div style="height: 70vh">
      <fs-crud ref="crudRef" v-bind="crudBinding"></fs-crud>
    </div>
  </el-dialog>

</template>

<script lang="ts" setup >
import {ref, onMounted, watch} from 'vue';
import {useFs} from '@fast-crud/fast-crud';
import {createCrudOptions} from './crud';
import * as api from './api'
import _ from "lodash-es";
const props = defineProps({
  dialogVisible: {
    type: Boolean,
    default: false
  },
  flowInfo:{
    type: Object,
    default: {}
  }
})
const context = ref({
})

const dialogTableVisible = ref(false);
const {crudBinding, crudRef, crudExpose,crudOptions,resetCrudOptions} = useFs({createCrudOptions,context});

const emit = defineEmits(['update:dialogVisible'])
watch(()=>props.dialogVisible,val=>{
  context.value = {
    flowInfo:props.flowInfo
  }
  if(val){
    initCrud()
  }
})

const onCancel = () => {
  dialogTableVisible.value = false
  emit('update:dialogVisible', false)
};

const initCrud = () => {
  const id = props.flowInfo.id
  api.GetCrudColumns(id).then(res=>{
    dialogTableVisible.value = true
    //合并新的crudOptions
    const newOptions = _.merge({},crudOptions, {
      columns: {
        ...res.data
      }
    });
    //重置crudBinding
    resetCrudOptions(newOptions);
    crudExpose.doRefresh();
  })

};

// 页面打开后获取列表数据
// onMounted(() => {
//   initCrud();
// });
</script>
