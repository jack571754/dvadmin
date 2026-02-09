<script setup>
import {computed, onMounted, ref} from "vue";
import nodeMixin from "../NodeMixin";
import request from "../../../../api/request"

const props = defineProps({
  ...nodeMixin.props
})
const emit = defineEmits(nodeMixin.emits)
const _value = computed(nodeMixin.computed._value(props, emit))

const workFlowList = ref([])
const getWorkFlow = () => {
  request({
    url: '/api/dvadmin3_flow/flow_info/get_end_function_list/',
    method: 'get',
  })
    .then(res => {
      if (Array.isArray(res?.data)) {
        workFlowList.value = res.data
        return
      }
      if (Array.isArray(res?.data?.data)) {
        workFlowList.value = res.data.data
        return
      }
      if (Array.isArray(res)) {
        workFlowList.value = res
        return
      }
      workFlowList.value = []
    })
    .catch(() => {
      workFlowList.value = []
    })
}

onMounted(()=>{
  getWorkFlow()
})

</script>

<template>
<div style="margin-top: 20px">
  <el-alert type="error">允许用户绑定自定义的结束流程函数</el-alert>
  <el-form-item label="绑定结束流程函数" style="margin-top: 20px">
    <el-select v-model="_value.props.func">
      <el-option
        v-for="item in workFlowList"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
    <el-button type="text" @click="getWorkFlow">刷新</el-button>
  </el-form-item>
</div>
</template>

<style scoped>

</style>
