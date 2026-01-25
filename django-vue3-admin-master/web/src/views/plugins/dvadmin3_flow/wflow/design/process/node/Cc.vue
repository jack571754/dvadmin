<script setup>
import Node from "./base/Node.vue";
import {computed, ref} from "vue";
import nodeMixin from "../NodeMixin";

const props = defineProps({
  ...nodeMixin.props
})
const emit = defineEmits(nodeMixin.emits)
const _value = computed(nodeMixin.computed._value(props, emit))
const showErr = ref(false)
const errInfo = ref(null)

const content = computed(() => {
  let desc = '请设置抄送人';
  const prop = _value.value.props
  switch (prop.ruleType){
    case 'ASSIGN_USER':
      if (prop.assignUser.length === 0){
        desc = '请指定抄送人'
      }else {
        desc = `抄送 ${prop.assignUser.map(v => v.name).join('、')}`
      }
      break;
    case 'ROOT_SELECT':
      desc = '发起人提交流程时指定人'
      break;
    case 'LEADER':
      desc = '发起人的直属主管'
      break;
    case 'ASSIGN_DEPT':
      desc = `抄送部门[${prop.assignDept.dept.map(v => v.name).join('、')}]的主管`
      break
    case 'ASSIGN_ROLE':
      desc = `抄送具有角色[${prop.assignRole.map(v => v.name).join('、')}]的人员`
      break
  }
  return desc
})

defineExpose({ validate })
function validate(errs){
  showErr.value = true
  const prop = _value.value.props
  switch (prop.ruleType){
    case 'ASSIGN_USER':
      if (prop.assignUser.length === 0){
        errInfo.value = '未指定具体抄送人'
        errs.push(`${_value.value.name} 节点未指定抄送人`)
        return
      }
      break
    case 'ASSIGN_DEPT':
      if (prop.assignDept.dept.length === 0){
        errInfo.value = '未设置抄送部门'
        errs.push(`${_value.value.name} 节点未设置抄送部门`)
        return
      }
      break
    case 'ASSIGN_ROLE':
      if (prop.assignRole.length === 0){
        errInfo.value = '未设置抄送角色'
        errs.push(`${_value.value.name} 节点未设置抄送角色`)
        return
      }
      break
  }
  showErr.value = false
}
</script>

<template>
<node v-model="_value" :readonly="readonly" :show-error="showErr"
      :error-info="errInfo" header-color="#5994F3" header-icon="Promotion"
      :content="content" @select="emit('select', modelValue)"
      @insertNode="type => emit('insertNode', branch, index, type)"
      @delete="emit('delete', branch, index)"
/>
</template>

<style scoped>

</style>
