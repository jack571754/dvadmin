<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import request from '../../api/request'
import {FormComponents} from "../../wflow/design/form/FormComponents";
import componentMixin from "../../wflow/design/form/FormComponentMixin";
import {ElMessage} from "element-plus";
const props = defineProps({
  ...componentMixin.props,
  dialogVisible: {
    type: Boolean,
    default: false
  },
  flowInfo:{
    type: Object,
    default: {}
  }
})
const emit = defineEmits([...componentMixin.emits,'update:dialogVisible'])
const _value = computed(componentMixin.computed._value(props, emit))
const dialogFormVisible = ref(false)
watch(()=>props.dialogVisible,val=>{
  if(val){
    getFlowInfo()
  }
})

const config = ref()
const mode = ref('normal')
const getFlowInfo = ()=>{
  request({
    url: `/api/dvadmin3_flow/flow_info/${props.flowInfo.id}/`,
    method: 'get',
  }).then(res=>{
    const {data} = res
    config.value = data.formConf
    dialogFormVisible.value = true
  })
}



const formData = ref<any>({})
const onCancel = ()=>{
  dialogFormVisible.value = false
  emit('update:dialogVisible', false)
  formData.value = {}
}
const submitFormRef = ref()
const onSubmit = ()=>{

  submitFormRef.value.validate((valid, fields)=>{
    if (valid) {
      request({
        url: `/api/dvadmin3_flow/flow_data/${props.flowInfo.id}/submit_flow_data/`,
        method: 'post',
        data: formData.value,
      }).then(res=>{
        const {msg} = res
        ElMessage.success(msg)
        onCancel()
      })
    } else {
      ElMessage.error('请检查表单内容')
      console.log('error submit!', fields)
    }
  })
}

const onBlur = ()=>{
  submitFormRef.value.clearValidate()
}

</script>

<template>
  <el-dialog  v-model="dialogFormVisible" destroy-on-close  append-to-body :title="flowInfo.name" width="800" :close-on-click-modal="false" @close="onCancel">
    <el-form ref="submitFormRef" :label-width="config.conf.labelWidth" :size="config.conf.size"
             :label-position="config.conf.labelPosition" class="w-form-render" :model="formData">
      <template v-for="(cp, i) in config.components" :key="cp.type + i">
        <el-form-item :label="cp.name" v-if="!cp.props.isContainer" :required="cp.props.required"
                      :class="{'w-form-cp-nlb':cp.props.hideLabel}" :prop="cp.key">
          <component :is="FormComponents[cp.type]" :mode="mode" :config="cp" v-model="formData[cp.key]"  @onBlur="onBlur"  />
        </el-form-item>
        <component v-else :is="FormComponents[cp.type]" :mode="mode" v-model="formData" :config="cp"/>
      </template>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onCancel">关闭</el-button>
        <el-button type="primary" @click="onSubmit">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">

</style>