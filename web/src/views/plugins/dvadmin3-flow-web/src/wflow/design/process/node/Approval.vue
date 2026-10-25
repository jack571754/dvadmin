<script setup>
import Node from "./base/Node.vue";
import {computed, ref} from "vue";
import nodeMixin from "../NodeMixin.js";

const props = defineProps({
  ...nodeMixin.props
})
const emit = defineEmits(nodeMixin.emits)
const _value = computed(nodeMixin.computed._value(props, emit))
const showErr = ref(false)
const errInfo = ref(null)

defineExpose({ validate })

const content = computed(() => {
  let desc = '请设置审批人';
  const prop = _value.value.props
  switch (prop.mode){
    case 'AUTO_REFUSE':
      desc = '系统自动拒绝流程🚫'
      break;
    case 'AUTO_PASS':
      desc = '系统自动通过流程✔️'
      break;
    case 'USER':
      switch (prop.ruleType){
        case 'ASSIGN_USER':
          if (prop.assignUser.length === 0){
            desc = '请指定审批人'
          }else {
            desc = prop.assignUser.map(v => v.name).join('、')
          }
          break
        case 'ROOT_SELECT':
          desc = '发起人提交流程时指定人'
          break
        case 'ROOT_SELF':
          desc = '发起人自己审批'
          break
        case 'LEADER':
          if (prop.leader.level > 1){
            desc = `发起人的第${prop.leader.level}级部门主管`
          }else {
            desc = '发起人的直属主管'
          }
          break
        case 'LEADER_TOP':
          desc = '逐级部门主管审批'
          break
        case 'ASSIGN_DEPT':
          desc = `部门[${prop.assignDept.dept.map(v => v.name).join('、')}]的主管审批`
          break
        case 'ASSIGN_ROLE':
          desc = `具有角色[${prop.assignRole.map(v => v.name).join('、')}]的人员审批`
          break
        case 'CUSTOM_FUNCTION':
          desc = `通过动态函数获取的人员审批`
          break
      }
      break;
  }
  return desc
})

/**
 * 节点规则校验函数
 * @param errs 错误信息
 */
function validate(errs){
  const prop = _value.value.props
  showErr.value = true
  if (prop.mode === 'USER'){
    switch (prop.ruleType){
      case 'ASSIGN_USER':
        if (prop.assignUser.length === 0){
          errInfo.value = '未指定具体审批人'
          errs.push(`${_value.value.name} 节点未指定审批人`)
          return
        }
        break
      case 'ASSIGN_DEPT':
        if (prop.assignDept.dept.length === 0){
          errInfo.value = '未设置部门'
          errs.push(`${_value.value.name} 节点未设置部门`)
          return
        }
        break
      case 'ASSIGN_ROLE':
        if (prop.assignRole.length === 0){
          errInfo.value = '未设置审批角色'
          errs.push(`${_value.value.name} 节点未设置角色`)
          return
        }
        break
      case 'CUSTOM_FUNCTION':
        if(prop.customFunction === null || prop.customFunction === ''){
          errInfo.value = '未设置审批人函数'
          errs.push(`${_value.value.name} 节点未设置审批人函数`)
          return
        }
        break
    }
    if (prop.noUserHandler.type === 'TO_USER' && prop.noUserHandler.assigned.length === 0){
      errInfo.value = '未指定为空转交人'
      errs.push(`${_value.value.name} 节点未指定为空时的转交人`)
      return
    }
  }
  showErr.value = false
}

</script>

<template>
<node v-model="_value" :readonly="readonly" :show-error="showErr"
      :error-info="errInfo" header-color="#EC8151" header-icon="stamp"
      :content="content" @select="emit('select', modelValue)"
      @insertNode="type => emit('insertNode', branch, index, type)"
      @delete="emit('delete', branch, index)"
/>
</template>

<style scoped>

</style>
